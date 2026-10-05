import json

from langchain_core.prompts import ChatPromptTemplate

from app.graph.state import AgentState
from app.models.conversation import ConversationResponse
from app.services.llm_service import LLMService


class ConversationAgent:
    def __init__(self):
        self.llm = LLMService().get_llm()

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

IMPORTANT RULES:

1. Be conversational and friendly.

2. Do not ask unnecessary questions.

3. Do not ask for information that the customer already provided.

4. Never invent customer requirements.

5. Do not recommend specific products.

6. Do not claim that components are compatible.

7. Ask one useful question at a time when information is missing.

8. A budget is strongly preferred for a build.

9. The intended use of the PC is required.

10. Determine performance expectations only from the
customer's explicit requirements.

11. Special requirements should only contain requirements
explicitly provided by the customer.

12. If the customer has already provided enough information,
set ready_to_build to true.

13. If important information is missing, set ready_to_build
to false.

14. Do not ask for exact hardware components.

15. Keep the response concise.

16. Return ONLY valid JSON.

17. Do NOT use markdown.

18. Do NOT wrap the JSON in ```json or ```.

19. Do NOT write anything before or after the JSON.

The JSON format MUST be exactly:

{
  "response": "your conversational response",
  "ready_to_build": false
}

When the customer has provided enough information:

{
  "response": "Great. I have enough information to start building your PC.",
  "ready_to_build": true
}

Example:

Customer:
"I need a PC."

Return:

{
  "response": "Sure! What will you mainly use the PC for, such as gaming, AI development, programming, video editing, or general work?",
  "ready_to_build": false
}

Customer:
"I need a gaming PC around Rs. 500,000."

Return:

{
  "response": "Great. I have enough information to start building your PC.",
  "ready_to_build": true
}

Customer:
"I need a workstation for AI development around Rs. 500,000."

Return:

{
  "response": "Great. I have enough information to start building your PC.",
  "ready_to_build": true
}
"""
                ),
                (
                    "human",
                    """
Customer conversation:

{conversation}

Return ONLY the JSON object.
"""
                )
            ]
        )

        self.chain = self.prompt | self.llm

    async def run(
        self,
        state: AgentState
    ) -> AgentState:

        conversation = state.get(
            "conversation",
            []
        )

        try:
            result = await self.chain.ainvoke(
                {
                    "conversation": conversation
                }
            )

            raw_content = result.content

            print(
                "[CONVERSATION] Raw LLM response:"
            )
            print(
                repr(raw_content)
            )

            if not raw_content:
                raise ValueError(
                    "Conversation model returned an empty response."
                )

            parsed = self._parse_response(
                raw_content
            )

            response = parsed.get(
                "response"
            )

            ready_to_build = parsed.get(
                "ready_to_build"
            )

            if not isinstance(
                response,
                str
            ):
                raise ValueError(
                    "Conversation response must be a string."
                )

            if not isinstance(
                ready_to_build,
                bool
            ):
                raise ValueError(
                    "ready_to_build must be a boolean."
                )

            return {
                **state,
                "chat_response": response,
                "ready_to_build": ready_to_build,
                "current_agent": "conversation",
                "current_step": (
                    "CONVERSATION_READY"
                    if ready_to_build
                    else "CONVERSATION_CONTINUES"
                ),
                "status": (
                    "READY_TO_BUILD"
                    if ready_to_build
                    else "WAITING_FOR_INFORMATION"
                )
            }

        except Exception as ex:
            print(
                f"[CONVERSATION] Failed: {str(ex)}"
            )

            return {
                **state,
                "current_agent": "conversation",
                "current_step": "CONVERSATION_FAILED",
                "status": "FAILED_SAFE",
                "errors": [
                    *state.get(
                        "errors",
                        []
                    ),
                    f"Conversation agent failed: {str(ex)}"
                ],
                "chat_response": (
                    "Sorry, I couldn't process your request "
                    "right now. Please try again."
                ),
                "ready_to_build": False
            }

    def _parse_response(
        self,
        raw_content: str
    ) -> dict:

        text = raw_content.strip()

        # Remove markdown code fences if the model ignores
        # the instruction and returns ```json ... ```
        if text.startswith("```"):
            lines = text.splitlines()

            if lines:
                lines = lines[1:]

            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]

            text = "\n".join(
                lines
            ).strip()

        # Find JSON object if the model added extra text.
        start = text.find("{")
        end = text.rfind("}")

        if start == -1 or end == -1:
            raise ValueError(
                f"Model did not return a JSON object: {text!r}"
            )

        text = text[start:end + 1]

        try:
            parsed = json.loads(
                text
            )
        except json.JSONDecodeError as ex:
            raise ValueError(
                f"Invalid JSON returned by conversation model: "
                f"{text!r}"
            ) from ex

        if not isinstance(
            parsed,
            dict
        ):
            raise ValueError(
                "Conversation model returned JSON "
                "but it was not an object."
            )

        return parsed