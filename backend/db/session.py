from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from config import settings

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,  # re-validates connections before use; catches stale TCP connections
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    """FastAPI dependency: yields a DB session and ensures it is closed after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ping_db() -> bool:
    """Execute a trivial query to confirm the database is reachable. Returns True on success."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
