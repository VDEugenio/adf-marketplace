import uuid
from pydantic import BaseModel
from schemas.agent import AgentSummary


class UserProfile(BaseModel):
    id: uuid.UUID
    username: str
    display_name: str | None
    avatar_url: str | None
    agents: list[AgentSummary]
    total_downloads: int

    model_config = {"from_attributes": True}
