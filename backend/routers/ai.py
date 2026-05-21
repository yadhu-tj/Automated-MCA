from fastapi import APIRouter, Depends
from core.auth import get_current_admin

import schemas
from backend_services.greetings import generate_greeting_content

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/generate-greeting")
async def generate_greeting(request: schemas.GenerateGreetingRequest, admin: dict = Depends(get_current_admin)):
    """
    Generate an AI greeting using Google Gemini API.
    """
    return generate_greeting_content(request.category, request.recipientRole, request.context)


