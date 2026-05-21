import uuid
from typing import List
from fastapi import APIRouter, File, HTTPException, UploadFile, Depends
from core.auth import get_current_admin

import models
import schemas
from backend_services.file_storage import save_member_photo
from backend_services.members import build_default_photo_url
from core.config import logger

router = APIRouter(prefix="/api/members", tags=["members"])


@router.post("/upload-photo")
async def upload_member_photo(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    """
    Upload a member photo. Returns the URL path for the uploaded image.
    """
    return {"photoUrl": await save_member_photo(file)}


@router.get("", response_model=List[schemas.Member])
async def get_members():
    """
    Fetch the complete list of members.
    """
    members = await models.DBMember.find_all().to_list()
    return members


@router.post("", response_model=schemas.Member)
async def create_member(member: schemas.MemberCreate, admin: dict = Depends(get_current_admin)):
    """
    Add a new member.
    """
    logger.info(
        "Create member request received for email=%s role=%s department=%s photoUrl_present=%s",
        member.email,
        member.role,
        member.department,
        bool(member.photoUrl),
    )

    db_member = await models.DBMember.find_one(models.DBMember.email == member.email)
    if db_member:
        logger.warning("Create member rejected: duplicate email=%s", member.email)
        raise HTTPException(status_code=400, detail="Email already registered")

    member_dict = member.model_dump()
    if not member_dict.get("photoUrl"):
        member_dict["photoUrl"] = build_default_photo_url(member_dict["name"])
        logger.info(
            "No photoUrl supplied for email=%s. Using generated avatar URL=%s",
            member.email,
            member_dict["photoUrl"],
        )

    if "id" not in member_dict or not member_dict["id"]:
        member_dict["id"] = str(uuid.uuid4())

    logger.debug("Persisting member payload: %s", member_dict)
    db_member = models.DBMember(**member_dict)
    await db_member.insert()

    return db_member


@router.put("/{member_id}", response_model=schemas.Member)
async def update_member(member_id: str, member: schemas.MemberCreate, admin: dict = Depends(get_current_admin)):
    """
    Update an existing member.
    """
    logger.info(
        "Update member request received for id=%s email=%s role=%s department=%s photoUrl_present=%s",
        member_id,
        member.email,
        member.role,
        member.department,
        bool(member.photoUrl),
    )

    db_member = await models.DBMember.find_one(models.DBMember.id == member_id)
    if not db_member:
        logger.warning("Update member rejected: member not found id=%s", member_id)
        raise HTTPException(status_code=404, detail="Member not found")

    duplicate_email = await models.DBMember.find_one(
        models.DBMember.email == member.email,
        models.DBMember.id != member_id
    )
    if duplicate_email:
        logger.warning(
            "Update member rejected: duplicate email=%s for id=%s",
            member.email,
            member_id,
        )
        raise HTTPException(status_code=400, detail="Email already registered")

    member_dict = member.model_dump()
    if not member_dict.get("photoUrl"):
        member_dict["photoUrl"] = build_default_photo_url(member_dict["name"])
        logger.info(
            "No photoUrl supplied during update for id=%s. Using generated avatar URL=%s",
            member_id,
            member_dict["photoUrl"],
        )

    logger.debug("Applying member update id=%s payload=%s", member_id, member_dict)
    for field, value in member_dict.items():
        if field != "id":
            setattr(db_member, field, value)

    await db_member.save()

    return db_member


@router.delete("/{member_id}")
async def delete_member(member_id: str, admin: dict = Depends(get_current_admin)):
    """
    Delete a member by id.
    """
    logger.info("Delete member request received for id=%s", member_id)

    db_member = await models.DBMember.find_one(models.DBMember.id == member_id)
    if not db_member:
        logger.warning("Delete member rejected: member not found id=%s", member_id)
        raise HTTPException(status_code=404, detail="Member not found")

    await db_member.delete()

    logger.info("Member deleted successfully id=%s email=%s", member_id, db_member.email)
    return {"message": "Member deleted successfully", "id": member_id}


@router.post("/bulk", response_model=List[schemas.Member])
async def create_members_bulk(members: List[schemas.MemberCreate], admin: dict = Depends(get_current_admin)):
    """
    Bulk import new members.
    """
    logger.info("Bulk create member request received for %d members", len(members))
    created_members = []
    for member in members:
        # Check duplicate email
        existing = await models.DBMember.find_one(models.DBMember.email == member.email)
        if existing:
            logger.warning("Bulk import skipped duplicate email=%s", member.email)
            continue

        member_dict = member.model_dump()
        if not member_dict.get("photoUrl"):
            member_dict["photoUrl"] = build_default_photo_url(member_dict["name"])
        if "id" not in member_dict or not member_dict["id"]:
            member_dict["id"] = str(uuid.uuid4())

        db_member = models.DBMember(**member_dict)
        await db_member.insert()
        created_members.append(db_member)

    logger.info("Bulk import completed. Created %d members", len(created_members))
    return created_members

