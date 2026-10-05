class BuildValidator:

    def validate_budget(
        self,
        total_amount: float,
        budget: float | None
    ) -> list[dict]:

        if budget is None:
            return []

        if total_amount > budget:
            difference = total_amount - budget

            return [
                {
                    "rule": "BUDGET",
                    "severity": "ERROR",
                    "message":
                        f"Build total Rs. {total_amount:,.2f} "
                        f"exceeds budget of Rs. {budget:,.2f} "
                        f"by Rs. {difference:,.2f}."
                }
            ]

        return []

    def validate_stock(
        self,
        products: list[dict]
    ) -> list[dict]:

        issues = []

        for product in products:

            stock_quantity = product.get(
                "stockQuantity",
                0
            )

            if stock_quantity <= 0:
                issues.append(
                    {
                        "rule": "STOCK",
                        "severity": "ERROR",
                        "message":
                            f"Product "
                            f"'{product.get('name', 'Unknown')}' "
                            f"is currently out of stock."
                    }
                )

        return issues