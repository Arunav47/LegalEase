from fastapi.routing import APIRouter
from backend.web.api.documentAI import views as documentAI_views
from backend.web.api.legalAI import views as legalAI_views
from backend.web.api import echo, monitoring, redis

api_router = APIRouter()
api_router.include_router(monitoring.router)
api_router.include_router(echo.router, prefix="/echo", tags=["echo"])
api_router.include_router(redis.router, prefix="/redis", tags=["redis"])
api_router.include_router(documentAI_views.router, prefix="/documentai", tags=["Document AI"])
api_router.include_router(legalAI_views.router, prefix="/legalai", tags=["Legal AI"])