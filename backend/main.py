from contextlib import asynccontextmanager
from fastapi import FastAPI
from routers.health import router as health_router
from routers.auth import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    from storage import storage  # noqa: F401 — eager import surfaces misconfiguration at startup
    from db.base import Base
    from db.session import engine
    import models  # noqa: F401 — registers all ORM models before create_all

    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="ADF Marketplace API",
    description="Backend API for the ADF Marketplace — upload, browse, and download .adf agent files.",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(health_router)
app.include_router(auth_router)
