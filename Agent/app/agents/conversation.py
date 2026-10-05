import json

from langchain_core.prompts import ChatPromptTemplate

from app.graph.state import AgentState
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

IMPORTANT CURRENCY RULE:

TechNest is a Sri Lankan computer store.

All prices and budgets are in Sri Lankan Rupees.

Always refer to the currency as:
- Rs.
- LKR

NEVER use:
- ₹
- INR
- Indian Rupees

RULES:

1. Be conversational and friendly.

2. Do not ask unnecessary questions.

3. Do not ask for information the customer already provided.

4. Never invent customer requirements.

5. Do not recommend specific products.

6. Do not claim that components are compatible.

7. Ask one useful question at a time when important information
   is missing.

8. The customer's intended use is required.

9. A budget is strongly preferred.

10. Determine performance expectations only from information
    explicitly provided by the customer.

11. Special requirements must only contain requirements
    explicitly provided by the customer.

12. If the customer has provided enough information to create
    a reasonable PC build, set ready_to_build to true.

13. If important information is missing, set ready_to_build
    to false.

14. Do not ask for exact hardware components.

15. Keep the response concise.

16. Return ONLY a valid JSON object.

17. Do NOT use markdown.

18. Do NOT use ```json or ```.

19. Do NOT include explanations outside the JSON.

20. If you ask the customer a question because important
    information is missing, ready_to_build MUST be false.

21. If ready_to_build is true, do not ask additional questions
    that are not necessary for building the PC.

The JSON MUST contain exactly these fields:

{{
  "response": "your response to the customer",
  "ready_to_build": false
}}

If enough information is available, ready_to_build must be true.

If important information is missing, ready_to_build must be false.
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

        # Remove markdown code fences if the model
        # returns ```json ... ```
        if text.startswith("```"):
            lines = text.splitlines()

            if lines:
                lines = lines[1:]

            if (
                lines
                and lines[-1].strip() == "```"
            ):
                lines = lines[:-1]

            text = "\n".join(
                lines
            ).strip()

        # Find the JSON object if the model
        # adds text around it.
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
                "Invalid JSON returned by conversation model: "
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