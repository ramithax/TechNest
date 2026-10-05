from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    # ASP.NET Core API
    backend_url: str = "http://localhost:5031"

    # Agent service
    agent_service_host: str = "127.0.0.1"
    agent_service_port: int = 8000

    # LLM configuration
    openai_api_key: str 
    freellm_base_url: str

    class Config:
        env_file = ".env"


settings = Settings()