import uuid
from typing import List

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from core.auth import get_current_admin
from database import to_object_id
from backend_services.file_storage import save_template_background, delete_template_background

import models
import schemas
from core.config import logger

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("", response_model=List[schemas.Template])
async def get_templates():
    """
    Fetch all greeting/message templates.
    """
    return await models.DBTemplate.find_all().to_list()


@router.post("", response_model=schemas.Template)
async def create_template(template: schemas.TemplateCreate, admin: dict = Depends(get_current_admin)):
    """
    Create a reusable greeting/message template.
    """
    logger.info("Create template request received name=%s category=%s", template.name, template.category)

    template_dict = template.model_dump()

    db_template = models.DBTemplate(**template_dict)
    await db_template.insert()
    return db_template


@router.put("/{template_id}", response_model=schemas.Template)
async def update_template(template_id: str, template: schemas.TemplateCreate, admin: dict = Depends(get_current_admin)):
    """
    Update an existing reusable template.
    """
    logger.info("Update template request received id=%s name=%s category=%s", template_id, template.name, template.category)

    obj_id = to_object_id(template_id)
    if not obj_id:
        logger.warning("Update template rejected: invalid id=%s", template_id)
        raise HTTPException(status_code=404, detail="Template not found")

    db_template = await models.DBTemplate.get(obj_id)
    if not db_template:
        logger.warning("Update template rejected: template not found id=%s", template_id)
        raise HTTPException(status_code=404, detail="Template not found")

    template_dict = template.model_dump()
    old_bg = db_template.backgroundImage
    new_bg = template_dict.get("backgroundImage")

    # If the background image changed, delete the old local file
    if old_bg and old_bg != new_bg:
        delete_template_background(old_bg)

    for field, value in template_dict.items():
        if field != "id":
            setattr(db_template, field, value)

    await db_template.save()
    return db_template


@router.post("/upload-background")
async def upload_background(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    """
    Upload a background image for templates.
    """
    url_path = await save_template_background(file)
    return {"backgroundImage": url_path}


@router.delete("/{template_id}")
async def delete_template(template_id: str, admin: dict = Depends(get_current_admin)):
    """
    Delete a reusable template.
    """
    logger.info("Delete template request received id=%s", template_id)

    obj_id = to_object_id(template_id)
    if not obj_id:
        logger.warning("Delete template rejected: invalid id=%s", template_id)
        raise HTTPException(status_code=404, detail="Template not found")

    db_template = await models.DBTemplate.get(obj_id)
    if not db_template:
        logger.warning("Delete template rejected: template not found id=%s", template_id)
        raise HTTPException(status_code=404, detail="Template not found")

    await db_template.delete()
    logger.info("Template deleted successfully id=%s name=%s", template_id, db_template.name)
    return {"message": "Template deleted successfully", "id": template_id}
