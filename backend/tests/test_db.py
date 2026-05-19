from sqlalchemy import text
from db.session import engine, ping_db


def test_database_connection():
    """Confirm we can open a connection to PostgreSQL and execute a trivial query."""
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        row = result.fetchone()
    assert row is not None
    assert row[0] == 1


def test_ping_db_returns_true():
    """ping_db() used by the health check must return True when the DB is live."""
    assert ping_db() is True
