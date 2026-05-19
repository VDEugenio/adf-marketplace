import uuid
from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from auth.jwt import get_current_user
from db.session import get_db
from models.agent import Agent, VALID_CATEGORIES
from models.user import User
from services.adf_parser import ADFValidationError, parse_adf
from storage import storage

router = APIRouter(prefix="/agents", tags=["agents"])


def _split_csv(value: str) -> List[str]:
    return [v.strip() for v in value.split(",") if v.strip()]


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
