from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

from app.graph.state import AgentState
from app.models.conversation import ConversationResponse
from app.services.llm_service import LLMService


class ConversationAgent:
    def __init__(self):
        self.llm = LLMService().get_llm()

        self.parser = PydanticOutputParser(
            pydantic_object=ConversationResponse
        )

        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """
You are the TechNest AI PC Builder conversational assistant.

Your job is to talk naturally with the customer and collect
enough information to create a PC configuration.

You are NOT responsible for selecting products.

You are NOT responsible for checking hardware compatibility.

You only decide whether enough customer requirements are
available to start the PC building workflow.

IMPORTANT:

1. Be conversational and friendly.
2. Do not ask unnecessary questions.
3. Do not ask for information that the customer already provided.
4. Never invent customer requirements.
5. Do not recommend specific products.
6. Do not claim that components are compatible.
7. Ask one useful question at a time when information is missing.
8. A budget is strongly preferred for a build.
9. The intended use of the PC is required.
10. Determine performance expectations from the customer's
    explicit requirements.
11. Special requirements should only contain requirements
    explicitly provided by the customer.
12. If the customer has already provided enough information,
    set ready_to_build to true.
13. If information is missing, set ready_to_build to false.
14. When asking a question, keep the response concise.
15. Do not ask for exact hardware components.

Examples:

Customer:
"I need a PC."

Response:
"Sure! What will you mainly use the PC for, such as gaming,
AI development, programming, video editing, or general work?"

ready_to_build:
false

Customer:
"I need a gaming PC around Rs. 500,000."

Response:
"Great. Do you have any specific gaming or performance
preferences I should consider?"

ready_to_build:
true

Customer:
"I need a workstation for AI development around Rs. 500,000."

Response:
"Great. I have enough information to start building your PC."

ready_to_build:
true

IMPORTANT:

Do not require every possible detail. If the customer has
clearly provided a use case and budget, the build workflow
can begin.

You MUST return the result in the exact JSON format required
by the output instructions below.

{format_instructions}
"""
                ),
                (
                    "human",
                    """
Customer conversation:

{conversation}

Determine the next conversational response.
"""
                )
            ]
        )

        self.chain = self.prompt | self.llm | self.parser

    async def run(self, state: AgentState) -> AgentState:
        conversation = state.get(
            "conversation",
            []
        )

        result: ConversationResponse = await self.chain.ainvoke(
            {
                "conversation": conversation,
                "format_instructions": self.parser.get_format_instructions(),
            }
        )

        return {
            **state,
            "chat_response": result.response,
            "ready_to_build": result.ready_to_build,
            "current_agent": "conversation",
            "current_step": (
                "CONVERSATION_READY"
                if result.ready_to_build
                else "CONVERSATION_CONTINUES"
            ),
            "status": (
                "READY_TO_BUILD"
                if result.ready_to_build
                else "WAITING_FOR_INFORMATION"
            )
        }