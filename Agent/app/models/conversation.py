from pydantic import BaseModel, Field


class ConversationResponse(BaseModel):
    response: str = Field(
        description="Natural response to the customer."
    )

    ready_to_build: bool = Field(
        description=(
            "True only when enough information is available "
            "to create a PC build."
        )
    )

    missing_information: list[str] = Field(
        default_factory=list,
        description=(
            "Information still needed before creating the build."
        )
    )
