import time

from langgraph.graph import StateGraph, START, END

from app.graph.state import AgentState

from app.agents.conversation import ConversationAgent
from app.agents.planner import PlannerAgent
from app.agents.analyzer import AnalyzerAgent
from app.agents.builder import BuildAgent
from app.agents.validator import ValidatorAgent


conversation_agent = ConversationAgent()
planner_agent = PlannerAgent()
analyzer_agent = AnalyzerAgent()
builder_agent = BuildAgent()
validation_agent = ValidatorAgent()


# ============================================================
# CONVERSATION NODE
# ============================================================

async def conversation_node(state: AgentState) -> AgentState:
    start = time.perf_counter()

    print("\n[WORKFLOW] Conversation agent started")

    result = await conversation_agent.run(state)

    print(
        f"[WORKFLOW] Conversation agent completed in "
        f"{time.perf_counter() - start:.2f}s"
    )

    return result


# ============================================================
# PLANNER NODE
# ============================================================

async def planner_node(state: AgentState) -> AgentState:
    start = time.perf_counter()

    print("\n[WORKFLOW] Planner started")

    result = await planner_agent.run(state)

    print(
        f"[WORKFLOW] Planner completed in "
        f"{time.perf_counter() - start:.2f}s"
    )

    return result


# ============================================================
# ANALYZER NODE
# ============================================================

async def analyzer_node(state: AgentState) -> AgentState:
    start = time.perf_counter()

    print("\n[WORKFLOW] Analyzer started")

    result = await analyzer_agent.run(state)

    print(
        f"[WORKFLOW] Analyzer completed in "
        f"{time.perf_counter() - start:.2f}s"
    )

    return result


# ============================================================
# BUILD NODE
# ============================================================

async def build_node(state: AgentState) -> AgentState:
    start = time.perf_counter()

    print("\n[WORKFLOW] Build agent started")

    result = await builder_agent.run(state)

    print(
        f"[WORKFLOW] Build agent completed in "
        f"{time.perf_counter() - start:.2f}s"
    )

    return result


# ============================================================
# VALIDATOR NODE
# ============================================================

async def validator_node(state: AgentState) -> AgentState:
    start = time.perf_counter()

    print("\n[WORKFLOW] Validator agent started")

    result = await validation_agent.run(state)

    print(
        f"[WORKFLOW] Validator completed in "
        f"{time.perf_counter() - start:.2f}s"
    )

    return result


# ============================================================
# ALLOWED AGENTS
# ============================================================

ALLOWED_AGENTS = {
    "analyzer",
    "build_agent",
    "validator",
}


# ============================================================
# TERMINAL STATUSES
# ============================================================

TERMINAL_STATUSES = {
    "FAILED_SAFE",
    "WAITING_FOR_APPROVAL",

    # Build could not be created.
    "BUILD_UNAVAILABLE",

    # Explicit build failure.
    "BUILD_FAILED",

    # Optional additional terminal state.
    "REJECTED",
}


# ============================================================
# GET NEXT AGENT
# ============================================================

def get_next_agent(state: AgentState) -> str:
    status = state.get("status")

    print(
        f"[WORKFLOW ROUTER] Current status: {status}"
    )

    # --------------------------------------------------------
    # Terminal states
    # --------------------------------------------------------

    if status in TERMINAL_STATUSES:
        print(
            f"[WORKFLOW ROUTER] Terminal status: {status}"
        )
        return "END"

    # --------------------------------------------------------
    # Revision required
    # --------------------------------------------------------

    if status == "REVISION_REQUIRED":
        print(
            "[WORKFLOW ROUTER] Revision required -> build_agent"
        )
        return "build_agent"

    # --------------------------------------------------------
    # Find next incomplete agent from plan
    # --------------------------------------------------------

    plan = state.get("plan", [])

    completed_steps = state.get(
        "completed_steps",
        []
    )

    completed_agents = {
        step.get("agent")
        for step in completed_steps
    }

    for step in plan:
        agent = step.get("agent")

        if agent not in ALLOWED_AGENTS:
            continue

        if agent not in completed_agents:
            print(
                f"[WORKFLOW ROUTER] Next agent: {agent}"
            )
            return agent

    # --------------------------------------------------------
    # Nothing left to execute
    # --------------------------------------------------------

    print(
        "[WORKFLOW ROUTER] No remaining agents -> END"
    )

    return "END"


# ============================================================
# DELEGATION ROUTER NODE
# ============================================================

def delegation_router(state: AgentState) -> AgentState:
    next_agent = get_next_agent(state)

    # --------------------------------------------------------
    # Workflow finished
    # --------------------------------------------------------

    if next_agent == "END":
        status = state.get("status")

        if status not in TERMINAL_STATUSES:
            status = "COMPLETED"

        print(
            f"[WORKFLOW] Workflow ending with status: {status}"
        )

        return {
            **state,
            "current_agent": "",
            "current_step": "WORKFLOW_COMPLETED",
            "status": status,
        }

    # --------------------------------------------------------
    # Delegate to next agent
    # --------------------------------------------------------

    print(
        f"[WORKFLOW] Delegating to: {next_agent}"
    )

    return {
        **state,
        "current_agent": next_agent,
        "current_step": (
            f"DELEGATED_TO_{next_agent.upper()}"
        ),
        "status": "AGENT_DELEGATED",
    }


# ============================================================
# CONVERSATION ROUTER
# ============================================================

def conversation_router(state: AgentState) -> str:
    if state.get("ready_to_build") is True:
        return "planner"

    return "END"


# ============================================================
# BUILD GRAPH
# ============================================================

def build_graph():
    graph = StateGraph(AgentState)

    # --------------------------------------------------------
    # Nodes
    # --------------------------------------------------------

    nodes = {
        "conversation": conversation_node,
        "planner": planner_node,
        "delegation": delegation_router,
        "analyzer": analyzer_node,
        "build_agent": build_node,
        "validator": validator_node,
    }

    for name, fn in nodes.items():
        graph.add_node(name, fn)

    # --------------------------------------------------------
    # START -> Conversation
    # --------------------------------------------------------

    graph.add_edge(
        START,
        "conversation"
    )

    # --------------------------------------------------------
    # Conversation routing
    # --------------------------------------------------------

    graph.add_conditional_edges(
        "conversation",
        conversation_router,
        {
            "planner": "planner",
            "END": END,
        }
    )

    # --------------------------------------------------------
    # Planner -> Delegation
    # --------------------------------------------------------

    graph.add_edge(
        "planner",
        "delegation"
    )

    # --------------------------------------------------------
    # Analyzer -> Delegation
    # --------------------------------------------------------

    graph.add_edge(
        "analyzer",
        "delegation"
    )

    # --------------------------------------------------------
    # Builder -> Delegation
    # --------------------------------------------------------

    graph.add_edge(
        "build_agent",
        "delegation"
    )

    # --------------------------------------------------------
    # Validator -> Delegation
    # --------------------------------------------------------

    graph.add_edge(
        "validator",
        "delegation"
    )

    # --------------------------------------------------------
    # Delegation routing
    # --------------------------------------------------------

    graph.add_conditional_edges(
        "delegation",
        get_next_agent,
        {
            "analyzer": "analyzer",
            "build_agent": "build_agent",
            "validator": "validator",
            "END": END,
        }
    )

    return graph.compile()