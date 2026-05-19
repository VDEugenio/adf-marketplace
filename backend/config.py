from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Database
    database_url: str

    # Storage
    storage_backend: str = "local"
    local_storage_path: str = "./uploads"

    # S3 — only required when storage_backend == "s3"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_s3_bucket_name: str = ""
    aws_s3_region: str = "us-east-1"

    # GitHub OAuth — stubbed, not used in Session 1
    github_client_id: str = ""
    github_client_secret: str = ""
    github_redirect_uri: str = ""

    # JWT
    secret_key: str = "changeme"
    access_token_expire_minutes: int = 60


settings = Settings()
