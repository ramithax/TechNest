from typing import TypedDict, Optional, List, Dict, Any


class AgentState(TypedDict, total=False):
    # Workflow information
    workflow_id: str
    user_id: int
    objective: str

    # Conversation
    conversation: List[Dict[str, str]]
    chat_response: str
    ready_to_build: bool

    # Planning
    plan: List[Dict[str, Any]]

    # Agent outputs
    analysis: Dict[str, Any]
    build: Dict[str, Any]
    validation: Dict[str, Any]

    # Execution
    completed_steps: List[Dict[str, Any]]
    current_step: str
    current_agent: str
    status: str

    # User-facing message
    user_message: str

    # Approval
    approval_required: bool
    approval_status: Optional[str]
    revision_count: int

    # Errors
    errors: List[str]

    # Final result
    final_result: Optional[Dict[str, Any]]