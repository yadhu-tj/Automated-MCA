from pydantic import BaseModel, EmailStr
from typing import Optional

class MemberBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    dob: str
    photoUrl: str
    whatsappNumber: Optional[str] = None
    department: str
    year: Optional[str] = None

class MemberCreate(MemberBase):
    pass

class Member(MemberBase):
    id: str

    class Config:
        from_attributes = True
