from sqlalchemy import Column, String, Text
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
