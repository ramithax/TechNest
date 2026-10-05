from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ASP.NET Core API
    backend_url: str = "https://technest-1-ycx3.onrender.com"

    # Agent service
    agent_service_host: str = "0.0.0.0"
    agent_service_port: int = 8000

    # LLM configuration
    openai_api_key: str
    freellm_base_url: str
    model_name: str

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()