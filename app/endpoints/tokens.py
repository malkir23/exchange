import httpx
from fastapi.responses import JSONResponse
from fastapi import APIRouter

route = APIRouter()

@route.get("/tokens_names")
async def tokens_names(tokken: str = 'HYPE') -> JSONResponse:
	data = ['GUESS', 'HFUN', 'HYPE', 'NEIRO', 'OMNIX', 'PURR', 'VAPOR']
	return JSONResponse(status_code=200, content={"tokens": data})
