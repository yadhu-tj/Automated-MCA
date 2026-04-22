from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
import os
from sqlalchemy.orm import Session
from sqlalchemy import Column, String
from dotenv import load_dotenv

from database import engine, Base, get_db
import models

from google import genai
from google.genai import types

load_dotenv()

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MCA Dept. Auto-Greeter API")

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class Member(BaseModel):
    id: Optional[str] = None
    name: str
    email: str
    role: str
    dob: str
    photoUrl: str
    whatsappNumber: Optional[str] = None
    department: str
    year: Optional[str] = None

    class Config:
        from_attributes = True


@app.get("/api/members", response_model=List[Member])
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

@app.post("/api/members", response_model=Member)
async def create_member(member: Member, db: Session = Depends(get_db)):
    """
    Add a new member.
    """
    # Simple validation (you'd typically do more robust checking)
    if not member.name or not member.email:
        raise HTTPException(status_code=400, detail="Name and email are required.")

    # Check if email exists
    db_member = db.query(models.DBMember).filter(models.DBMember.email == member.email).first()
    if db_member:
         raise HTTPException(status_code=400, detail="Email already registered")

    member_dict = member.model_dump(exclude_unset=True)

    # Generate an ID if not provided
    if "id" not in member_dict or not member_dict["id"]:
        member_dict["id"] = str(uuid.uuid4())

    db_member = models.DBMember(**member_dict)
    db.add(db_member)
    db.commit()
    db.refresh(db_member)

    return db_member

@app.get("/")
async def root():
    return {"message": "Welcome to the MCA Dept. Auto-Greeter API"}
