import os
from pydantic import BaseModel

class Settings(BaseModel):
    app_name: str = "RailSync AI Engine"
    environment: str = os.getenv("ENVIRONMENT", "development")
    port: int = int(os.getenv("PORT", 8000))
    snowflake_account: str = os.getenv("SNOWFLAKE_ACCOUNT", "mock-account")
    snowflake_database: str = os.getenv("SNOWFLAKE_DATABASE", "RAILSYNC_DB")

settings = Settings()
