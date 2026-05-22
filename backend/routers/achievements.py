from beanie import PydanticObjectId
from typing import List

from fastapi import APIRouter, HTTPException, Depends
from core.auth import get_current_admin
from database import to_object_id

import models
import schemas
from backend_services.file_storage import delete_certificate_attachment, save_certificate_attachment
from core.config import logger

router = APIRouter(prefix="/api/achievements", tags=["achievements"])


@router.get("", response_model=List[schemas.Achievement])
async def get_achievements():
    """
    Fetch all achievements for the wall.
    """
    achievements = await models.DBAchievement.find_all().to_list()
    return sorted(achievements, key=lambda achievement: achievement.date, reverse=True)


@router.get("/{achievement_id}", response_model=schemas.Achievement)
async def get_achievement(achievement_id: str):
    obj_id = to_object_id(achievement_id)
    if not obj_id:
        raise HTTPException(status_code=404, detail="Achievement not found")
    achievement = await models.DBAchievement.get(obj_id)
    if not achievement:
        raise HTTPException(status_code=404, detail="Achievement not found")
    return achievement


@router.post("", response_model=schemas.Achievement)
async def create_achievement(achievement: schemas.AchievementCreate, admin: dict = Depends(get_current_admin)):
    """
    Create a new achievement entry.
    """
    logger.info(
        "Create achievement request received memberId=%s title=%s status=%s certificateGenerated=%s",
        achievement.memberId,
        achievement.title,
        achievement.status,
        achievement.certificateGenerated,
    )

    member_obj_id = to_object_id(achievement.memberId)
    if not member_obj_id:
        logger.warning("Create achievement rejected: invalid memberId=%s", achievement.memberId)
        raise HTTPException(status_code=404, detail="Member not found")
    member = await models.DBMember.get(member_obj_id)
    if not member:
        logger.warning("Create achievement rejected: member not found memberId=%s", achievement.memberId)
        raise HTTPException(status_code=404, detail="Member not found")

    achievement_id = PydanticObjectId()
    achievement_dict = achievement.model_dump()
    achievement_dict["id"] = achievement_id
    certificate_file_data = achievement_dict.pop("certificateFileData", None)

    if certificate_file_data and not achievement_dict.get("certificateGenerated"):
        achievement_dict["certificateGenerated"] = True

    if not achievement_dict.get("certificateGenerated"):
        achievement_dict["certificateFileName"] = None
        achievement_dict["certificateFilePath"] = None
        achievement_dict["certificateMimeType"] = None
    elif certificate_file_data:
        if not achievement_dict.get("certificateFileName") or not achievement_dict.get("certificateMimeType"):
            raise HTTPException(status_code=400, detail="Certificate file name and MIME type are required")
        stored_name, stored_path, stored_mime = save_certificate_attachment(
            str(achievement_id),
            achievement_dict["certificateFileName"],
            achievement_dict["certificateMimeType"],
            certificate_file_data,
        )
        achievement_dict["certificateFileName"] = stored_name
        achievement_dict["certificateFilePath"] = stored_path
        achievement_dict["certificateMimeType"] = stored_mime

    db_achievement = models.DBAchievement(**achievement_dict)
    await db_achievement.insert()
    return db_achievement


@router.put("/{achievement_id}", response_model=schemas.Achievement)
async def update_achievement(achievement_id: str, achievement: schemas.AchievementCreate, admin: dict = Depends(get_current_admin)):
    """
    Update an achievement entry.
    """
    logger.info(
        "Update achievement request received id=%s memberId=%s title=%s status=%s",
        achievement_id,
        achievement.memberId,
        achievement.title,
        achievement.status,
    )

    obj_id = to_object_id(achievement_id)
    if not obj_id:
        logger.warning("Update achievement rejected: invalid id=%s", achievement_id)
        raise HTTPException(status_code=404, detail="Achievement not found")
    db_achievement = await models.DBAchievement.get(obj_id)
    if not db_achievement:
        logger.warning("Update achievement rejected: achievement not found id=%s", achievement_id)
        raise HTTPException(status_code=404, detail="Achievement not found")

    member_obj_id = to_object_id(achievement.memberId)
    if not member_obj_id:
        logger.warning("Update achievement rejected: invalid memberId=%s", achievement.memberId)
        raise HTTPException(status_code=404, detail="Member not found")
    member = await models.DBMember.get(member_obj_id)
    if not member:
        logger.warning("Update achievement rejected: member not found memberId=%s", achievement.memberId)
        raise HTTPException(status_code=404, detail="Member not found")

    achievement_dict = achievement.model_dump()
    certificate_file_data = achievement_dict.pop("certificateFileData", None)
    existing_file_path = db_achievement.certificateFilePath

    if certificate_file_data and not achievement_dict.get("certificateGenerated"):
        achievement_dict["certificateGenerated"] = True

    if not achievement_dict.get("certificateGenerated"):
        delete_certificate_attachment(existing_file_path)
        achievement_dict["certificateFileName"] = None
        achievement_dict["certificateFilePath"] = None
        achievement_dict["certificateMimeType"] = None
    elif certificate_file_data:
        if not achievement_dict.get("certificateFileName") or not achievement_dict.get("certificateMimeType"):
            raise HTTPException(status_code=400, detail="Certificate file name and MIME type are required")
        delete_certificate_attachment(existing_file_path)
        stored_name, stored_path, stored_mime = save_certificate_attachment(
            achievement_id,
            achievement_dict["certificateFileName"],
            achievement_dict["certificateMimeType"],
            certificate_file_data,
        )
        achievement_dict["certificateFileName"] = stored_name
        achievement_dict["certificateFilePath"] = stored_path
        achievement_dict["certificateMimeType"] = stored_mime
    elif not achievement_dict.get("certificateFilePath"):
        achievement_dict["certificateFilePath"] = existing_file_path
        achievement_dict["certificateFileName"] = db_achievement.certificateFileName
        achievement_dict["certificateMimeType"] = db_achievement.certificateMimeType

    for field, value in achievement_dict.items():
        if field != "id":
            setattr(db_achievement, field, value)

    await db_achievement.save()
    return db_achievement


@router.delete("/{achievement_id}")
async def delete_achievement(achievement_id: str, admin: dict = Depends(get_current_admin)):
    """
    Delete an achievement entry.
    """
    logger.info("Delete achievement request received id=%s", achievement_id)

    obj_id = to_object_id(achievement_id)
    if not obj_id:
        logger.warning("Delete achievement rejected: invalid id=%s", achievement_id)
        raise HTTPException(status_code=404, detail="Achievement not found")
    db_achievement = await models.DBAchievement.get(obj_id)
    if not db_achievement:
        logger.warning("Delete achievement rejected: achievement not found id=%s", achievement_id)
        raise HTTPException(status_code=404, detail="Achievement not found")

    delete_certificate_attachment(db_achievement.certificateFilePath)
    await db_achievement.delete()
    logger.info("Achievement deleted successfully id=%s title=%s", achievement_id, db_achievement.title)
    return {"message": "Achievement deleted successfully", "id": achievement_id}
