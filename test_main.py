import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from database import get_db
import models

# Setup test database
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

models.Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_and_teardown():
    # Setup: Create tables before each test
    models.Base.metadata.create_all(bind=engine)
    yield
    # Teardown: Drop tables after each test to ensure a clean slate
    models.Base.metadata.drop_all(bind=engine)

def test_get_members_empty():
    response = client.get("/api/members")
    assert response.status_code == 200
    assert response.json() == []

def test_create_member_success():
    new_member_data = {
        "name": "Jane Doe",
        "email": "jane@doe.com",
        "role": "Faculty",
        "dob": "1980-05-15",
        "photoUrl": "https://example.com/jane.jpg",
        "department": "MCA",
        "year": None,
        "whatsappNumber": "1234567890"
    }

    response = client.post("/api/members", json=new_member_data)

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == new_member_data["name"]
    assert data["email"] == new_member_data["email"]
    assert "id" in data
    assert data["id"] is not None

def test_create_member_duplicate_email():
    new_member_data = {
        "name": "Jane Doe",
        "email": "jane@doe.com",
        "role": "Faculty",
        "dob": "1980-05-15",
        "photoUrl": "https://example.com/jane.jpg",
        "department": "MCA"
    }

    # First post should succeed
    response1 = client.post("/api/members", json=new_member_data)
    assert response1.status_code == 200

    # Second post with same email should fail
    response2 = client.post("/api/members", json=new_member_data)
    assert response2.status_code == 400
    assert response2.json()["detail"] == "Email already registered"

def test_create_member_missing_required_fields():
    # Missing 'name'
    invalid_member_data = {
        "email": "missing@name.com",
        "role": "Student",
        "dob": "2000-01-01",
        "photoUrl": "https://example.com/missing.jpg",
        "department": "MCA"
    }

    response = client.post("/api/members", json=invalid_member_data)
    assert response.status_code == 422 # Unprocessable Entity from Pydantic

def test_get_members_after_creation():
    new_member_data = {
        "name": "John Smith",
        "email": "john@smith.com",
        "role": "Student",
        "dob": "1995-10-20",
        "photoUrl": "https://example.com/john.jpg",
        "department": "MCA",
        "year": "2024"
    }

    # Create member
    client.post("/api/members", json=new_member_data)

    # Get members
    response = client.get("/api/members")
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == new_member_data["name"]
    assert data[0]["email"] == new_member_data["email"]
