from fastapi import FastAPI
from app.endpoints import site, twaps
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(site.route, prefix="/site", tags=["Site"])
app.include_router(twaps.route, prefix="/twaps", tags=["TWAPS"])
