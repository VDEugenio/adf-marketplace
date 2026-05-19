"""
Search service layer for agents.

Keeping search behind a narrow interface makes it straightforward to add a
semantic/vector search implementation alongside this PostgreSQL FTS one in a
future session — override `get_search_service` via app.dependency_overrides or
swap the concrete class returned from the factory.
"""
from typing import Protocol, runtime_checkable

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload


@runtime_checkable
class AgentSearchService(Protocol):
    def search(
        self,
        db: Session,
        *,
        q: str | None = None,
        category: str | None = None,
        tags: list[str] | None = None,
        sort: str = "newest",
        page: int = 1,
        per_page: int = 20,
    ) -> tuple[list, int]: ...


class PostgresFTSSearchService:
    """Full-text search using PostgreSQL's built-in tsvector / tsquery."""

    def search(
        self,
        db: Session,
        *,
        q: str | None = None,
        category: str | None = None,
        tags: list[str] | None = None,
        sort: str = "newest",
        page: int = 1,
        per_page: int = 20,
    ) -> tuple[list, int]:
        from models.agent import Agent

        query = db.query(Agent).options(joinedload(Agent.uploader))

        if q:
            # Concatenate name and document_md into a single tsvector; concat_ws
            # skips NULL values so a missing document_md won't break the query.
            ts_vector = func.to_tsvector(
                "english",
                func.concat_ws(" ", Agent.name, Agent.document_md),
            )
            ts_query = func.plainto_tsquery("english", q)
            query = query.filter(ts_vector.op("@@")(ts_query))

        if category:
            query = query.filter(Agent.category == category)

        if tags:
            # PostgreSQL && operator: rows whose tags array overlaps the filter list
            query = query.filter(Agent.tags.overlap(tags))

        total = query.count()

        if sort == "most_downloaded":
            query = query.order_by(Agent.download_count.desc(), Agent.created_at.desc())
        elif sort == "most_starred":
            query = query.order_by(Agent.star_count.desc(), Agent.created_at.desc())
        else:
            query = query.order_by(Agent.created_at.desc())

        agents = query.offset((page - 1) * per_page).limit(per_page).all()
        return agents, total
