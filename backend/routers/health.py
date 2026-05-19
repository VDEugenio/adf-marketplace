from fastapi import APIRouter
from fastapi.responses import JSONResponse
from db.session import ping_db

router = APIRouter()


@router.get("/health", tags=["meta"])
def health_check():
    """Returns 200 if the service is up and the database is reachable, 503 otherwise."""
    db_ok = ping_db()
    return JSONResponse(
        content={
            "status": "ok" if db_ok else "degraded",
            "database": "connected" if db_ok else "unreachable",
        },
        status_code=200 if db_ok else 503,
    )
