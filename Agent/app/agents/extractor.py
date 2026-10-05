from langchain_core.prompts import ChatPromptTemplate

from app.models.specification import ProductSpecifications
from app.services.llm_service import LLMService


class SpecificationExtractor:
    def __init__(self):
        self.llm = LLMService().get_llm()

        self.structured_llm = self.llm.with_structured_output(
            ProductSpecifications
        )

        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """
You are the TechNest Product Specification Extractor.

Your responsibility is to extract technical PC component
specifications from the supplied product description.

IMPORTANT RULES:

1. Extract specifications ONLY from information explicitly
   written in the product description.

2. If the description contains a "Specifications:" section,
   prefer specifications from that section.

3. If there is no "Specifications:" section, you may extract
   explicitly stated technical specifications from the rest
   of the description.

4. NEVER infer specifications from general product knowledge.

5. NEVER guess missing values.

6. If a specification is not explicitly available,
   return null.

7. Normalize numerical values.

Examples:
- "120W" -> 120
- "320mm" -> 320
- "32GB" -> 32
- "6000MHz" -> 6000

8. Preserve technical names such as:

- AM5
- AM4
- LGA1700
- LGA1200
- DDR5
- DDR4
- M.2 NVMe
- PCIe 3.0
- PCIe 4.0
- PCIe 5.0

9. Do not create specifications that are not present
   in the description.

10. Do not use outside knowledge to fill missing values.

11. Return structured data according to the supplied schema.
"""
                ),
                (
                    "human",
                    """
Product category:
{category}

Product name:
{name}

Product description:
{description}
"""
                )
            ]
        )

        self.chain = self.prompt | self.structured_llm

    async def extract(
        self,
        category: str,
        name: str,
        description: str
    ) -> ProductSpecifications:

        return await self.chain.ainvoke(
            {
                "category": category,
                "name": name,
                "description": description
            }
        )