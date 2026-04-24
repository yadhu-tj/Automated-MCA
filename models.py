from sqlalchemy import Boolean, Column, String, Text
from database import Base

class DBMember(Base):
    __tablename__ = "members"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, nullable=False)
    dob = Column(String, nullable=False)
    photoUrl = Column(String, nullable=False)
    whatsappNumber = Column(String, nullable=True)
    department = Column(String, nullable=False)
    year = Column(String, nullable=True)

class DBTemplate(Base):
    __tablename__ = "templates"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    backgroundImage = Column(String, nullable=True)


class DBDepartmentEvent(Base):
    __tablename__ = "department_events"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    date = Column(String, nullable=False)
    type = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String, nullable=True)


class DBAchievement(Base):
    __tablename__ = "achievements"

    id = Column(String, primary_key=True, index=True)
    memberId = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    date = Column(String, nullable=False)
    status = Column(String, nullable=False)
    certificateGenerated = Column(Boolean, nullable=False, default=False)
    certificateFileName = Column(String, nullable=True)
    certificateFilePath = Column(String, nullable=True)
    certificateMimeType = Column(String, nullable=True)
