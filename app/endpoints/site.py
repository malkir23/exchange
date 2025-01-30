import re
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from app.settings.templates import get_templates
from app.settings.base import get_collection

route = APIRouter()


@route.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return get_templates().TemplateResponse("twaps.html", {"request": request})


@route.get("/tokens", response_class=HTMLResponse)
async def read_token(request: Request):
    return get_templates().TemplateResponse("tokens.html", {"request": request})


@route.post("/save-data")
async def trigger_data_fetch(request: Request):
    data_json = await request.json()
    collection = await get_collection("daily_data")

    inserted_count = 0
    updated_count = 0

    for item in data_json:
        result = await collection.update_one(
            {"_id": item["_id"]},
            {"$set": item},
            upsert=True
        )
        if result.matched_count > 0:
            updated_count += 1
        else:
            inserted_count += 1

    return {
        "status": "Task completed",
        "inserted_count": inserted_count,
        "updated_count": updated_count
    }


@route.get("/data")
async def get_stored_data():
    collection = await get_collection("daily_data")
    data = await collection.find().to_list(100)  # Отримуємо до 100 записів
    return {"data": data}
