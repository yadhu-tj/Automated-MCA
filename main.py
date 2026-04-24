import logging
import uuid
import os
import base64
import re
from pathlib import Path

from fastapi import FastAPI, HTTPException, Depends, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import inspect, text
from dotenv import load_dotenv

from database import engine, Base, get_db
import models
import schemas

from google import genai
from google.genai import types

load_dotenv()

logger = logging.getLogger("mca_api")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

APP_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = APP_DIR / "uploads" / "certificates"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
PHOTO_UPLOAD_DIR = APP_DIR / "uploads" / "photos"
PHOTO_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Create tables
models.Base.metadata.create_all(bind=engine)


def ensure_achievement_columns():
    inspector = inspect(engine)
    if "achievements" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("achievements")}
    columns_to_add = {
        "certificateFileName": "ALTER TABLE achievements ADD COLUMN certificateFileName VARCHAR",
        "certificateFilePath": "ALTER TABLE achievements ADD COLUMN certificateFilePath VARCHAR",
        "certificateMimeType": "ALTER TABLE achievements ADD COLUMN certificateMimeType VARCHAR",
    }

    with engine.begin() as connection:
        for column_name, ddl in columns_to_add.items():
            if column_name not in existing_columns:
                connection.execute(text(ddl))


ensure_achievement_columns()

app = FastAPI(title="MCA Dept. Auto-Greeter API")
app.mount("/uploads", StaticFiles(directory=str(APP_DIR / "uploads")), name="uploads")

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def build_default_photo_url(name: str) -> str:
    safe_name = name.strip() or "User"
    return f"https://ui-avatars.com/api/?background=random&name={safe_name.replace(' ', '+')}"


def get_media_path(url_path: Optional[str]) -> Optional[str]:
    if not url_path:
        return None
    resolved = (APP_DIR / url_path.lstrip("/")).resolve()
    try:
        resolved.relative_to(APP_DIR)
        return str(resolved)
    except ValueError:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Invalid media path")


def infer_certificate_extension(mime_type: str) -> str:
    if mime_type == "application/pdf":
        return ".pdf"
    if mime_type == "image/png":
        return ".png"
    if mime_type == "image/jpeg":
        return ".jpg"
    if mime_type == "image/webp":
        return ".webp"
    if mime_type == "image/gif":
        return ".gif"
    raise HTTPException(status_code=400, detail="Only image and PDF certificates are supported")


def save_certificate_attachment(achievement_id: str, file_name: str, mime_type: str, data_url: str) -> tuple[str, str, str]:
    if mime_type not in {"application/pdf", "image/png", "image/jpeg", "image/webp", "image/gif"}:
        raise HTTPException(status_code=400, detail="Only image and PDF certificates are supported")

    match = re.match(r"data:([^;]+);base64,(.+)", data_url)
    if not match:
        raise HTTPException(status_code=400, detail="Invalid certificate file data")

    data_mime_type = match.group(1)
    encoded = match.group(2)
    if data_mime_type != mime_type:
        raise HTTPException(status_code=400, detail="Certificate file MIME type mismatch")

    extension = infer_certificate_extension(mime_type)
    display_name = Path(file_name).name or "certificate"
    safe_base_name = Path(file_name).stem or "certificate"
    stored_name = f"{achievement_id}_{safe_base_name}{extension}"
    file_path = UPLOAD_DIR / stored_name
    binary_data = base64.b64decode(encoded)
    file_path.write_bytes(binary_data)
    return display_name, f"/uploads/certificates/{stored_name}", mime_type


def delete_certificate_attachment(certificate_file_path: Optional[str]) -> None:
    if not certificate_file_path:
        return
    file_path = APP_DIR / certificate_file_path.lstrip("/")
    if file_path.exists():
        file_path.unlink()


@app.exception_handler(RequestValidationError)
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


ALLOWED_PHOTO_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@app.post("/api/members/upload-photo")
async def upload_member_photo(file: UploadFile = File(...)):
    """
    Upload a member photo. Returns the URL path for the uploaded image.
    """
    if file.content_type not in ALLOWED_PHOTO_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP and GIF images are allowed")

    ext_map = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif"}
    extension = ext_map.get(file.content_type, ".jpg")
    file_name = f"{uuid.uuid4()}{extension}"
    file_path = PHOTO_UPLOAD_DIR / file_name

    contents = await file.read()
    file_path.write_bytes(contents)

    url_path = f"/uploads/photos/{file_name}"
    logger.info("Photo uploaded: %s (%s, %d bytes)", url_path, file.content_type, len(contents))
    return {"photoUrl": url_path}


