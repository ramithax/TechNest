from fastapi import APIRouter
from pydantic import BaseModel, Field
from uuid import uuid4

from app.graph.workflow import build_graph


router = APIRouter()

graph = build_graph()


# ============================================================
# REQUEST MODELS
# ============================================================

class ChatMessage(BaseModel):
    role: str
    content: str


class WorkflowRequest(BaseModel):
    user_id: int
    objective: str
    conversation: list[ChatMessage] = Field(
        default_factory=list
    )


# ============================================================
# RESPONSE MODEL
# ============================================================

class WorkflowResponse(BaseModel):
    workflow_id: str
    status: str
    objective: str
    plan: list
    chat_response: str
    ready_to_build: bool
    build: dict | None = None
    validation: dict | None = None
    errors: list[str] = Field(
        default_factory=list
    )
    message: str


# ============================================================
# START WORKFLOW
# ============================================================

@router.post(
    "/workflow",
    response_model=WorkflowResponse
)
async def start_workflow(
    request: WorkflowRequest
):
    workflow_id = str(uuid4())

    conversation = [
        message.model_dump()
        for message in request.conversation
    ]

    if not conversation:
        conversation = [
            {
                "role": "user",
                "content": request.objective
            }
        ]

    initial_state = {
        "workflow_id": workflow_id,
        "user_id": request.user_id,
        "objective": request.objective,
        "conversation": conversation,

        "status": "RECEIVED",
        "current_step": "START",
        "current_agent": "",

        "chat_response": "",
        "user_message": "",

        "ready_to_build": False,

        "plan": [],
        "completed_steps": [],

        "analysis": {},
        "build": {},
        "validation": {},

        "errors": [],

        "approval_required": False,
        "approval_status": None,
        "revision_count": 0,

        "final_result": None
    }

    # ========================================================
    # RUN GRAPH
    # ========================================================

    result = await graph.ainvoke(
        initial_state
    )

    # ========================================================
    # GET RESULTS
    # ========================================================

    build = result.get("build") or None

    validation = result.get("validation") or None

    status = result.get(
        "status",
        "UNKNOWN"
    )

    chat_response = result.get(
        "chat_response",
        ""
    )

    user_message = result.get(
        "user_message",
        ""
    )

    errors = result.get(
        "errors",
        []
    )

    # ========================================================
    # BUILD UNAVAILABLE
    # ========================================================

    if status == "BUILD_UNAVAILABLE":
        if user_message:
            chat_response = user_message

        elif chat_response:
            chat_response = chat_response

        else:
            chat_response = (
                "I couldn't create the requested PC build "
                "with the products currently available."
            )

    # ========================================================
    # BUILD CREATED
    # ========================================================

    else:
        products = (build or {}).get(
            "products",
            []
        )

        if products:
            product_lines = [
                (
                    f"{product.get('name', 'Product')} - Rs. "
                    f"{float(product.get('unit_price', 0)):,.2f}"
                )
                for product in products
            ]

            build_message = (
                "PC build summary:\n"
                + "\n".join(product_lines)
                + (
                    f"\nTotal: Rs. "
                    f"{float(build.get('total_amount', 0)):,.2f}"
                )
            )

            if chat_response:
                chat_response = (
                    f"{chat_response}\n\n"
                    f"{build_message}"
                )
            else:
                chat_response = build_message

        # ====================================================
        # USER MESSAGE FALLBACK
        # ====================================================

        elif user_message:
            chat_response = user_message

        # ====================================================
        # ERROR FALLBACK
        # ====================================================

        elif errors:
            if not chat_response:
                chat_response = "; ".join(
                    errors
                )

        # ====================================================
        # GENERAL FALLBACK
        # ====================================================

        elif not chat_response:
            chat_response = (
                f"Workflow finished with status "
                f"{status}."
            )

    # ========================================================
    # RESPONSE
    # ========================================================

    return WorkflowResponse(
        workflow_id=workflow_id,

        status=status,

        objective=result.get(
            "objective",
            request.objective
        ),

        plan=result.get(
            "plan",
            []
        ),

        chat_response=chat_response,

        ready_to_build=result.get(
            "ready_to_build",
            False
        ),

        build=build,

        validation=validation,

        errors=errors,

        message=chat_response
    )