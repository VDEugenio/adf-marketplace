from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers.health import router as health_router
from routers.auth import router as auth_router
from routers.agents import router as agents_router
from routers.users import router as users_router


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

origins = [o.strip() for o in settings.frontend_url.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(agents_router, prefix="/api")
app.include_router(users_router, prefix="/api")
