from fastapi import FastAPI

from app.api.routes import router


app = FastAPI(
    title="PcBuilder Agentic AI",
    description="Internal Agentic AI service for TechNest",
    version="1.0.0",
)

app.include_router(
    router,
    prefix="/api/agent",
)


@app.get("/")
async def root():
    return {
        "service": "TechNest Agentic AI",
        "status": "running",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
    }
