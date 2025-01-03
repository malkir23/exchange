import httpx
from fastapi.responses import JSONResponse
from fastapi import APIRouter

route = APIRouter()

@route.get("/get_twap_data")
async def get_twap_data(token: str = 'HYPE') -> JSONResponse:
    url = f'https://api.hypurrscan.io/twap/{token}'
    headers = {'Accept': 'application/json'}

    print(f"Requesting data from {url}")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return JSONResponse(content=response.json())
        except httpx.RequestError as e:
            return JSONResponse(status_code=500, content={"error": f"Error requesting API: {e}"})
        except httpx.HTTPStatusError as e:
            return JSONResponse(status_code=500, content={"error": f"HTTP error: {e}"})
