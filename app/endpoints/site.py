from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

route = APIRouter()

# Додаємо маршрути для статичних файлів, якщо вони є
route.mount("/static", StaticFiles(directory="static"), name="static")

# Налаштування шаблонів
templates = Jinja2Templates(directory="templates")


@route.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
