from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse
from app.settings.templates import get_templates
from app.settings.base import get_collection
from pymongo import UpdateOne
from app.services.mongo_services import from_mongo_to_doc
from app.services.date_services import date_format

route = APIRouter()


@route.get("/twaps", response_class=HTMLResponse)
async def read_root(request: Request):
    return get_templates().TemplateResponse("twaps.html", {"request": request})


@route.get("/", response_class=HTMLResponse)
async def read_token(request: Request):
    return get_templates().TemplateResponse("tokens.html", {"request": request})


@route.post("/save-data")
async def trigger_data_fetch(request: Request):
    data_json = await request.json()
    if not isinstance(data_json, dict):
        raise HTTPException(
            status_code=400, detail="Invalid JSON format, expected a dictionary"
        )

    collection = await get_collection("daily_data")
    bulk_operations = []

    for date, tokens in data_json.items():
        formatted_date = date_format()

        print(date, formatted_date)
        # if date != str(formatted_date):
        #     continue

        existing_doc = await collection.find_one({"date": formatted_date})
        if existing_doc:
            bulk_operations.append(
                UpdateOne({"date": date}, {"$set": tokens}, upsert=True)
            )
        else:
            tokens.update({"date": date})
            bulk_operations.append(
                UpdateOne({"date": date}, {"$setOnInsert": tokens}, upsert=True)
            )

    if bulk_operations:
        result = await collection.bulk_write(bulk_operations)
        return {
            "status": "Task completed",
            "inserted_count": result.upserted_count,
            "updated_count": result.modified_count,
        }

    return {"status": "No data to process"}


@route.get("/data")
async def get_stored_data():
    collection = await get_collection("daily_data")
    cursor = collection.find()
    data = {doc["date"]: from_mongo_to_doc(doc) async for doc in cursor}
    return {"data": data}
