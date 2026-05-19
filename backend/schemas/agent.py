import uuid
from datetime import datetime

from pydantic import BaseModel


class UploaderSummary(BaseModel):
    id: uuid.UUID
    username: str
    display_name: str | None
    avatar_url: str | None

    model_config = {"from_attributes": True}


class AgentSummary(BaseModel):
    id: uuid.UUID
    name: str
    document_md: str | None
    tools: list[str]
    tags: list[str]
    compatible_llms: list[str]
    category: str | None
    download_count: int
    star_count: int
    created_at: datetime
    uploader: UploaderSummary

    model_config = {"from_attributes": True}


class AgentDetail(AgentSummary):
    updated_at: datetime


class StarResponse(BaseModel):
    starred: bool
    star_count: int


class PaginatedAgents(BaseModel):
    agents: list[AgentSummary]
    total: int
    page: int
    per_page: int
