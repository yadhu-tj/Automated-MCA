from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional


class MemberBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    dob: str
    department: str
    year: Optional[str] = None
    whatsappNumber: Optional[str] = None
    photoUrl: Optional[str] = None


class MemberCreate(MemberBase):
    pass


class Member(MemberBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    photoUrl: str


class EventBase(BaseModel):
    title: str
    date: str
    type: str
    description: Optional[str] = None
    location: Optional[str] = None


class EventCreate(EventBase):
    pass


class Event(EventBase):
    model_config = ConfigDict(from_attributes=True)

    id: str


class AchievementBase(BaseModel):
    memberId: str
    title: str
    description: str
    date: str
    status: str
    certificateGenerated: bool = False
    certificateFileName: Optional[str] = None
    certificateFilePath: Optional[str] = None
    certificateMimeType: Optional[str] = None
    certificateFileData: Optional[str] = None


class AchievementCreate(AchievementBase):
    pass


class Achievement(AchievementBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
