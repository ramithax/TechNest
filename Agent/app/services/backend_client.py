import httpx

from app.config.settings import settings


class BackendClient:
    def __init__(self):
        self.base_url = settings.backend_url.rstrip("/")

    async def get_products(self):
        """
        Get all products from the TechNest Product API.
        Handles pagination automatically.
        """

        all_products = []
        page = 1
        page_size = 50

        async with httpx.AsyncClient(timeout=30.0) as client:

            while True:
                url = f"{self.base_url}/api/Product"

                print(
                    f"[BACKEND] GET {url} "
                    f"(page={page}, pageSize={page_size})"
                )

                response = await client.get(
                    url,
                    params={
                        "page": page,
                        "pageSize": page_size
                    }
                )

                print(
                    f"[BACKEND] Status: {response.status_code}"
                )

                response.raise_for_status()

                data = response.json()

                items = data.get("items", [])

                print(
                    f"[BACKEND] Received {len(items)} products"
                )

                all_products.extend(items)

                has_next_page = data.get(
                    "hasNextPage",
                    False
                )

                if not has_next_page:
                    break

                page += 1

        print(
            f"[BACKEND] Total products loaded: "
            f"{len(all_products)}"
        )

        return all_products

    async def get_product(self, product_id: int):
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

        async with httpx.AsyncClient(timeout=30.0) as client:

            response = await client.get(url)

            print(
                f"[BACKEND] Status: "
                f"{response.status_code}"
            )

            print(
                f"[BACKEND] Response: "
                f"{response.text}"
            )

            response.raise_for_status()

            return response.json()