@app.get("/api/members", response_model=List[schemas.Member])
async def get_members(db: Session = Depends(get_db)):
    """
    Fetch the complete list of members.
    """
    members = db.query(models.DBMember).all()
    return members

class LoginRequest(BaseModel):
    email: str
    password: str

class GenerateGreetingRequest(BaseModel):
    category: str
    recipientRole: str
    context: str

@app.post("/api/admin/login")
async def login_admin(request: LoginRequest):
    """
    Mock admin login.
    """
    if request.email == "admin@mca.com" and request.password == "1234":
        return {"token": "mock-admin-token"}
    raise HTTPException(status_code=401, detail="Invalid admin credentials")

@app.post("/api/ai/generate-greeting")
async def generate_greeting(request: GenerateGreetingRequest):
    """
    Generate an AI greeting using Google Gemini API.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY environment variable not set. Falling back to mock generator.")
        return {
            "title": f"Happy {request.category}!",
            "message": f"Wishing you a wonderful {request.category}, dear {request.recipientRole}.",
            "tone": "Warm and professional"
        }

    try:
        client = genai.Client(api_key=api_key)
        prompt = f"""
        You are an assistant for a University MCA Department.
        Generate a {request.category} greeting message for a {request.recipientRole}.
        Context/Details: {request.context}.

        The tone should be professional yet warm.
        Return the response in strict JSON format with keys: "suggestedTitle", "suggestedMessage", "tone".
        Do not include markdown code blocks.
        """
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        import json
        data = json.loads(response.text)
        return {
            "title": data.get("suggestedTitle", ""),
            "message": data.get("suggestedMessage", ""),
            "tone": data.get("tone", "")
        }
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate AI content")

@app.post("/api/members", response_model=schemas.Member)
async def create_member(member: schemas.MemberCreate, db: Session = Depends(get_db)):
    """
    Add a new member.
    """
    logger.info(
        "Create member request received for email=%s role=%s department=%s photoUrl_present=%s",
        member.email,
        member.role,
        member.department,
        bool(member.photoUrl),
    )

    # Check if email exists
    db_member = db.query(models.DBMember).filter(models.DBMember.email == member.email).first()
    if db_member:
         logger.warning("Create member rejected: duplicate email=%s", member.email)
         raise HTTPException(status_code=400, detail="Email already registered")

    member_dict = member.model_dump()
    if not member_dict.get("photoUrl"):
        member_dict["photoUrl"] = build_default_photo_url(member_dict["name"])
        logger.info(
            "No photoUrl supplied for email=%s. Using generated avatar URL=%s",
            member.email,
            member_dict["photoUrl"],
        )

    # Generate an ID
    member_dict["id"] = str(uuid.uuid4())

    logger.debug("Persisting member payload: %s", member_dict)
    db_member = models.DBMember(**member_dict)
    db.add(db_member)
    db.commit()
    db.refresh(db_member)

    return db_member


@app.put("/api/members/{member_id}", response_model=schemas.Member)
async def update_member(member_id: str, member: schemas.MemberCreate, db: Session = Depends(get_db)):
    """
    Update an existing member.
    """
    logger.info(
        "Update member request received for id=%s email=%s role=%s department=%s photoUrl_present=%s",
        member_id,
        member.email,
        member.role,
        member.department,
        bool(member.photoUrl),
    )

    db_member = db.query(models.DBMember).filter(models.DBMember.id == member_id).first()
    if not db_member:
        logger.warning("Update member rejected: member not found id=%s", member_id)
        raise HTTPException(status_code=404, detail="Member not found")

    duplicate_email = (
        db.query(models.DBMember)
        .filter(models.DBMember.email == member.email, models.DBMember.id != member_id)
        .first()
    )
    if duplicate_email:
        logger.warning(
            "Update member rejected: duplicate email=%s for id=%s",
            member.email,
            member_id,
        )
        raise HTTPException(status_code=400, detail="Email already registered")

    member_dict = member.model_dump()
    if not member_dict.get("photoUrl"):
        member_dict["photoUrl"] = build_default_photo_url(member_dict["name"])
        logger.info(
            "No photoUrl supplied during update for id=%s. Using generated avatar URL=%s",
            member_id,
            member_dict["photoUrl"],
        )

    logger.debug("Applying member update id=%s payload=%s", member_id, member_dict)
    for field, value in member_dict.items():
        setattr(db_member, field, value)

    db.commit()
    db.refresh(db_member)

    return db_member


@app.delete("/api/members/{member_id}")
async def delete_member(member_id: str, db: Session = Depends(get_db)):
    """
    Delete a member by id.
    """
    logger.info("Delete member request received for id=%s", member_id)

    db_member = db.query(models.DBMember).filter(models.DBMember.id == member_id).first()
    if not db_member:
        logger.warning("Delete member rejected: member not found id=%s", member_id)
        raise HTTPException(status_code=404, detail="Member not found")

    db.delete(db_member)
    db.commit()

    logger.info("Member deleted successfully id=%s email=%s", member_id, db_member.email)
    return {"message": "Member deleted successfully", "id": member_id}


@app.get("/api/events", response_model=List[schemas.Event])
async def get_events(db: Session = Depends(get_db)):
    """
    Fetch all department calendar events.
    """
    events = db.query(models.DBDepartmentEvent).all()
    return sorted(events, key=lambda event: event.date)


@app.get("/api/events/upcoming", response_model=List[schemas.Event])
async def get_upcoming_events(db: Session = Depends(get_db)):
    """
    Fetch upcoming department events. For now this returns all events sorted by date.
    """
    events = db.query(models.DBDepartmentEvent).all()
    return sorted(events, key=lambda event: event.date)


@app.post("/api/events", response_model=schemas.Event)
async def create_event(event: schemas.EventCreate, db: Session = Depends(get_db)):
    """
    Create a new department calendar event.
    """
    logger.info("Create event request received title=%s date=%s type=%s", event.title, event.date, event.type)

    event_dict = event.model_dump()
    event_dict["id"] = str(uuid.uuid4())

    db_event = models.DBDepartmentEvent(**event_dict)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


@app.put("/api/events/{event_id}", response_model=schemas.Event)
async def update_event(event_id: str, event: schemas.EventCreate, db: Session = Depends(get_db)):
    """
    Update an existing department calendar event.
    """
    logger.info("Update event request received id=%s title=%s date=%s type=%s", event_id, event.title, event.date, event.type)

    db_event = db.query(models.DBDepartmentEvent).filter(models.DBDepartmentEvent.id == event_id).first()
    if not db_event:
        logger.warning("Update event rejected: event not found id=%s", event_id)
        raise HTTPException(status_code=404, detail="Event not found")

    event_dict = event.model_dump()
    for field, value in event_dict.items():
        setattr(db_event, field, value)

    db.commit()
    db.refresh(db_event)
    return db_event


@app.delete("/api/events/{event_id}")
async def delete_event(event_id: str, db: Session = Depends(get_db)):
    """
    Delete a department calendar event.
    """
    logger.info("Delete event request received id=%s", event_id)

    db_event = db.query(models.DBDepartmentEvent).filter(models.DBDepartmentEvent.id == event_id).first()
    if not db_event:
        logger.warning("Delete event rejected: event not found id=%s", event_id)
        raise HTTPException(status_code=404, detail="Event not found")

    db.delete(db_event)
    db.commit()
    logger.info("Event deleted successfully id=%s title=%s", event_id, db_event.title)
    return {"message": "Event deleted successfully", "id": event_id}


@app.get("/api/achievements", response_model=List[schemas.Achievement])
async def get_achievements(db: Session = Depends(get_db)):
    """
    Fetch all achievements for the wall.
    """
    achievements = db.query(models.DBAchievement).all()
    return sorted(achievements, key=lambda achievement: achievement.date, reverse=True)


@app.get("/api/achievements/{achievement_id}", response_model=schemas.Achievement)
async def get_achievement(achievement_id: str, db: Session = Depends(get_db)):
    achievement = db.query(models.DBAchievement).filter(models.DBAchievement.id == achievement_id).first()
    if not achievement:
        raise HTTPException(status_code=404, detail="Achievement not found")
    return achievement


@app.post("/api/achievements", response_model=schemas.Achievement)
async def create_achievement(achievement: schemas.AchievementCreate, db: Session = Depends(get_db)):
    """
    Create a new achievement entry.
    """
    logger.info(
        "Create achievement request received memberId=%s title=%s status=%s certificateGenerated=%s",
        achievement.memberId,
        achievement.title,
        achievement.status,
        achievement.certificateGenerated,
    )

    member = db.query(models.DBMember).filter(models.DBMember.id == achievement.memberId).first()
    if not member:
        logger.warning("Create achievement rejected: member not found memberId=%s", achievement.memberId)
        raise HTTPException(status_code=404, detail="Member not found")

    achievement_dict = achievement.model_dump()
    achievement_dict["id"] = str(uuid.uuid4())
    certificate_file_data = achievement_dict.pop("certificateFileData", None)

    if certificate_file_data and not achievement_dict.get("certificateGenerated"):
        achievement_dict["certificateGenerated"] = True

    if not achievement_dict.get("certificateGenerated"):
        achievement_dict["certificateFileName"] = None
        achievement_dict["certificateFilePath"] = None
        achievement_dict["certificateMimeType"] = None
    elif certificate_file_data:
        if not achievement_dict.get("certificateFileName") or not achievement_dict.get("certificateMimeType"):
            raise HTTPException(status_code=400, detail="Certificate file name and MIME type are required")
        stored_name, stored_path, stored_mime = save_certificate_attachment(
            achievement_dict["id"],
            achievement_dict["certificateFileName"],
            achievement_dict["certificateMimeType"],
            certificate_file_data,
        )
        achievement_dict["certificateFileName"] = stored_name
        achievement_dict["certificateFilePath"] = stored_path
        achievement_dict["certificateMimeType"] = stored_mime

    db_achievement = models.DBAchievement(**achievement_dict)
    db.add(db_achievement)
    db.commit()
    db.refresh(db_achievement)
    return db_achievement


@app.put("/api/achievements/{achievement_id}", response_model=schemas.Achievement)
async def update_achievement(achievement_id: str, achievement: schemas.AchievementCreate, db: Session = Depends(get_db)):
    """
    Update an achievement entry.
    """
    logger.info(
        "Update achievement request received id=%s memberId=%s title=%s status=%s",
        achievement_id,
        achievement.memberId,
        achievement.title,
        achievement.status,
    )

    db_achievement = db.query(models.DBAchievement).filter(models.DBAchievement.id == achievement_id).first()
    if not db_achievement:
        logger.warning("Update achievement rejected: achievement not found id=%s", achievement_id)
        raise HTTPException(status_code=404, detail="Achievement not found")

    member = db.query(models.DBMember).filter(models.DBMember.id == achievement.memberId).first()
    if not member:
        logger.warning("Update achievement rejected: member not found memberId=%s", achievement.memberId)
        raise HTTPException(status_code=404, detail="Member not found")

    achievement_dict = achievement.model_dump()
    certificate_file_data = achievement_dict.pop("certificateFileData", None)
    existing_file_path = db_achievement.certificateFilePath

    if certificate_file_data and not achievement_dict.get("certificateGenerated"):
        achievement_dict["certificateGenerated"] = True

    if not achievement_dict.get("certificateGenerated"):
        delete_certificate_attachment(existing_file_path)
        achievement_dict["certificateFileName"] = None
        achievement_dict["certificateFilePath"] = None
        achievement_dict["certificateMimeType"] = None
    elif certificate_file_data:
        if not achievement_dict.get("certificateFileName") or not achievement_dict.get("certificateMimeType"):
            raise HTTPException(status_code=400, detail="Certificate file name and MIME type are required")
        delete_certificate_attachment(existing_file_path)
        stored_name, stored_path, stored_mime = save_certificate_attachment(
            achievement_id,
            achievement_dict["certificateFileName"],
            achievement_dict["certificateMimeType"],
            certificate_file_data,
        )
        achievement_dict["certificateFileName"] = stored_name
        achievement_dict["certificateFilePath"] = stored_path
        achievement_dict["certificateMimeType"] = stored_mime
    elif not achievement_dict.get("certificateFilePath"):
        achievement_dict["certificateFilePath"] = existing_file_path
        achievement_dict["certificateFileName"] = db_achievement.certificateFileName
        achievement_dict["certificateMimeType"] = db_achievement.certificateMimeType

    for field, value in achievement_dict.items():
        setattr(db_achievement, field, value)

    db.commit()
    db.refresh(db_achievement)
    return db_achievement


@app.delete("/api/achievements/{achievement_id}")
async def delete_achievement(achievement_id: str, db: Session = Depends(get_db)):
    """
    Delete an achievement entry.
    """
    logger.info("Delete achievement request received id=%s", achievement_id)

    db_achievement = db.query(models.DBAchievement).filter(models.DBAchievement.id == achievement_id).first()
    if not db_achievement:
        logger.warning("Delete achievement rejected: achievement not found id=%s", achievement_id)
        raise HTTPException(status_code=404, detail="Achievement not found")

    delete_certificate_attachment(db_achievement.certificateFilePath)
    db.delete(db_achievement)
    db.commit()
    logger.info("Achievement deleted successfully id=%s title=%s", achievement_id, db_achievement.title)
    return {"message": "Achievement deleted successfully", "id": achievement_id}

@app.get("/")
async def root():
    return {"message": "Welcome to the MCA Dept. Auto-Greeter API"}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", reload=True)
