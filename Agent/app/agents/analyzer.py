from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

from app.graph.state import AgentState
from app.models.analyzer import RequirementsAnalysis
from app.services.llm_service import LLMService


class AnalyzerAgent:
    def __init__(self):
        self.llm = LLMService().get_llm()

        self.parser = PydanticOutputParser(
            pydantic_object=RequirementsAnalysis
        )

        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """
You are the TechNest PC Requirements Analysis Agent.

Analyze the COMPLETE customer conversation and extract the
customer's actual PC requirements.

Extract:

- primary use case
- gaming requirements
- productivity requirements
- budget
- performance expectations
- special requirements

IMPORTANT RULES:

1. Analyze the complete conversation, not only the latest message.

2. Do NOT select specific products.

3. Do NOT recommend specific CPUs, GPUs, RAM, motherboards
   or other components.

4. Do NOT determine hardware compatibility.

5. Do NOT invent requirements.

6. Only use information explicitly provided by the customer.

7. If a requirement is not specified, clearly state:
   "None specified".

8. Extract the budget when it is explicitly provided.

9. Convert budget expressions to LKR.

Examples:

"3 million" -> 3000000
"3m" -> 3000000
"500k" -> 500000
"500 thousand" -> 500000
"Rs 500000" -> 500000
"LKR 500000" -> 500000

10. special_requirements must contain only actual additional
    requirements explicitly provided by the customer.

11. Do not treat questions asked by the assistant as customer
    requirements.

12. Do not assume a budget that the customer did not provide.

13. Keep all extracted information concise.

14. Return ONLY the structured JSON object.

15. Do not include explanations before or after the JSON.

The JSON must follow these exact output instructions:

{format_instructions}
"""
                ),
                (
                    "human",
                    """
Customer conversation:

{conversation}
"""
                )
            ]
        )

        self.chain = self.prompt | self.llm | self.parser

    async def run(
        self,
        state: AgentState
    ) -> AgentState:

        conversation = state.get(
            "conversation",
            []
        )

        result: RequirementsAnalysis = await self.chain.ainvoke(
            {
                "conversation": conversation,
                "format_instructions": (
                    self.parser.get_format_instructions()
                )
            }
        )

        analysis = result.model_dump()

        print("[ANALYZER] Requirements:")
        print(analysis)

        completed_steps = [
            *state.get("completed_steps", []),
            {
                "agent": "analyzer",
                "step": "requirements_analysis",
                "status": "completed"
            }
        ]

        return {
            **state,
            "analysis": analysis,
            "completed_steps": completed_steps,
            "current_agent": "analyzer",
            "current_step": "ANALYSIS_COMPLETED",
            "status": "ANALYSIS_COMPLETED"
        }