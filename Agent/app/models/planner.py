from typing import List, Literal
from pydantic import BaseModel


AllowedAgent = Literal[
    "analyzer",
    "build_agent",
    "validator"
]


class PlanStep(BaseModel):
    step: int
    agent: AllowedAgent
    task: str


class PlannerOutput(BaseModel):
    objective: str
    plan: List[PlanStep]