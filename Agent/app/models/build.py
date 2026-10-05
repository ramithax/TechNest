from pydantic import BaseModel, Field


class SelectedProduct(BaseModel):
    product_id: int = Field(gt=0)
    category: str
    reason: str


class BuildOutput(BaseModel):
    products: list[SelectedProduct] = Field(min_length=1)
    explanation: str
