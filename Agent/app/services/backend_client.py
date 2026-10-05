import httpx

from app.config.settings import settings


class BackendClient:
    def __init__(self):
        self.base_url = settings.backend_url.rstrip("/")

    async def get_products(self):
        """
        Get products from the TechNest Product API.
        """
        url = f"{self.base_url}/api/Product"

        print(f"[BACKEND] GET {url}")

        async with httpx.AsyncClient(
            timeout=30.0
        ) as client:
            response = await client.get(
                url,
                params={
                    "page": 1,
                    "pageSize": 50
                }
            )

            print(
                f"[BACKEND] Status: {response.status_code}"
            )

            print(
                f"[BACKEND] Response: {response.text}"
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

        url = (
            f"{self.base_url}/api/Product/"
            f"{product_id}"
        )

        print(f"[BACKEND] GET {url}")

        async with httpx.AsyncClient(
            timeout=30.0
        ) as client:
            response = await client.get(url)

            print(
                f"[BACKEND] Status: {response.status_code}"
            )

            print(
                f"[BACKEND] Response: {response.text}"
            )

            response.raise_for_status()

            return response.json()