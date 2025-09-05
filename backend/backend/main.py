from fastapi import FastAPI
from backend.web.api.router import api_router

app = FastAPI(title="LegalEase Backend")

app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)