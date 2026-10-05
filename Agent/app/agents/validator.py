import asyncio
import re

from app.graph.state import AgentState
from app.agents.extractor import SpecificationExtractor
from app.services.compatibility_validator import CompatibilityValidator
from app.services.build_validator import BuildValidator
from app.tools.product_tools import (
    ProductLookupTool,
    ProductLookupInput
)


class ValidatorAgent:

    MAX_REVISIONS = 3

    def __init__(self):
        self.product_lookup_tool = ProductLookupTool()
        self.specification_extractor = SpecificationExtractor()
        self.compatibility_validator = CompatibilityValidator()
        self.build_validator = BuildValidator()

    async def run(self, state: AgentState) -> AgentState:

        try:

            build = state.get(
                "build",
                {}
            )

            selected_products = build.get(
                "products",
                []
            )

            if not selected_products:

                return {
                    **state,
                    "status": "FAILED_SAFE",
                    "current_agent": "validator",
                    "current_step": "NO_BUILD_PRODUCTS",
                    "errors": [
                        *state.get(
                            "errors",
                            []
                        ),
                        "Build contains no products."
                    ]
                }

            print(
                f"[VALIDATOR] Validating "
                f"{len(selected_products)} selected products..."
            )

            # ---------------------------------------------------------
            # STEP 1: VALIDATE PRODUCT IDS
            # ---------------------------------------------------------

            product_ids = []

            for selected in selected_products:

                product_id = selected.get(
                    "product_id"
                )

                if not product_id:

                    return {
                        **state,
                        "status": "FAILED_SAFE",
                        "current_agent": "validator",
                        "current_step": "INVALID_PRODUCT_ID",
                        "errors": [
                            *state.get(
                                "errors",
                                []
                            ),
                            "Build contains an invalid product ID."
                        ]
                    }

                try:

                    product_id = int(
                        product_id
                    )

                except (
                    TypeError,
                    ValueError
                ):

                    return {
                        **state,
                        "status": "FAILED_SAFE",
                        "current_agent": "validator",
                        "current_step": "INVALID_PRODUCT_ID",
                        "errors": [
                            *state.get(
                                "errors",
                                []
                            ),
                            (
                                f"Product ID '{product_id}' "
                                "is invalid."
                            )
                        ]
                    }

                product_ids.append(
                    product_id
                )

            if len(product_ids) != len(
                set(product_ids)
            ):

                return {
                    **state,
                    "status": "FAILED_SAFE",
                    "current_agent": "validator",
                    "current_step": "DUPLICATE_PRODUCT_IDS",
                    "errors": [
                        *state.get(
                            "errors",
                            []
                        ),
                        "Build contains duplicate product IDs."
                    ]
                }

            # ---------------------------------------------------------
            # STEP 2: LOOK UP ALL PRODUCTS CONCURRENTLY
            # ---------------------------------------------------------

            print(
                "[VALIDATOR] Looking up products..."
            )

            lookup_results = await asyncio.gather(
                *[
                    self.product_lookup_tool.execute(
                        ProductLookupInput(
                            product_id=product_id
                        )
                    )
                    for product_id in product_ids
                ],
                return_exceptions=True
            )

            products = []

            for product_id, lookup_result in zip(
                product_ids,
                lookup_results
            ):

                if isinstance(
                    lookup_result,
                    Exception
                ):

                    return {
                        **state,
                        "status": "FAILED_SAFE",
                        "current_agent": "validator",
                        "current_step": "PRODUCT_LOOKUP_FAILED",
                        "errors": [
                            *state.get(
                                "errors",
                                []
                            ),
                            (
                                f"Could not retrieve product "
                                f"{product_id}: "
                                f"{str(lookup_result)}"
                            )
                        ]
                    }

                if not lookup_result.success:

                    return {
                        **state,
                        "status": "FAILED_SAFE",
                        "current_agent": "validator",
                        "current_step": "PRODUCT_LOOKUP_FAILED",
                        "errors": [
                            *state.get(
                                "errors",
                                []
                            ),
                            (
                                lookup_result.error
                                or
                                f"Could not retrieve product "
                                f"{product_id}."
                            )
                        ]
                    }

                product = lookup_result.product

                if not product:

                    return {
                        **state,
                        "status": "FAILED_SAFE",
                        "current_agent": "validator",
                        "current_step": "PRODUCT_NOT_FOUND",
                        "errors": [
                            *state.get(
                                "errors",
                                []
                            ),
                            (
                                f"Product {product_id} "
                                "was not found."
                            )
                        ]
                    }

                products.append(
                    product
                )

            print(
                f"[VALIDATOR] Retrieved "
                f"{len(products)} products."
            )

            # ---------------------------------------------------------
            # STEP 3: CHECK DESCRIPTIONS
            # ---------------------------------------------------------

            for product in products:

                description = product.get(
                    "description"
                )

                if (
                    not description
                    or not str(description).strip()
                ):

                    return {
                        **state,
                        "status": "FAILED_SAFE",
                        "current_agent": "validator",
                        "current_step": "SPECIFICATION_SOURCE_MISSING",
                        "errors": [
                            *state.get(
                                "errors",
                                []
                            ),
                            (
                                f"Product "
                                f"'{product.get('name')}' "
                                "does not contain a description."
                            )
                        ]
                    }

            # ---------------------------------------------------------
            # STEP 4: EXTRACT SPECIFICATIONS CONCURRENTLY
            # ---------------------------------------------------------

            print(
                "[VALIDATOR] Extracting specifications "
                "from product descriptions..."
            )

            specification_results = await asyncio.gather(
                *[
                    self._extract_specification(
                        product
                    )
                    for product in products
                ],
                return_exceptions=True
            )

            specifications = []

            for product, result in zip(
                products,
                specification_results
            ):

                if isinstance(
                    result,
                    Exception
                ):

                    return {
                        **state,
                        "status": "FAILED_SAFE",
                        "current_agent": "validator",
                        "current_step": "SPECIFICATION_EXTRACTION_FAILED",
                        "errors": [
                            *state.get(
                                "errors",
                                []
                            ),
                            (
                                "Failed to extract specifications "
                                f"for product "
                                f"'{product.get('name')}': "
                                f"{str(result)}"
                            )
                        ]
                    }

                specifications.append(
                    result
                )

            print(
                f"[VALIDATOR] Extracted specifications "
                f"for {len(specifications)} products."
            )

            # ---------------------------------------------------------
            # STEP 5: COMPATIBILITY VALIDATION
            # ---------------------------------------------------------

            print(
                "[VALIDATOR] Checking compatibility..."
            )

            compatibility_issues = (
                self.compatibility_validator.validate(
                    specifications
                )
            )

            # ---------------------------------------------------------
            # STEP 6: STOCK VALIDATION
            # ---------------------------------------------------------

            print(
                "[VALIDATOR] Checking stock..."
            )

            stock_issues = (
                self.build_validator.validate_stock(
                    products
                )
            )

            # ---------------------------------------------------------
            # STEP 7: CALCULATE REAL TOTAL FROM CATALOGUE
            # ---------------------------------------------------------

            summary_products = []

            total_amount = 0.0

            for selected, product in zip(
                selected_products,
                products
            ):

                price_value = product.get(
                    "actualPrice"
                )

                if price_value is None:

                    raise ValueError(
                        f"Product {product.get('id')} "
                        "has no catalogue price."
                    )

                try:

                    unit_price = float(
                        price_value
                    )

                except (
                    TypeError,
                    ValueError
                ):

                    raise ValueError(
                        f"Product {product.get('id')} "
                        "has an invalid catalogue price."
                    )

                if unit_price < 0:

                    raise ValueError(
                        f"Product {product.get('id')} "
                        "has an invalid negative price."
                    )

                total_amount += unit_price

                summary_products.append(
                    {
                        "product_id": product.get(
                            "id"
                        ),
                        "name": product.get(
                            "name",
                            ""
                        ),
                        "category": product.get(
                            "category",
                            ""
                        ),
                        "brand": product.get(
                            "brand",
                            ""
                        ),
                        "unit_price": unit_price,
                        "reason": selected.get(
                            "reason",
                            ""
                        )
                    }
                )

            total_amount = round(
                total_amount,
                2
            )

            print(
                f"[VALIDATOR] Build total: "
                f"Rs. {total_amount:,.2f}"
            )

            build = {
                **build,
                "products": summary_products,
                "total_amount": total_amount
            }

            # ---------------------------------------------------------
            # STEP 8: BUDGET VALIDATION
            # ---------------------------------------------------------

            analysis = state.get(
                "analysis",
                {}
            )

            budget = analysis.get(
                "budget"
            )

            if budget is not None:

                try:

                    budget = float(
                        budget
                    )

                except (
                    TypeError,
                    ValueError
                ):

                    budget = None

            if budget is None:

                budget = self._extract_budget(
                    state.get(
                        "objective",
                        ""
                    )
                )

            print(
                f"[VALIDATOR] Budget: {budget}"
            )

            budget_issues = (
                self.build_validator.validate_budget(
                    total_amount,
                    budget
                )
            )

            # ---------------------------------------------------------
            # STEP 9: COMBINE VALIDATION ISSUES
            # ---------------------------------------------------------

            issues = (
                compatibility_issues
                + stock_issues
                + budget_issues
            )

            errors = [
                issue
                for issue in issues
                if issue.get(
                    "severity"
                ) == "ERROR"
            ]

            warnings = [
                issue
                for issue in issues
                if issue.get(
                    "severity"
                ) == "WARNING"
            ]

            # ---------------------------------------------------------
            # STEP 10: REVISION / APPROVAL
            # ---------------------------------------------------------

            revision_count = state.get(
                "revision_count",
                0
            )

            if errors:

                revision_count += 1

                if revision_count >= self.MAX_REVISIONS:

                    status = "FAILED_SAFE"

                    current_step = (
                        "MAX_REVISIONS_REACHED"
                    )

                    print(
                        "[VALIDATOR] "
                        "Maximum revisions reached."
                    )

                else:

                    status = "REVISION_REQUIRED"

                    current_step = (
                        "VALIDATION_REQUIRES_REVISION"
                    )

                    print(
                        "[VALIDATOR] "
                        "Revision required."
                    )

                approval_required = False

                approval_status = None

            else:

                status = "WAITING_FOR_APPROVAL"

                current_step = (
                    "VALIDATION_COMPLETED"
                )

                approval_required = True

                approval_status = "PENDING"

                print(
                    "[VALIDATOR] "
                    "Build passed validation."
                )

            # ---------------------------------------------------------
            # STEP 11: CREATE VALIDATION RESULT
            # ---------------------------------------------------------

            validation = {
                "is_valid": len(errors) == 0,
                "issues": issues,
                "errors": errors,
                "warnings": warnings,
                "specifications": specifications,
                "total_amount": total_amount,
                "budget": budget
            }

            # ---------------------------------------------------------
            # STEP 12: COMPLETED STEPS
            # ---------------------------------------------------------

            completed_steps = [
                *state.get(
                    "completed_steps",
                    []
                ),
                {
                    "agent": "validator",
                    "step": "build_validation",
                    "status": "completed",
                    "revision": revision_count
                }
            ]

            return {
                **state,
                "build": build,
                "validation": validation,
                "completed_steps": completed_steps,
                "current_agent": "validator",
                "current_step": current_step,
                "status": status,
                "approval_required": approval_required,
                "approval_status": approval_status,
                "revision_count": revision_count
            }

        except Exception as ex:

            print(
                f"[VALIDATOR] Failed: {str(ex)}"
            )

            return {
                **state,
                "current_agent": "validator",
                "current_step": "VALIDATION_FAILED",
                "status": "FAILED_SAFE",
                "errors": [
                    *state.get(
                        "errors",
                        []
                    ),
                    f"Validator failed: {str(ex)}"
                ]
            }

    # =============================================================
    # SPECIFICATION EXTRACTION
    # =============================================================

    async def _extract_specification(
        self,
        product: dict
    ) -> dict:

        description = product.get(
            "description"
        )

        if (
            not description
            or not str(description).strip()
        ):

            raise ValueError(
                f"Product '{product.get('name')}' "
                "does not contain a description."
            )

        result = await self.specification_extractor.extract(
            category=product.get(
                "category",
                ""
            ),
            name=product.get(
                "name",
                ""
            ),
            description=description
        )

        return result.model_dump()

    # =============================================================
    # BUDGET EXTRACTION
    # =============================================================

    def _extract_budget(
        self,
        objective: str
    ) -> float | None:

        if not objective:
            return None

        text = (
            str(objective)
            .lower()
            .replace(
                ",",
                ""
            )
        )

        patterns = [

            (
                r"([0-9]+(?:\.[0-9]+)?)"
                r"\s*(million|m)\b"
            ),

            (
                r"([0-9]+(?:\.[0-9]+)?)"
                r"\s*(thousand|k)\b"
            ),

            (
                r"\b(?:rs\.?|lkr|rupees?)"
                r"\s*"
                r"([0-9]+(?:\.[0-9]+)?)"
            ),

            (
                r"\bbudget\b"
                r"[^0-9]{0,40}"
                r"([0-9]+(?:\.[0-9]+)?)"
            ),

            (
                r"\b(?:around|about|approximately|"
                r"under|within)\b"
                r"[^0-9]{0,40}"
                r"([0-9]+(?:\.[0-9]+)?)"
            ),

            (
                r"\b([0-9]{5,})\b"
            )
        ]

        for pattern in patterns:

            match = re.search(
                pattern,
                text,
                re.IGNORECASE
            )

            if not match:
                continue

            try:

                value = float(
                    match.group(1)
                )

            except (
                TypeError,
                ValueError
            ):

                continue

            if (
                match.lastindex
                and match.lastindex >= 2
            ):

                unit = (
                    match.group(2)
                    .lower()
                    .strip()
                )

                if unit in (
                    "million",
                    "m"
                ):

                    value *= 1_000_000

                elif unit in (
                    "thousand",
                    "k"
                ):

                    value *= 1_000

            return value

        return None