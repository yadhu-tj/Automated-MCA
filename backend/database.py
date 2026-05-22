import os
from typing import Optional
from beanie import PydanticObjectId
from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.environ.get("MONGODB_DB_NAME", "mca_greetings")

# Create a single client instance
client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
db = client[MONGODB_DB_NAME]

# Dependency for FastAPI routes
def get_db():
    yield db

def to_object_id(id_str: str) -> Optional[PydanticObjectId]:
    try:
        return PydanticObjectId(id_str)
    except Exception:
        return None

