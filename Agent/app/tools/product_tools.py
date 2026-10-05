from typing import Optional
from pydantic import BaseModel, Field
from app.services.backend_client import BackendClient


#Search Products
class ProductSearchInput(BaseModel):

    category: Optional[str] = Field(
        default=None,
        max_length=50
    )

    search: Optional[str] = Field(
        default=None,
        max_length=100
    )


class ProductSearchOutput(BaseModel):
    
    success: bool
    products: list
    error: Optional[str] = None


class ProductSearchTool:

    name = "search_products"

    def __init__(self):

        self.backend = BackendClient()

    async def execute(self,input_data: ProductSearchInput) -> ProductSearchOutput:

        try:

            # Get products from TechNest API
            products = await self.backend.get_products()

           # Category filtering
            if input_data.category:

                category = (
                    input_data.category
                    .strip()
                    .lower()
                )

                products = [
                    product
                    for product in products
                    if str(
                        product.get("category", "")
                    ).lower() == category
                ]

           # Text search filtering
            if input_data.search:

                search = (
                    input_data.search
                    .strip()
                    .lower()
                )

                products = [
                    product
                    for product in products
                    if (
                        search
                        in str(
                            product.get("name", "")
                        ).lower()
                        or
                        search
                        in str(
                            product.get("brand", "")
                        ).lower()
                        or
                        search
                        in str(
                            product.get("description", "")
                        ).lower()
                    )
                ]

            return ProductSearchOutput(
                success=True,
                products=products
            )

        except Exception as ex:

            return ProductSearchOutput(
                success=False,
                products=[],
                error=str(ex)
            )


#Get Product
class ProductLookupInput(BaseModel):

    product_id: int = Field(
        gt=0
    )


class ProductLookupOutput(BaseModel):

    success: bool

    product: Optional[dict] = None

    error: Optional[str] = None


class ProductLookupTool:

    name = "get_product"

    def __init__(self):

        self.backend = BackendClient()

    async def execute(self,input_data: ProductLookupInput) -> ProductLookupOutput:

        try:

            product = await self.backend.get_product(
                input_data.product_id
            )

            return ProductLookupOutput(
                success=True,
                product=product
            )

        except Exception as ex:

            return ProductLookupOutput(
                success=False,
                product=None,
                error=str(ex)
            )