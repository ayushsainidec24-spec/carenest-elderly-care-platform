from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.auth.routes import router as auth_router
from app.exceptions.handlers import custom_exception_handler
from app.services.rate_limiter import rate_limit

app = FastAPI()

app.include_router(auth_router, prefix="/auth")

@app.middleware("http")
async def limit_requests(request: Request, call_next):
    ip = request.client.host
    if not rate_limit(ip):
        return JSONResponse(status_code=429, content={"error": "Too many requests"})
    return await call_next(request)

app.add_exception_handler(Exception, custom_exception_handler)

@app.get("/")
def root():
    return {"message": "FastAPI running 🚀"}