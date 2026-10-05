from pydantic import BaseModel, Field


class RequirementsAnalysis(BaseModel):
    use_case: str = Field(
        description="Primary intended use of the PC"
    )

    gaming_requirements: str = Field(
        description="Requested gaming needs"
    )

    productivity_requirements: str = Field(
        description="Work or study needs"
    )

    budget: float | None = Field(
        default=None,
        ge=0
    )

    performance_expectations: str = Field(
        description="Requested performance level"
    )

    special_requirements: list[str] = Field(
        default_factory=list
    )