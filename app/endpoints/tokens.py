from fastapi.responses import JSONResponse
from fastapi import APIRouter
import httpx


route = APIRouter()

@route.get("/tokens_names")
async def tokens_names() -> JSONResponse:
    data = ['GUESS', 'HFUN', 'HYPE', 'NEIRO', 'OMNIX', 'PURR', 'VAPOR']
    return JSONResponse(status_code=200, content={"tokens": data})


@route.post("/tokens_time")
async def tokens_time() -> JSONResponse:
    url = 'https://api-ui.hyperliquid.xyz/info'
    headers = {'Accept': 'application/json'}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers)
            response.raise_for_status()
            return JSONResponse(content=response.json())
        except httpx.RequestError as e:
            return JSONResponse(status_code=500, content={"error": f"Error requesting API: {e}"})
        except httpx.HTTPStatusError as e:
            return JSONResponse(status_code=500, content={"error": f"HTTP error: {e}"})
