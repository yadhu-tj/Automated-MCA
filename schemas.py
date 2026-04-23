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

from pydantic import ConfigDict

class Member(MemberBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
