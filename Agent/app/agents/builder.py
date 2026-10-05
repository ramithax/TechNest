from app.graph.state import AgentState
from app.tools.product_tools import (
    ProductSearchTool,
    ProductSearchInput,
    ProductLookupTool
)


class BuildAgent:

    BASE_CATEGORIES = [
        "Processor",
        "Motherboard",
        "RAM",
        "Storage",
        "PSU",
        "Case"
    ]

    OPTIONAL_CATEGORIES = [
        "GPU",
        "Cooler"
    ]

    ALL_CATEGORIES = [
        "Processor",
        "Motherboard",
        "RAM",
        "GPU",
        "Storage",
        "PSU",
        "Case",
        "Cooler"
    ]

    def __init__(self):
        self.product_search_tool = ProductSearchTool()
        self.product_lookup_tool = ProductLookupTool()

    async def run(
        self,
        state: AgentState
    ) -> AgentState:

        try:
            analysis = state.get(
                "analysis",
                {}
            )

            # =========================================================
            # LOAD PRODUCT CATALOGUE
            # =========================================================

            catalogue = state.get(
                "catalogue",
                []
            )

            if not catalogue:
                print(
                    "[BUILD AGENT] Catalogue not found in state."
                )

                print(
                    "[BUILD AGENT] Loading products from backend..."
                )

                product_result = (
                    await self.product_search_tool.execute(
                        ProductSearchInput()
                    )
                )

                if not product_result.success:
                    print(
                        "[BUILD AGENT] Failed to load products:",
                        product_result.error
                    )

                    return self._build_unavailable(
                        state,
                        "I couldn't load the available products "
                        "right now. Please try again in a moment.",
                        reason="PRODUCT_CATALOGUE_ERROR"
                    )

                catalogue = product_result.products

                print(
                    "[BUILD AGENT] Products loaded from backend:",
                    len(catalogue)
                )

            if not catalogue:
                return self._build_unavailable(
                    state,
                    "I couldn't create the PC build because "
                    "there are currently no products available.",
                    reason="NO_PRODUCTS"
                )

            state = {
                **state,
                "catalogue": catalogue
            }

            # =========================================================
            # BUDGET
            # =========================================================

            budget = analysis.get(
                "budget"
            )

            if budget is None:
                return self._build_unavailable(
                    state,
                    "A valid budget was not provided.",
                    reason="INVALID_BUDGET"
                )

            try:
                budget = float(budget)
            except (
                TypeError,
                ValueError
            ):
                return self._build_unavailable(
                    state,
                    "The provided budget is invalid.",
                    reason="INVALID_BUDGET"
                )

            print(
                "[BUILD AGENT] Analysis:",
                analysis
            )

            # =========================================================
            # BUILD REQUIREMENTS
            # =========================================================

            requirements = self._get_build_requirements(
                analysis
            )

            print(
                "[BUILD AGENT] Build requirements:",
                requirements
            )

            required_categories = list(
                self.BASE_CATEGORIES
            )

            if requirements["gpu_required"]:
                required_categories.append(
                    "GPU"
                )

            if requirements["cooler_required"]:
                required_categories.append(
                    "Cooler"
                )

            print(
                "[BUILD AGENT] Required categories:",
                required_categories
            )

            # =========================================================
            # GROUP PRODUCTS BY CATEGORY
            # =========================================================

            products_by_category = {
                category: []
                for category in self.ALL_CATEGORIES
            }

            for product in catalogue:

                category = self._normalize_category(
                    product.get(
                        "category",
                        ""
                    )
                )

                if category not in products_by_category:
                    continue

                if not product.get(
                    "isActive",
                    True
                ):
                    continue

                stock = product.get(
                    "stockQuantity",
                    0
                )

                try:
                    stock = int(stock)
                except (
                    TypeError,
                    ValueError
                ):
                    stock = 0

                if stock <= 0:
                    continue

                products_by_category[
                    category
                ].append(product)

            # =========================================================
            # CANDIDATE POOL
            # =========================================================

            candidates = {}

            for category in self.ALL_CATEGORIES:

                category_products = (
                    products_by_category[
                        category
                    ]
                )

                category_products = sorted(
                    category_products,
                    key=self._get_price
                )

                if category in [
                    "Processor",
                    "Motherboard",
                    "RAM",
                    "GPU",
                    "PSU"
                ]:
                    limit = 10
                else:
                    limit = 8

                candidates[category] = (
                    category_products[:limit]
                )

            # =========================================================
            # CATEGORY COUNTS
            # =========================================================

            category_counts = {
                category: len(
                    candidates.get(
                        category,
                        []
                    )
                )
                for category in required_categories
            }

            print(
                "[BUILD AGENT] Category counts:",
                category_counts
            )

            # =========================================================
            # CHECK MISSING REQUIRED CATEGORIES
            # =========================================================

            missing_catalogue_categories = [
                category
                for category in required_categories
                if not candidates.get(category)
            ]

            if missing_catalogue_categories:

                if len(
                    missing_catalogue_categories
                ) == 1:

                    message = (
                        "I couldn't create this PC build because "
                        "the required component "
                        f"({missing_catalogue_categories[0]}) "
                        "is currently out of stock. "
                        "Please try again later or adjust "
                        "your requirements."
                    )

                else:

                    message = (
                        "I couldn't create this PC build because "
                        "the required components "
                        f"({', '.join(missing_catalogue_categories)}) "
                        "are currently out of stock. "
                        "Please try again later or adjust "
                        "your requirements."
                    )

                return self._build_unavailable(
                    state,
                    message,
                    reason="OUT_OF_STOCK",
                    requirements=requirements,
                    budget=budget,
                    required_categories=required_categories
                )

            candidate_count = sum(
                len(items)
                for items in candidates.values()
            )

            print(
                "[BUILD AGENT] Candidate products:",
                candidate_count
            )

            # =========================================================
            # CHEAPEST POSSIBLE BUILD CHECK
            # =========================================================

            cheapest_total = (
                self._get_cheapest_build_total(
                    candidates,
                    required_categories
                )
            )

            if cheapest_total is not None:

                print(
                    "[BUILD AGENT] Cheapest possible "
                    "required build: "
                    f"Rs. {cheapest_total:,.2f}"
                )

                if cheapest_total > budget:

                    message = (
                        self._get_budget_failure_message(
                            budget=budget,
                            cheapest_total=cheapest_total,
                            requirements=requirements
                        )
                    )

                    print(
                        "[BUILD AGENT] Build unavailable:",
                        message
                    )

                    return self._build_unavailable(
                        state,
                        message,
                        reason="BUDGET",
                        requirements=requirements,
                        budget=budget,
                        required_categories=required_categories,
                        cheapest_total=cheapest_total
                    )

            # =========================================================
            # ASK LLM FOR BUILD
            # =========================================================

            print(
                "[BUILD AGENT] Catalogue sent to LLM: "
                f"{candidate_count} products"
            )

            print(
                "[BUILD AGENT] Generating PC configuration..."
            )

            llm_result = await self._llm_select_build(
                candidates=candidates,
                analysis=analysis,
                budget=budget,
                required_categories=required_categories
            )

            selected_products = (
                llm_result
                if llm_result
                else []
            )

            print(
                "[BUILD AGENT] LLM returned "
                f"{len(selected_products)} products."
            )

            # =========================================================
            # NORMALIZE LLM RESULT
            # =========================================================

            selected_summaries = []
            selected_ids = set()
            total_amount = 0.0

            catalogue_by_id = {}

            for product_item in catalogue:

                try:
                    product_id = int(
                        product_item.get(
                            "id"
                        )
                    )
                except (
                    TypeError,
                    ValueError
                ):
                    continue

                catalogue_by_id[
                    product_id
                ] = product_item

            for item in selected_products:

                try:
                    product_id = int(
                        item.get(
                            "product_id"
                        )
                        or item.get(
                            "id"
                        )
                    )
                except (
                    TypeError,
                    ValueError
                ):
                    continue

                if product_id in selected_ids:
                    continue

                product = catalogue_by_id.get(
                    product_id
                )

                if product is None:
                    continue

                category = self._normalize_category(
                    product.get(
                        "category",
                        ""
                    )
                )

                unit_price = self._get_price(
                    product
                )

                selected_ids.add(
                    product_id
                )

                total_amount += unit_price

                selected_summaries.append({
                    "product_id": product_id,
                    "name": product.get(
                        "name",
                        ""
                    ),
                    "category": category,
                    "brand": product.get(
                        "brand",
                        ""
                    ),
                    "unit_price": unit_price,
                    "reason": item.get(
                        "reason",
                        ""
                    )
                })

            total_amount = round(
                total_amount,
                2
            )

            print(
                "[BUILD AGENT] Selected IDs:",
                list(selected_ids)
            )

            print(
                "[BUILD AGENT] Build total: "
                f"Rs. {total_amount:,.2f}"
            )

            print(
                "[BUILD AGENT] Budget: "
                f"Rs. {budget:,.2f}"
            )

            # =========================================================
            # EMPTY LLM RESULT
            # =========================================================

            if not selected_summaries:

                print(
                    "[BUILD AGENT WARNING] "
                    "LLM did not return a valid build."
                )

                print(
                    "[BUILD AGENT] Trying deterministic fallback."
                )

                fallback = self._deterministic_build(
                    candidates,
                    analysis,
                    budget
                )

                if fallback is None:

                    message = (
                        "I couldn't create a suitable PC build "
                        "using the components currently in stock. "
                        "Please try a different budget or "
                        "performance level."
                    )

                    return self._build_unavailable(
                        state,
                        message,
                        reason="NO_VALID_BUILD",
                        requirements=requirements,
                        budget=budget,
                        required_categories=required_categories
                    )

                selected_summaries, total_amount = (
                    self._fallback_to_summaries(
                        fallback,
                        catalogue_by_id
                    )
                )

            # =========================================================
            # BUDGET CHECK
            # =========================================================

            if total_amount > budget:

                print(
                    "[BUILD AGENT WARNING] "
                    "LLM build exceeds budget."
                )

                print(
                    "[BUILD AGENT] Trying "
                    "compatibility-aware deterministic fallback."
                )

                fallback = self._deterministic_build(
                    candidates,
                    analysis,
                    budget
                )

                if fallback is None:

                    message = (
                        self._get_budget_failure_message(
                            budget=budget,
                            cheapest_total=cheapest_total,
                            requirements=requirements
                        )
                    )

                    print(
                        "[BUILD AGENT] Build unavailable:",
                        message
                    )

                    return self._build_unavailable(
                        state,
                        message,
                        reason="BUDGET",
                        requirements=requirements,
                        budget=budget,
                        required_categories=required_categories,
                        cheapest_total=cheapest_total
                    )

                selected_summaries, total_amount = (
                    self._fallback_to_summaries(
                        fallback,
                        catalogue_by_id
                    )
                )

                print(
                    "[BUILD AGENT] Fallback build total: "
                    f"Rs. {total_amount:,.2f}"
                )

            # =========================================================
            # FINAL REQUIRED CATEGORY CHECK
            # =========================================================

            final_categories = {
                self._normalize_category(
                    item["category"]
                )
                for item in selected_summaries
            }

            required_final_categories = list(
                self.BASE_CATEGORIES
            )

            if requirements["gpu_required"]:
                required_final_categories.append(
                    "GPU"
                )

            if requirements["cooler_required"]:
                required_final_categories.append(
                    "Cooler"
                )

            missing_final_categories = [
                category
                for category in required_final_categories
                if category not in final_categories
            ]

            # =========================================================
            # REPAIR INVALID LLM BUILD
            # =========================================================

            if missing_final_categories:

                print(
                    "[BUILD AGENT WARNING] "
                    "LLM build is missing required categories:",
                    missing_final_categories
                )

                print(
                    "[BUILD AGENT] Trying deterministic fallback "
                    "because required categories are missing."
                )

                fallback = self._deterministic_build(
                    candidates,
                    analysis,
                    budget
                )

                if fallback is None:

                    message = (
                        "I couldn't create a complete PC build "
                        "because a suitable combination of the "
                        "required components is not currently "
                        "available within your budget."
                    )

                    return self._build_unavailable(
                        state,
                        message,
                        reason="NO_VALID_BUILD",
                        requirements=requirements,
                        budget=budget,
                        required_categories=required_final_categories
                    )

                selected_summaries, total_amount = (
                    self._fallback_to_summaries(
                        fallback,
                        catalogue_by_id
                    )
                )

                print(
                    "[BUILD AGENT] Fallback build total: "
                    f"Rs. {total_amount:,.2f}"
                )

            # =========================================================
            # FINAL BUDGET CHECK
            # =========================================================

            if total_amount > budget:

                message = (
                    self._get_budget_failure_message(
                        budget=budget,
                        cheapest_total=cheapest_total,
                        requirements=requirements
                    )
                )

                print(
                    "[BUILD AGENT] Build unavailable:",
                    message
                )

                return self._build_unavailable(
                    state,
                    message,
                    reason="BUDGET",
                    requirements=requirements,
                    budget=budget,
                    required_categories=required_final_categories,
                    cheapest_total=cheapest_total
                )

            # =========================================================
            # FINAL CATEGORY CHECK
            # =========================================================

            final_categories = {
                self._normalize_category(
                    item["category"]
                )
                for item in selected_summaries
            }

            missing_final_categories = [
                category
                for category in required_final_categories
                if category not in final_categories
            ]

            if missing_final_categories:

                message = (
                    "I couldn't create a complete PC build "
                    "because the following required components "
                    "could not be selected: "
                    + ", ".join(
                        missing_final_categories
                    )
                    + "."
                )

                return self._build_unavailable(
                    state,
                    message,
                    reason="MISSING_COMPONENTS",
                    requirements=requirements,
                    budget=budget,
                    required_categories=required_final_categories
                )

            # =========================================================
            # CREATE BUILD RESULT
            # =========================================================

            build = {
                "products": selected_summaries,
                "total_amount": round(
                    total_amount,
                    2
                ),
                "budget": budget,
                "required_categories": required_final_categories,
                "requirements": requirements
            }

            print(
                "[BUILD AGENT] Build created successfully."
            )

            print(
                "[BUILD AGENT] Final total: "
                f"Rs. {total_amount:,.2f}"
            )

            completed_steps = [
                *state.get(
                    "completed_steps",
                    []
                ),
                {
                    "agent": "build_agent",
                    "step": "build_generation",
                    "status": "completed"
                }
            ]

            return {
                **state,
                "build": build,
                "current_agent": "build_agent",
                "current_step": "BUILD_CREATED",
                "status": "BUILD_CREATED",
                "user_message": (
                    "Your PC build has been created successfully."
                ),
                "completed_steps": completed_steps
            }

        except Exception as ex:

            print(
                f"[BUILD AGENT ERROR] {str(ex)}"
            )

            return {
                **state,
                "current_agent": "build_agent",
                "current_step": "BUILD_FAILED",
                "status": "FAILED_SAFE",
                "errors": [
                    *state.get(
                        "errors",
                        []
                    ),
                    f"Build agent failed: {str(ex)}"
                ]
            }

    # =============================================================
    # BUILD UNAVAILABLE
    # =============================================================

    def _build_unavailable(
        self,
        state,
        message,
        reason="NO_VALID_BUILD",
        requirements=None,
        budget=None,
        required_categories=None,
        cheapest_total=None
    ):

        print(
            "[BUILD AGENT] Build unavailable."
        )

        print(
            "[BUILD AGENT] Reason:",
            reason
        )

        print(
            "[BUILD AGENT] Message:",
            message
        )

        return {
            **state,
            "build": None,
            "current_agent": "build_agent",
            "current_step": "BUILD_UNAVAILABLE",
            "status": "BUILD_UNAVAILABLE",
            "user_message": message,
            "build_message": message,
            "build_failure_reason": reason,
            "build_requirements": requirements or {},
            "build_budget": budget,
            "required_categories": (
                required_categories or []
            ),
            "cheapest_possible_total": cheapest_total,
            "errors": []
        }

    # =============================================================
    # BUDGET FAILURE MESSAGE
    # =============================================================

    def _get_budget_failure_message(
        self,
        budget,
        cheapest_total,
        requirements
    ):

        if cheapest_total is not None:

            if requirements.get("gaming"):

                return (
                    f"We couldn't create a suitable gaming "
                    f"PC within your Rs. {budget:,.0f} budget "
                    "using the components currently in stock. "
                    f"The cheapest available combination "
                    f"starts at approximately "
                    f"Rs. {cheapest_total:,.0f}. "
                    "Please increase your budget or choose "
                    "a lower performance level."
                )

            if requirements.get("ai_ml"):

                return (
                    f"We couldn't create a suitable AI/ML "
                    f"PC within your Rs. {budget:,.0f} budget "
                    "using the components currently in stock. "
                    f"The cheapest available combination "
                    f"starts at approximately "
                    f"Rs. {cheapest_total:,.0f}. "
                    "Please increase your budget."
                )

            if requirements.get("heavy_work"):

                return (
                    f"We couldn't create a suitable PC for "
                    f"your workload within your Rs. "
                    f"{budget:,.0f} budget using the components "
                    "currently in stock. "
                    f"The cheapest available combination "
                    f"starts at approximately "
                    f"Rs. {cheapest_total:,.0f}. "
                    "Please increase your budget or reduce "
                    "the performance requirements."
                )

            return (
                f"We couldn't create a suitable PC within "
                f"your Rs. {budget:,.0f} budget using the "
                "components currently in stock. "
                f"The cheapest available combination "
                f"starts at approximately "
                f"Rs. {cheapest_total:,.0f}. "
                "Please increase your budget."
            )

        return (
            f"We couldn't create a suitable PC within your "
            f"Rs. {budget:,.0f} budget using the components "
            "currently in stock. Please increase your budget "
            "or choose a lower performance level."
        )

    # =============================================================
    # CHEAPEST BUILD TOTAL
    # =============================================================

    def _get_cheapest_build_total(
        self,
        candidates,
        required_categories
    ):

        total = 0.0

        for category in required_categories:

            options = candidates.get(
                category,
                []
            )

            if not options:
                return None

            cheapest = min(
                options,
                key=self._get_price
            )

            total += self._get_price(
                cheapest
            )

        return round(
            total,
            2
        )

    # =============================================================
    # FALLBACK TO SUMMARIES
    # =============================================================

    def _fallback_to_summaries(
        self,
        fallback,
        catalogue_by_id
    ):

        selected_summaries = []
        total_amount = 0.0

        for item in fallback.products:

            product_id = int(
                item.product_id
            )

            product = catalogue_by_id.get(
                product_id
            )

            if product is None:
                raise ValueError(
                    f"Fallback product "
                    f"{product_id} not found."
                )

            unit_price = self._get_price(
                product
            )

            total_amount += unit_price

            selected_summaries.append({
                "product_id": product_id,
                "name": product.get(
                    "name",
                    ""
                ),
                "category": self._normalize_category(
                    product.get(
                        "category",
                        item.category
                    )
                ),
                "brand": product.get(
                    "brand",
                    ""
                ),
                "unit_price": unit_price,
                "reason": item.reason
            })

        return (
            selected_summaries,
            round(
                total_amount,
                2
            )
        )

    # =============================================================
    # BUILD REQUIREMENTS
    # =============================================================

    def _get_build_requirements(
        self,
        analysis
    ):

        text = " ".join([
            str(
                analysis.get(
                    "use_case",
                    ""
                )
            ),
            str(
                analysis.get(
                    "gaming_requirements",
                    ""
                )
            ),
            str(
                analysis.get(
                    "productivity_requirements",
                    ""
                )
            ),
            str(
                analysis.get(
                    "performance_expectations",
                    ""
                )
            ),
            " ".join(
                str(x)
                for x in analysis.get(
                    "special_requirements",
                    []
                )
            )
        ]).lower()

        gaming = any(
            word in text
            for word in [
                "gaming",
                "game",
                "gamer",
                "esports",
                "fps",
                "144hz",
                "high refresh"
            ]
        )

        ai_ml = any(
            word in text
            for word in [
                "ai",
                "machine learning",
                "deep learning",
                "ml",
                "cuda",
                "tensorflow",
                "pytorch",
                "llm",
                "model training"
            ]
        )

        heavy_work = any(
            word in text
            for word in [
                "video editing",
                "3d rendering",
                "rendering",
                "content creation",
                "heavy productivity",
                "professional editing"
            ]
        )

        lightweight = any(
            word in text
            for word in [
                "lightweight",
                "daily use",
                "daily activities",
                "day-to-day",
                "day to day",
                "office",
                "web browsing",
                "browsing",
                "basic use",
                "general use",
                "general daily use"
            ]
        )

        gpu_required = (
            gaming
            or ai_ml
        )

        gpu_preferred = (
            gaming
            or ai_ml
            or heavy_work
        )

        cooler_required = (
            gaming
            or ai_ml
            or heavy_work
        )

        return {
            "gaming": gaming,
            "ai_ml": ai_ml,
            "heavy_work": heavy_work,
            "lightweight": lightweight,
            "gpu_required": gpu_required,
            "gpu_preferred": gpu_preferred,
            "cooler_required": cooler_required
        }

    # =============================================================
    # NORMALIZE CATEGORY
    # =============================================================

    def _normalize_category(
        self,
        category
    ):

        if not category:
            return ""

        value = str(
            category
        ).strip().lower()

        mappings = {
            "cpu": "Processor",
            "processor": "Processor",

            "motherboard": "Motherboard",
            "mainboard": "Motherboard",

            "ram": "RAM",
            "memory": "RAM",

            "gpu": "GPU",
            "graphics card": "GPU",
            "graphics": "GPU",
            "video card": "GPU",

            "storage": "Storage",
            "ssd": "Storage",
            "hdd": "Storage",

            "psu": "PSU",
            "power supply": "PSU",
            "power supply unit": "PSU",

            "case": "Case",
            "computer case": "Case",

            "cooler": "Cooler",
            "cpu cooler": "Cooler",
            "cpu-cooler": "Cooler",
            "cooling": "Cooler"
        }

        return mappings.get(
            value,
            str(category).strip()
        )

    # =============================================================
    # LLM BUILD SELECTION
    # =============================================================

    async def _llm_select_build(
        self,
        candidates,
        analysis,
        budget,
        required_categories
    ):

        """
        The deterministic builder is currently responsible
        for selecting the final compatible build.

        This keeps the workflow reliable while the LLM
        selection layer is being developed.
        """

        return []

    # =============================================================
    # DETERMINISTIC FALLBACK
    # =============================================================

    def _deterministic_build(
        self,
        candidates,
        analysis,
        budget
    ):

        requirements = self._get_build_requirements(
            analysis
        )

        required_categories = list(
            self.BASE_CATEGORIES
        )

        if requirements["gpu_required"]:
            required_categories.append(
                "GPU"
            )

        if requirements["cooler_required"]:
            required_categories.append(
                "Cooler"
            )

        print(
            "[BUILD AGENT] Deterministic required "
            "categories:",
            required_categories
        )

        # =========================================================
        # GET CATEGORY OPTIONS
        # =========================================================

        processors = candidates.get(
            "Processor",
            []
        )

        motherboards = candidates.get(
            "Motherboard",
            []
        )

        rams = candidates.get(
            "RAM",
            []
        )

        storages = candidates.get(
            "Storage",
            []
        )

        psus = candidates.get(
            "PSU",
            []
        )

        cases = candidates.get(
            "Case",
            []
        )

        gpus = candidates.get(
            "GPU",
            []
        )

        coolers = candidates.get(
            "Cooler",
            []
        )

        if not processors:
            print(
                "[BUILD AGENT] No Processor candidates."
            )
            return None

        if not motherboards:
            print(
                "[BUILD AGENT] No Motherboard candidates."
            )
            return None

        if not rams:
            print(
                "[BUILD AGENT] No RAM candidates."
            )
            return None

        if not storages:
            print(
                "[BUILD AGENT] No Storage candidates."
            )
            return None

        if not psus:
            print(
                "[BUILD AGENT] No PSU candidates."
            )
            return None

        if not cases:
            print(
                "[BUILD AGENT] No Case candidates."
            )
            return None

        if (
            requirements["gpu_required"]
            and not gpus
        ):
            print(
                "[BUILD AGENT] No GPU candidates."
            )
            return None

        if (
            requirements["cooler_required"]
            and not coolers
        ):
            print(
                "[BUILD AGENT] No Cooler candidates."
            )
            return None

        # =========================================================
        # SORT BY PRICE
        # =========================================================

        processors = sorted(
            processors,
            key=self._get_price
        )

        motherboards = sorted(
            motherboards,
            key=self._get_price
        )

        rams = sorted(
            rams,
            key=self._get_price
        )

        storages = sorted(
            storages,
            key=self._get_price
        )

        psus = sorted(
            psus,
            key=self._get_price
        )

        cases = sorted(
            cases,
            key=self._get_price
        )

        gpus = sorted(
            gpus,
            key=self._get_price
        )

        coolers = sorted(
            coolers,
            key=self._get_price
        )

        # =========================================================
        # CHEAPEST NON-COMPATIBILITY COMPONENTS
        # =========================================================

        cheapest_storage = storages[0]
        cheapest_case = cases[0]

        cheapest_cooler = (
            coolers[0]
            if requirements["cooler_required"]
            else None
        )

        # =========================================================
        # SEARCH
        # =========================================================

        best_build = None
        best_score = float("-inf")
        best_total = float("inf")

        checked = 0
        rejected_incompatible = 0
        budget_rejected = 0

        if requirements["gpu_required"]:
            gpu_options = gpus
        else:
            gpu_options = [None]

        for processor in processors:

            processor_price = self._get_price(
                processor
            )

            for motherboard in motherboards:

                motherboard_price = (
                    self._get_price(
                        motherboard
                    )
                )

                # -------------------------------------------------
                # CPU / MOTHERBOARD
                # -------------------------------------------------

                if not self._is_cpu_motherboard_compatible(
                    processor,
                    motherboard
                ):
                    rejected_incompatible += 1
                    continue

                cpu_motherboard_total = (
                    processor_price
                    + motherboard_price
                )

                if cpu_motherboard_total > budget:
                    budget_rejected += 1
                    continue

                for ram in rams:

                    ram_price = self._get_price(
                        ram
                    )

                    # -------------------------------------------------
                    # RAM / MOTHERBOARD
                    # -------------------------------------------------

                    if not self._is_ram_motherboard_compatible(
                        ram,
                        motherboard
                    ):
                        rejected_incompatible += 1
                        continue

                    cpu_mobo_ram_total = (
                        cpu_motherboard_total
                        + ram_price
                    )

                    if cpu_mobo_ram_total > budget:
                        budget_rejected += 1
                        continue

                    for gpu in gpu_options:

                        gpu_price = (
                            self._get_price(gpu)
                            if gpu is not None
                            else 0
                        )

                        current_total = (
                            cpu_mobo_ram_total
                            + gpu_price
                        )

                        if current_total > budget:
                            budget_rejected += 1
                            continue

                        for psu in psus:

                            checked += 1

                            psu_price = self._get_price(
                                psu
                            )

                            # -------------------------------------------------
                            # GPU / PSU
                            # -------------------------------------------------

                            if gpu is not None:

                                if not self._is_gpu_psu_compatible(
                                    gpu,
                                    psu
                                ):
                                    rejected_incompatible += 1
                                    continue

                            # -------------------------------------------------
                            # ADD CHEAPEST STORAGE / CASE / COOLER
                            # -------------------------------------------------

                            partial_total = (
                                current_total
                                + psu_price
                                + self._get_price(
                                    cheapest_storage
                                )
                                + self._get_price(
                                    cheapest_case
                                )
                            )

                            if cheapest_cooler is not None:
                                partial_total += (
                                    self._get_price(
                                        cheapest_cooler
                                    )
                                )

                            if partial_total > budget:
                                budget_rejected += 1
                                continue

                            # -------------------------------------------------
                            # CREATE COMBINATION
                            # -------------------------------------------------

                            combination = [
                                processor,
                                motherboard,
                                ram,
                                cheapest_storage,
                                psu,
                                cheapest_case
                            ]

                            if gpu is not None:
                                combination.append(
                                    gpu
                                )

                            if cheapest_cooler is not None:
                                combination.append(
                                    cheapest_cooler
                                )

                            # -------------------------------------------------
                            # FINAL COMPATIBILITY
                            # -------------------------------------------------

                            if not self._is_compatible(
                                combination
                            ):
                                rejected_incompatible += 1
                                continue

                            total = sum(
                                self._get_price(
                                    item
                                )
                                for item in combination
                            )

                            if total > budget:
                                budget_rejected += 1
                                continue

                            score = self._score_build(
                                combination,
                                analysis,
                                budget
                            )

                            if (
                                score > best_score
                                or (
                                    score == best_score
                                    and total > best_total
                                )
                            ):
                                best_score = score
                                best_total = total
                                best_build = combination

        print(
            "[BUILD AGENT] Checked compatible core "
            f"combinations: {checked}"
        )

        print(
            "[BUILD AGENT] Rejected incompatible "
            f"combinations: {rejected_incompatible}"
        )

        print(
            "[BUILD AGENT] Rejected over-budget "
            f"combinations: {budget_rejected}"
        )

        if best_build is None:

            print(
                "[BUILD AGENT] No feasible compatible "
                "deterministic combination found."
            )

            return None

        print(
            "[BUILD AGENT] Deterministic fallback "
            "build selected."
        )

        print(
            "[BUILD AGENT] Deterministic build total: "
            f"Rs. {best_total:,.2f}"
        )

        print(
            "[BUILD AGENT] Deterministic build products:"
        )

        for product_item in best_build:

            print(
                "  - "
                f"{product_item.get('name', '')} "
                f"(ID: {product_item.get('id')}) "
                f"[{self._normalize_category(product_item.get('category'))}] "
                f"Rs. {self._get_price(product_item):,.2f}"
            )

        class FallbackItem:

            def __init__(
                self,
                product_id,
                category,
                reason
            ):
                self.product_id = product_id
                self.category = category
                self.reason = reason

        class FallbackResult:

            def __init__(
                self,
                products
            ):
                self.products = products

        fallback_products = []

        for product_item in best_build:

            fallback_products.append(
                FallbackItem(
                    product_id=int(
                        product_item.get(
                            "id"
                        )
                    ),
                    category=self._normalize_category(
                        product_item.get(
                            "category",
                            ""
                        )
                    ),
                    reason=(
                        "Selected by deterministic "
                        "budget and compatibility fallback."
                    )
                )
            )

        return FallbackResult(
            fallback_products
        )

    # =============================================================
    # COMPATIBILITY CHECK
    # =============================================================

    def _is_compatible(
        self,
        products
    ):

        product_by_category = {}

        for product_item in products:

            category = self._normalize_category(
                product_item.get(
                    "category",
                    ""
                )
            )

            product_by_category[
                category
            ] = product_item

        processor = product_by_category.get(
            "Processor"
        )

        motherboard = product_by_category.get(
            "Motherboard"
        )

        ram = product_by_category.get(
            "RAM"
        )

        gpu = product_by_category.get(
            "GPU"
        )

        psu = product_by_category.get(
            "PSU"
        )

        # =========================================================
        # CPU / MOTHERBOARD
        # =========================================================

        if (
            processor
            and motherboard
        ):

            if not self._is_cpu_motherboard_compatible(
                processor,
                motherboard
            ):
                return False

        # =========================================================
        # RAM / MOTHERBOARD
        # =========================================================

        if (
            ram
            and motherboard
        ):

            if not self._is_ram_motherboard_compatible(
                ram,
                motherboard
            ):
                return False

        # =========================================================
        # GPU / PSU
        # =========================================================

        if (
            gpu
            and psu
        ):

            if not self._is_gpu_psu_compatible(
                gpu,
                psu
            ):
                return False

        return True

    # =============================================================
    # CPU / MOTHERBOARD COMPATIBILITY
    # =============================================================

    def _is_cpu_motherboard_compatible(
        self,
        processor,
        motherboard
    ):

        processor_text = " ".join([
            str(
                processor.get(
                    "name",
                    ""
                )
            ),
            str(
                processor.get(
                    "description",
                    ""
                )
            )
        ]).lower()

        motherboard_text = " ".join([
            str(
                motherboard.get(
                    "name",
                    ""
                )
            ),
            str(
                motherboard.get(
                    "description",
                    ""
                )
            )
        ]).lower()

        processor_socket = (
            self._extract_socket(
                processor_text
            )
        )

        motherboard_socket = (
            self._extract_socket(
                motherboard_text
            )
        )

        # If both sockets are explicitly known,
        # they must match.
        if (
            processor_socket
            and motherboard_socket
            and processor_socket != motherboard_socket
        ):
            return False

        return True

    # =============================================================
    # RAM / MOTHERBOARD COMPATIBILITY
    # =============================================================

    def _is_ram_motherboard_compatible(
        self,
        ram,
        motherboard
    ):

        ram_text = " ".join([
            str(
                ram.get(
                    "name",
                    ""
                )
            ),
            str(
                ram.get(
                    "description",
                    ""
                )
            )
        ]).lower()

        motherboard_text = " ".join([
            str(
                motherboard.get(
                    "name",
                    ""
                )
            ),
            str(
                motherboard.get(
                    "description",
                    ""
                )
            )
        ]).lower()

        ram_ddr = self._extract_ddr(
            ram_text
        )

        motherboard_ddr = self._extract_ddr(
            motherboard_text
        )

        if (
            ram_ddr
            and motherboard_ddr
            and ram_ddr != motherboard_ddr
        ):
            return False

        return True

    # =============================================================
    # GPU / PSU COMPATIBILITY
    # =============================================================

    def _is_gpu_psu_compatible(
        self,
        gpu,
        psu
    ):

        gpu_text = " ".join([
            str(
                gpu.get(
                    "name",
                    ""
                )
            ),
            str(
                gpu.get(
                    "description",
                    ""
                )
            )
        ]).lower()

        psu_text = " ".join([
            str(
                psu.get(
                    "name",
                    ""
                )
            ),
            str(
                psu.get(
                    "description",
                    ""
                )
            )
        ]).lower()

        gpu_power = self._extract_gpu_power(
            gpu_text
        )

        psu_power = self._extract_psu_wattage(
            psu_text
        )

        # If either value is not explicitly available,
        # do not reject the combination.
        if (
            gpu_power is None
            or psu_power is None
        ):
            return True

        return psu_power >= gpu_power

    # =============================================================
    # SOCKET EXTRACTION
    # =============================================================

    def _extract_socket(
        self,
        text
    ):

        sockets = [
            "lga1851",
            "lga1700",
            "lga1200",
            "lga1151",
            "am5",
            "am4",
            "tr4",
            "strx4"
        ]

        text = text.lower()

        for socket in sockets:

            if socket in text:
                return socket

        return None

    # =============================================================
    # DDR EXTRACTION
    # =============================================================

    def _extract_ddr(
        self,
        text
    ):

        text = text.lower()

        for ddr in [
            "ddr5",
            "ddr4",
            "ddr3"
        ]:

            if ddr in text:
                return ddr

        return None

    # =============================================================
    # GPU POWER EXTRACTION
    # =============================================================

    def _extract_gpu_power(
        self,
        text
    ):

        import re

        text = text.lower()

        patterns = [
            r"recommended\s+psu\s*[:\-]?\s*(\d{3,4})\s*w",
            r"minimum\s+psu\s*[:\-]?\s*(\d{3,4})\s*w",
            r"psu\s*[:\-]?\s*(\d{3,4})\s*w",
            r"power\s+requirement\s*[:\-]?\s*(\d{3,4})\s*w",
            r"tdp\s*[:\-]?\s*(\d{2,4})\s*w"
        ]

        for pattern in patterns:

            match = re.search(
                pattern,
                text
            )

            if match:

                try:
                    return int(
                        match.group(1)
                    )
                except (
                    TypeError,
                    ValueError
                ):
                    pass

        return None

    # =============================================================
    # PSU WATTAGE EXTRACTION
    # =============================================================

    def _extract_psu_wattage(
        self,
        text
    ):

        import re

        text = text.lower()

        matches = re.findall(
            r"(\d{3,4})\s*w",
            text
        )

        if not matches:
            return None

        try:

            values = [
                int(value)
                for value in matches
            ]

            return max(
                values
            )

        except (
            TypeError,
            ValueError
        ):
            return None

    # =============================================================
    # GENERIC PRICE HELPER
    # =============================================================

    def _get_price(
        self,
        product
    ):

        try:

            return float(
                product.get(
                    "actualPrice",
                    0
                )
            )

        except (
            TypeError,
            ValueError
        ):

            return float(
                "inf"
            )

    # =============================================================
    # BUILD SCORING
    # =============================================================

    def _score_build(
        self,
        products,
        analysis,
        budget
    ):

        requirements = self._get_build_requirements(
            analysis
        )

        total = sum(
            self._get_price(
                product_item
            )
            for product_item in products
        )

        score = 0.0

        # ---------------------------------------------------------
        # Budget
        # ---------------------------------------------------------

        if total <= budget:
            score += 20

        budget_usage = (
            total / budget
            if budget > 0
            else 1
        )

        if budget_usage <= 1.0:
            score += 20

        if 0.75 <= budget_usage <= 0.95:
            score += 15

        # ---------------------------------------------------------
        # Gaming
        # ---------------------------------------------------------

        categories = {
            self._normalize_category(
                product_item.get(
                    "category",
                    ""
                )
            )
            for product_item in products
        }

        if requirements["gaming"]:

            if "GPU" in categories:
                score += 50

        # ---------------------------------------------------------
        # AI / ML
        # ---------------------------------------------------------

        if requirements["ai_ml"]:

            if "GPU" in categories:
                score += 60

        # ---------------------------------------------------------
        # Heavy Work
        # ---------------------------------------------------------

        if requirements["heavy_work"]:

            if "GPU" in categories:
                score += 30

            if "Cooler" in categories:
                score += 20

        # ---------------------------------------------------------
        # Lightweight
        # ---------------------------------------------------------

        if requirements["lightweight"]:

            if "GPU" not in categories:
                score += 15

            if "Cooler" not in categories:
                score += 10

        return score