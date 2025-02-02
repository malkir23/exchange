from fastapi import FastAPI
from app.endpoints import site, twaps, tokens
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.openapi_schema = None

# Додаємо маршрути для статичних файлів, якщо вони є
app.mount("/static", StaticFiles(directory="app/static"), name="static")

app.include_router(site.route, tags=["Site"])
app.include_router(twaps.route, prefix="/twaps", tags=["TWAPS"])
app.include_router(tokens.route, prefix="/tokens", tags=["Tokens"])

