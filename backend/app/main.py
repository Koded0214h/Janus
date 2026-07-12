from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db import Base, engine
from app.routers import approvals, audit, intents, policy


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Janus", version="0.1.0", lifespan=lifespan)

app.include_router(intents.router)
app.include_router(policy.router)
app.include_router(audit.router)
app.include_router(approvals.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
