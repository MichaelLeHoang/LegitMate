from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import domain_analysis, reports

app = FastAPI(title="LegitMate API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"chrome-extension://.*|http://localhost(:\d+)?|http://127\.0\.0\.1(:\d+)?",
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
app.include_router(domain_analysis.router)
app.include_router(reports.router)


@app.get("/v1/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
