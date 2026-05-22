from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend_services.file_storage import (
    ALLOWED_PHOTO_TYPES,
    delete_certificate_attachment,
    get_media_path,
    infer_certificate_extension,
    save_certificate_attachment,
)
from backend_services.members import build_default_photo_url
from core.config import APP_DIR, CORS_ORIGINS
from contextlib import asynccontextmanager
from beanie.exceptions import CollectionWasNotInitialized
from pymongo.errors import PyMongoError
from core.database_init import initialize_database
from core.exceptions import (
    validation_exception_handler,
    database_not_initialized_handler,
    pymongo_exception_handler,
)
from routers import achievements, admin, ai, events, members, templates
from routers.admin import login_admin
from routers.ai import generate_greeting
from routers.members import create_member, delete_member, get_members, update_member, upload_member_photo
from routers.events import create_event, delete_event, get_events, get_upcoming_events, update_event
from routers.achievements import (
    create_achievement,
    delete_achievement,
    get_achievement,
    get_achievements,
    update_achievement,
)
from routers.templates import create_template, delete_template, get_templates, update_template
from schemas import GenerateGreetingRequest, LoginRequest


@asynccontextmanager
async def lifespan(app: FastAPI):
    await initialize_database(is_startup=True)
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="MCA Dept. Auto-Greeter API", lifespan=lifespan)
    app.mount("/uploads", StaticFiles(directory=str(APP_DIR / "uploads")), name="uploads")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(CollectionWasNotInitialized, database_not_initialized_handler)
    app.add_exception_handler(PyMongoError, pymongo_exception_handler)

    app.include_router(members.router)
    app.include_router(admin.router)
    app.include_router(ai.router)
    app.include_router(events.router)
    app.include_router(achievements.router)
    app.include_router(templates.router)

    @app.get("/")
    async def root():
        return {"message": "Welcome to the MCA Dept. Auto-Greeter API"}

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", reload=True)
