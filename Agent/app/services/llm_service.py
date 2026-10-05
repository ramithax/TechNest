from langchain_openai import ChatOpenAI

from app.config.settings import settings


class LLMService:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="auto",
            api_key=settings.openai_api_key,
            base_url=settings.freellm_base_url,
            temperature=0
        )

    def get_llm(self):
        return self.llm