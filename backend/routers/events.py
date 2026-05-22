import uuid
from typing import List

from fastapi import APIRouter, HTTPException, Depends
from core.auth import get_current_admin
from database import to_object_id

import models
import schemas
from core.config import logger

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("", response_model=List[schemas.Event])
async def get_events():
    """
    Fetch all department calendar events.
    """
    events = await models.DBDepartmentEvent.find_all().to_list()
    return sorted(events, key=lambda event: event.date)


@router.get("/upcoming", response_model=List[schemas.Event])
async def get_upcoming_events():
    """
    Fetch upcoming department events. For now this returns all events sorted by date.
    """
    events = await models.DBDepartmentEvent.find_all().to_list()
    return sorted(events, key=lambda event: event.date)


@router.post("", response_model=schemas.Event)
async def create_event(event: schemas.EventCreate, admin: dict = Depends(get_current_admin)):
    """
    Create a new department calendar event.
    """
    logger.info("Create event request received title=%s date=%s type=%s", event.title, event.date, event.type)

    event_dict = event.model_dump()

    db_event = models.DBDepartmentEvent(**event_dict)
    await db_event.insert()
    return db_event


@router.put("/{event_id}", response_model=schemas.Event)
async def update_event(event_id: str, event: schemas.EventCreate, admin: dict = Depends(get_current_admin)):
    """
    Update an existing department calendar event.
    """
    logger.info("Update event request received id=%s title=%s date=%s type=%s", event_id, event.title, event.date, event.type)

    obj_id = to_object_id(event_id)
    if not obj_id:
        logger.warning("Update event rejected: invalid id=%s", event_id)
        raise HTTPException(status_code=404, detail="Event not found")

    db_event = await models.DBDepartmentEvent.get(obj_id)
    if not db_event:
        logger.warning("Update event rejected: event not found id=%s", event_id)
        raise HTTPException(status_code=404, detail="Event not found")

    event_dict = event.model_dump()
    for field, value in event_dict.items():
        if field != "id":
            setattr(db_event, field, value)

    await db_event.save()
    return db_event


@router.delete("/{event_id}")
async def delete_event(event_id: str, admin: dict = Depends(get_current_admin)):
    """
    Delete a department calendar event.
    """
    logger.info("Delete event request received id=%s", event_id)

    obj_id = to_object_id(event_id)
    if not obj_id:
        logger.warning("Delete event rejected: invalid id=%s", event_id)
        raise HTTPException(status_code=404, detail="Event not found")

    db_event = await models.DBDepartmentEvent.get(obj_id)
    if not db_event:
        logger.warning("Delete event rejected: event not found id=%s", event_id)
        raise HTTPException(status_code=404, detail="Event not found")

    await db_event.delete()
    logger.info("Event deleted successfully id=%s title=%s", event_id, db_event.title)
    return {"message": "Event deleted successfully", "id": event_id}
