from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid

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

# Models
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

# Mock Database
# In a real application, this would be a real database like PostgreSQL or MongoDB
MOCK_MEMBERS_DB: List[dict] = [
    {
        "id": "1",
        "name": "Admin User",
        "email": "admin@mca.com",
        "role": "Admin",
        "dob": "1990-01-01",
        "photoUrl": "https://via.placeholder.com/150",
        "department": "MCA",
    }
]

@app.get("/api/members", response_model=List[Member])
async def get_members():
    """
    Fetch the complete list of members.
    """
    return MOCK_MEMBERS_DB

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
    Mock AI greeting generation.
    """
    return {
        "title": f"Happy {request.category}!",
        "message": f"Wishing you a wonderful {request.category}, dear {request.recipientRole}.",
        "tone": "Warm and professional"
    }

@app.post("/api/members", response_model=Member)
async def create_member(member: Member):
    """
    Add a new member.
    """
    # Simple validation (you'd typically do more robust checking)
    if not member.name or not member.email:
        raise HTTPException(status_code=400, detail="Name and email are required.")

    member_dict = member.dict()
    # Generate an ID if not provided
    if not member_dict.get("id"):
        member_dict["id"] = str(uuid.uuid4())

    MOCK_MEMBERS_DB.append(member_dict)
    return member_dict

@app.get("/")
async def root():
    return {"message": "Welcome to the MCA Dept. Auto-Greeter API"}
