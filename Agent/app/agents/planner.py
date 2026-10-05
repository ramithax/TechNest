from app.graph.state import AgentState


class PlannerAgent:
    def __init__(self):
        self.plan = [
            {
                "agent": "analyzer",
                "description": "Analyze the customer's PC requirements."
            },
            {
                "agent": "build_agent",
                "description": "Create a PC configuration using real catalogue products."
            },
            {
                "agent": "validator",
                "description": "Validate compatibility, budget, stock and business rules."
            }
        ]

    async def run(self, state: AgentState) -> AgentState:
        return {
            **state,
            "plan": self.plan,
            "current_agent": "planner",
            "current_step": "PLANNING_COMPLETED",
            "status": "PLAN_CREATED"
        }