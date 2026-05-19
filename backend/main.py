from contextlib import asynccontextmanager
from fastapi import FastAPI
from routers.health import router as health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    from storage import storage  # noqa: F401 — eager import surfaces misconfiguration at startup
    yield
    # shutdown: nothing to clean up in Session 1


app = FastAPI(
    title="ADF Marketplace API",
    description="Backend API for the ADF Marketplace — upload, browse, and download .adf agent files.",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(health_router)
