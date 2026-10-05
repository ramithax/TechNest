import httpx

from app.config.settings import settings


class BackendClient:

    def __init__(self):
        self.base_url = settings.backend_url.rstrip("/")

    async def get_products(self):
        """
        Get products from the TechNest Product API.
        """

        async with httpx.AsyncClient(
            timeout=10.0
        ) as client:

            response = await client.get(
                f"{self.base_url}/api/Product",
                params={
                    "page": 1,
                    "pageSize": 50
                }
            )

            response.raise_for_status()

            data = response.json()

            return data.get("items", [])

    async def get_product(
        self,
        product_id: int
    ):
        """
        Get one product by ID from the TechNest Product API.
        """

        if product_id <= 0:
            raise ValueError(
                "Product ID must be greater than zero."
            )

        async with httpx.AsyncClient(
            timeout=10.0
        ) as client:

            response = await client.get(
                f"{self.base_url}/api/Product/{product_id}"
            )

            response.raise_for_status()

            return response.json()