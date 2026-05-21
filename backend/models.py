import uuid
from typing import Optional
from beanie import Document, before_event, Delete
from pydantic import Field

class DBMember(Document):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    role: str
    dob: str
    photoUrl: str
    whatsappNumber: Optional[str] = None
    department: str
    year: Optional[str] = None

    @before_event(Delete)
    async def cleanup_associated_resources(self):
        from backend_services.file_storage import delete_certificate_attachment, delete_member_photo
        
        # Cascade delete achievements
        achievements = await DBAchievement.find(DBAchievement.memberId == self.id).to_list()
        for achievement in achievements:
            delete_certificate_attachment(achievement.certificateFilePath)
            await achievement.delete()
            
        # Delete profile photo file
        delete_member_photo(self.photoUrl)

    class Settings:
        name = "members"
        indexes = [
            "email",
        ]


class DBTemplate(Document):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    content: str
    backgroundImage: Optional[str] = None

    class Settings:
        name = "templates"
        indexes = [
            "category",
        ]

class DBDepartmentEvent(Document):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    date: str
    type: str
    description: Optional[str] = None
    location: Optional[str] = None

    class Settings:
        name = "department_events"
        indexes = [
            "date",
        ]

class DBAchievement(Document):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    memberId: str
    title: str
    description: str
    date: str
    status: str
    certificateGenerated: bool = False
    certificateFileName: Optional[str] = None
    certificateFilePath: Optional[str] = None
    certificateMimeType: Optional[str] = None

    class Settings:
        name = "achievements"
        indexes = [
            "memberId",
            "status",
        ]
