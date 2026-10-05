from datetime import datetime, timezone
from typing import Any

from app.graph.state import AgentState


def add_audit_event(
    state: AgentState,
    step: str,
    status: str,
    *,
    user_id: int | None = None,
    comment: str | None = None,
) -> list[dict[str, Any]]:
    history = list(state.get("audit_history", []))
    event: dict[str, Any] = {
        "step": step,
        "status": status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    if user_id is not None:
        event["user_id"] = user_id
    if comment is not None:
        event["comment"] = comment
    history.append(event)
    return history
