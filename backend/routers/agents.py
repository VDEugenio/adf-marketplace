import uuid
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session, joinedload

from auth.jwt import get_current_user
from db.session import get_db
from models.agent import Agent, Star, VALID_CATEGORIES
from models.user import User
from schemas.agent import AgentDetail, PaginatedAgents, StarResponse
from services.adf_parser import ADFValidationError, parse_adf
from services.search import AgentSearchService, PostgresFTSSearchService
from storage import storage

router = APIRouter(prefix="/agents", tags=["agents"])

_fts_service = PostgresFTSSearchService()


def get_search_service() -> AgentSearchService:
    """
    Returns the active search service implementation.

    To add semantic/vector search in a future session, override this dependency:
        app.dependency_overrides[get_search_service] = get_semantic_search_service
    """
    return _fts_service


def _split_csv(value: str) -> List[str]:
    return [v.strip() for v in value.split(",") if v.strip()]


SortParam = Annotated[
    str,
    Query(pattern="^(newest|most_downloaded|most_starred)$"),
]


# --- Browse & Search ---

@router.get("", response_model=PaginatedAgents)
def list_agents(
    sort: SortParam = "newest",
    page: Annotated[int, Query(ge=1)] = 1,
    per_page: Annotated[int, Query(ge=1, le=100)] = 20,
    db: Session = Depends(get_db),
    search: AgentSearchService = Depends(get_search_service),
):
    agents, total = search.search(db, sort=sort, page=page, per_page=per_page)
    return PaginatedAgents(agents=agents, total=total, page=page, per_page=per_page)


@router.get("/search", response_model=PaginatedAgents)
def search_agents(
    q: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    tags: Optional[str] = Query(None, description="Comma-separated list of tags"),
    sort: SortParam = "newest",
    page: Annotated[int, Query(ge=1)] = 1,
    per_page: Annotated[int, Query(ge=1, le=100)] = 20,
    db: Session = Depends(get_db),
    search: AgentSearchService = Depends(get_search_service),
):
    tag_list = [t.strip() for t in tags.split(",")] if tags else None
    agents, total = search.search(
        db, q=q, category=category, tags=tag_list, sort=sort, page=page, per_page=per_page
    )
    return PaginatedAgents(agents=agents, total=total, page=page, per_page=per_page)


@router.get("/{agent_id}", response_model=AgentDetail)
def get_agent(
    agent_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    agent = (
        db.query(Agent)
        .options(joinedload(Agent.uploader))
        .filter(Agent.id == agent_id)
        .first()
    )
    if not agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")

    agent.download_count += 1
    db.commit()
    db.refresh(agent)
    return agent


@router.post("/{agent_id}/star", response_model=StarResponse)
def toggle_star(
    agent_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    agent = db.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")

    existing = (
        db.query(Star)
        .filter(Star.user_id == current_user.id, Star.agent_id == agent_id)
        .first()
    )

    if existing:
        db.delete(existing)
        agent.star_count = max(0, agent.star_count - 1)
        starred = False
    else:
        db.add(Star(user_id=current_user.id, agent_id=agent_id))
        agent.star_count += 1
        starred = True

    db.commit()
    db.refresh(agent)
    return StarResponse(starred=starred, star_count=agent.star_count)


# --- Upload ---

@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_agent(
    file: UploadFile = File(...),
    tags: str = Form(default=""),
    compatible_llms: str = Form(default=""),
    category: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid category. Must be one of: {', '.join(VALID_CATEGORIES)}",
        )

    file_bytes = await file.read()

    try:
        adf_data = parse_adf(file_bytes)
    except ADFValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )

    agent_id = uuid.uuid4()
    storage_key = f"agents/{current_user.id}/{agent_id}.adf"
    storage.upload_file(file_bytes, storage_key)

    agent = Agent(
        id=agent_id,
        uploader_id=current_user.id,
        name=adf_data.name,
        document_md=adf_data.document_md,
        tools=adf_data.tools,
        tags=_split_csv(tags),
        compatible_llms=_split_csv(compatible_llms),
        category=category,
        file_path=storage_key,
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)

    return {
        "id": str(agent.id),
        "uploader_id": str(agent.uploader_id),
        "name": agent.name,
        "document_md": agent.document_md,
        "tools": agent.tools,
        "tags": agent.tags,
        "compatible_llms": agent.compatible_llms,
        "category": agent.category,
        "file_path": agent.file_path,
        "download_count": agent.download_count,
        "star_count": agent.star_count,
        "created_at": agent.created_at.isoformat(),
        "updated_at": agent.updated_at.isoformat(),
    }
