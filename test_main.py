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

def test_create_member_without_photo_url_uses_default_avatar():
    new_member_data = {
        "name": "Avatar Less",
        "email": "avatarless@doe.com",
        "role": "Student",
        "dob": "2000-01-01",
        "department": "MCA"
    }

    response = client.post("/api/members", json=new_member_data)

    assert response.status_code == 200
    data = response.json()
    assert data["photoUrl"].startswith("https://ui-avatars.com/api/")

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


def test_update_member_success():
    created_member = {
        "name": "Edit Me",
        "email": "editme@doe.com",
        "role": "Student",
        "dob": "2001-02-03",
        "photoUrl": "https://example.com/original.jpg",
        "department": "MCA",
        "year": "2024"
    }

    create_response = client.post("/api/members", json=created_member)
    assert create_response.status_code == 200
    member_id = create_response.json()["id"]

    updated_member = {
        "name": "Edited Name",
        "email": "edited@doe.com",
        "role": "Faculty",
        "dob": "2001-02-03",
        "photoUrl": "",
        "department": "MCA",
        "year": "2025"
    }

    response = client.put(f"/api/members/{member_id}", json=updated_member)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == member_id
    assert data["name"] == "Edited Name"
    assert data["email"] == "edited@doe.com"
    assert data["role"] == "Faculty"
    assert data["year"] == "2025"
    assert data["photoUrl"].startswith("https://ui-avatars.com/api/")


def test_update_member_not_found():
    updated_member = {
        "name": "Ghost Member",
        "email": "ghost@doe.com",
        "role": "Student",
        "dob": "2001-02-03",
        "photoUrl": "https://example.com/ghost.jpg",
        "department": "MCA"
    }

    response = client.put("/api/members/not-a-real-id", json=updated_member)

    assert response.status_code == 404
    assert response.json()["detail"] == "Member not found"


def test_delete_member_success():
    member_data = {
        "name": "Delete Me",
        "email": "deleteme@doe.com",
        "role": "Student",
        "dob": "2002-03-04",
        "photoUrl": "https://example.com/delete.jpg",
        "department": "MCA"
    }

    create_response = client.post("/api/members", json=member_data)
    assert create_response.status_code == 200
    member_id = create_response.json()["id"]

    response = client.delete(f"/api/members/{member_id}")

    assert response.status_code == 200
    assert response.json()["message"] == "Member deleted successfully"
    assert response.json()["id"] == member_id

    get_response = client.get("/api/members")
    assert get_response.status_code == 200
    remaining_ids = [member["id"] for member in get_response.json()]
    assert member_id not in remaining_ids


def test_delete_member_not_found():
    response = client.delete("/api/members/not-a-real-id")

    assert response.status_code == 404
    assert response.json()["detail"] == "Member not found"


def test_calendar_event_crud():
    event_data = {
        "title": "Department Seminar",
        "date": "2026-05-01",
        "type": "Academic",
        "description": "A seminar for MCA students.",
        "location": "Seminar Hall"
    }

    create_response = client.post("/api/events", json=event_data)
    assert create_response.status_code == 200
    event_id = create_response.json()["id"]

    update_data = {
        "title": "Department Seminar Updated",
        "date": "2026-05-02",
        "type": "Academic",
        "description": "Updated seminar schedule.",
        "location": "Main Auditorium"
    }
    update_response = client.put(f"/api/events/{event_id}", json=update_data)
    assert update_response.status_code == 200
    assert update_response.json()["title"] == "Department Seminar Updated"

    delete_response = client.delete(f"/api/events/{event_id}")
    assert delete_response.status_code == 200
    assert delete_response.json()["message"] == "Event deleted successfully"


def test_achievement_crud():
    member_data = {
        "name": "Achiever",
        "email": "achiever@doe.com",
        "role": "Student",
        "dob": "2001-02-03",
        "photoUrl": "https://example.com/achiever.jpg",
        "department": "MCA"
    }
    member_response = client.post("/api/members", json=member_data)
    assert member_response.status_code == 200
    member_id = member_response.json()["id"]

    achievement_data = {
        "memberId": member_id,
        "title": "Won Hackathon",
        "description": "Secured first place in the inter-college hackathon.",
        "date": "2026-05-10",
        "status": "Approved",
        "certificateGenerated": True
    }

    create_response = client.post("/api/achievements", json=achievement_data)
    assert create_response.status_code == 200
    achievement_id = create_response.json()["id"]

    update_data = {
        "memberId": member_id,
        "title": "Won Hackathon Final",
        "description": "Updated achievement description.",
        "date": "2026-05-11",
        "status": "Pending",
        "certificateGenerated": False
    }

    update_response = client.put(f"/api/achievements/{achievement_id}", json=update_data)
    assert update_response.status_code == 200
    assert update_response.json()["title"] == "Won Hackathon Final"

    list_response = client.get("/api/achievements")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

    delete_response = client.delete(f"/api/achievements/{achievement_id}")
    assert delete_response.status_code == 200
    assert delete_response.json()["message"] == "Achievement deleted successfully"


def test_achievement_certificate_upload_and_clear():
    member_data = {
        "name": "Certificate Holder",
        "email": "certificateholder@doe.com",
        "role": "Student",
        "dob": "2001-02-03",
        "photoUrl": "https://example.com/cert.jpg",
        "department": "MCA"
    }
    member_response = client.post("/api/members", json=member_data)
    assert member_response.status_code == 200
    member_id = member_response.json()["id"]

    certificate_data_url = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X2ioAAAAASUVORK5CYII="
    achievement_data = {
        "memberId": member_id,
        "title": "Uploaded Certificate",
        "description": "Certificate attached from disk.",
        "date": "2026-05-12",
        "status": "Approved",
        "certificateGenerated": True,
        "certificateFileName": "certificate.png",
        "certificateMimeType": "image/png",
        "certificateFileData": certificate_data_url,
    }

    create_response = client.post("/api/achievements", json=achievement_data)
    assert create_response.status_code == 200
    created = create_response.json()
    achievement_id = created["id"]
    assert created["certificateGenerated"] is True
    assert created["certificateFilePath"].startswith("/uploads/certificates/")

    fetch_response = client.get(f"/api/achievements/{achievement_id}")
    assert fetch_response.status_code == 200
    assert fetch_response.json()["certificateFileName"] == "certificate.png"

    update_response = client.put(
        f"/api/achievements/{achievement_id}",
        json={
            "memberId": member_id,
            "title": "Uploaded Certificate",
            "description": "Certificate cleared.",
            "date": "2026-05-12",
            "status": "Approved",
            "certificateGenerated": False
        }
    )
    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated["certificateGenerated"] is False
    assert updated["certificateFilePath"] is None
    assert updated["certificateFileName"] is None
