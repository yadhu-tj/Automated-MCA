from fastapi import APIRouter, HTTPException

import schemas
from core.config import ADMIN_EMAIL, ADMIN_PASSWORD_HASH
from core.auth import verify_password, encode_jwt

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/login")
async def login_admin(request: schemas.LoginRequest):
    """
    Admin login.
    """
    if request.email == ADMIN_EMAIL and verify_password(request.password, ADMIN_PASSWORD_HASH):
        token = encode_jwt({"email": request.email, "role": "admin"})
        return {"token": token}
    raise HTTPException(status_code=401, detail="Invalid admin credentials")


