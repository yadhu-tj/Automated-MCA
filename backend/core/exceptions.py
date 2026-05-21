from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from beanie.exceptions import CollectionWasNotInitialized
from pymongo.errors import PyMongoError

from core.config import logger


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.debug(
        "Validation failed for %s %s: %s | body=%s",
        request.method,
        request.url.path,
        exc.errors(),
        getattr(exc, "body", None),
    )
    logger.warning(
        "Validation failed for %s %s: %d error(s)",
        request.method,
        request.url.path,
        len(exc.errors()),
    )
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )


async def database_not_initialized_handler(request: Request, exc: CollectionWasNotInitialized):
    logger.error("Database connection / beanie not initialized: %s", exc)
    return JSONResponse(
        status_code=503,
        content={"detail": "Database service is temporarily unavailable. Please try again later."},
    )


async def pymongo_exception_handler(request: Request, exc: PyMongoError):
    logger.error("MongoDB database error: %s", exc)
    return JSONResponse(
        status_code=503,
        content={"detail": "Database service is temporarily unavailable. Please try again later."},
    )


