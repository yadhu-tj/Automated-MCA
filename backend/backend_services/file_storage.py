import base64
import re
import uuid
from pathlib import Path
from typing import Optional

from fastapi import HTTPException, UploadFile

from core.config import APP_DIR, CERTIFICATE_UPLOAD_DIR, PHOTO_UPLOAD_DIR, TEMPLATE_UPLOAD_DIR, logger

ALLOWED_PHOTO_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_CERTIFICATE_TYPES = {"application/pdf", "image/png", "image/jpeg", "image/webp", "image/gif"}
ALLOWED_TEMPLATE_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


def get_media_path(url_path: Optional[str]) -> Optional[str]:
    if not url_path:
        return None
    resolved = (APP_DIR / url_path.lstrip("/")).resolve()
    try:
        resolved.relative_to(APP_DIR)
        return str(resolved)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid media path")


def infer_certificate_extension(mime_type: str) -> str:
    if mime_type == "application/pdf":
        return ".pdf"
    if mime_type == "image/png":
        return ".png"
    if mime_type == "image/jpeg":
        return ".jpg"
    if mime_type == "image/webp":
        return ".webp"
    if mime_type == "image/gif":
        return ".gif"
    raise HTTPException(status_code=400, detail="Only image and PDF certificates are supported")


def save_certificate_attachment(achievement_id: str, file_name: str, mime_type: str, data_url: str) -> tuple[str, str, str]:
    if mime_type not in ALLOWED_CERTIFICATE_TYPES:
        raise HTTPException(status_code=400, detail="Only image and PDF certificates are supported")

    # Enforce base64 string length limit (roughly 14.5M characters for 10MB binary limit)
    MAX_BASE64_CHAR_LIMIT = 15 * 1024 * 1024
    if len(data_url) > MAX_BASE64_CHAR_LIMIT:
        raise HTTPException(status_code=400, detail="Certificate file size exceeds the 10MB limit")

    match = re.match(r"data:([^;]+);base64,(.+)", data_url)
    if not match:
        raise HTTPException(status_code=400, detail="Invalid certificate file data")

    data_mime_type = match.group(1)
    encoded = match.group(2)
    if data_mime_type != mime_type:
        raise HTTPException(status_code=400, detail="Certificate file MIME type mismatch")

    binary_data = base64.b64decode(encoded)
    if len(binary_data) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="Certificate file size exceeds the 10MB limit")

    extension = infer_certificate_extension(mime_type)
    display_name = Path(file_name).name or "certificate"
    safe_base_name = Path(file_name).stem or "certificate"
    stored_name = f"{achievement_id}_{safe_base_name}{extension}"
    file_path = CERTIFICATE_UPLOAD_DIR / stored_name
    file_path.write_bytes(binary_data)
    return display_name, f"/uploads/certificates/{stored_name}", mime_type


def delete_certificate_attachment(certificate_file_path: Optional[str]) -> None:
    if not certificate_file_path:
        return
    try:
        # Resolve to absolute path and verify it is under CERTIFICATE_UPLOAD_DIR
        file_path = (APP_DIR / certificate_file_path.lstrip("/")).resolve()
        file_path.relative_to(CERTIFICATE_UPLOAD_DIR.resolve())
        if file_path.exists():
            file_path.unlink()
            logger.info("Deleted certificate attachment: %s", file_path)
    except ValueError:
        logger.warning("Prevented attempted path traversal delete: %s", certificate_file_path)


def delete_member_photo(photo_url: Optional[str]) -> None:
    if not photo_url or not photo_url.startswith("/uploads/photos/"):
        return
    try:
        # Resolve to absolute path and verify it is under PHOTO_UPLOAD_DIR
        file_path = (APP_DIR / photo_url.lstrip("/")).resolve()
        file_path.relative_to(PHOTO_UPLOAD_DIR.resolve())
        if file_path.exists():
            file_path.unlink()
            logger.info("Deleted member photo: %s", file_path)
    except ValueError:
        logger.warning("Prevented attempted photo delete path traversal: %s", photo_url)


async def save_member_photo(file: UploadFile) -> str:
    if file.content_type not in ALLOWED_PHOTO_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP and GIF images are allowed")

    ext_map = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif"}
    extension = ext_map.get(file.content_type, ".jpg")
    file_name = f"{uuid.uuid4()}{extension}"
    file_path = PHOTO_UPLOAD_DIR / file_name

    MAX_PHOTO_SIZE = 5 * 1024 * 1024  # 5MB limit
    contents = await file.read(MAX_PHOTO_SIZE + 1)
    if len(contents) > MAX_PHOTO_SIZE:
        raise HTTPException(status_code=400, detail="Photo file size exceeds the 5MB limit")

    file_path.write_bytes(contents)

    url_path = f"/uploads/photos/{file_name}"
    logger.info("Photo uploaded: %s (%s, %d bytes)", url_path, file.content_type, len(contents))
    return url_path


async def save_template_background(file: UploadFile) -> str:
    if file.content_type not in ALLOWED_TEMPLATE_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP and GIF images are allowed")

    ext_map = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif"}
    extension = ext_map.get(file.content_type, ".jpg")
    file_name = f"{uuid.uuid4()}{extension}"
    file_path = TEMPLATE_UPLOAD_DIR / file_name

    MAX_TEMPLATE_SIZE = 10 * 1024 * 1024  # 10MB limit
    contents = await file.read(MAX_TEMPLATE_SIZE + 1)
    if len(contents) > MAX_TEMPLATE_SIZE:
        raise HTTPException(status_code=400, detail="Template background image file size exceeds the 10MB limit")

    file_path.write_bytes(contents)

    url_path = f"/uploads/templates/{file_name}"
    logger.info("Template background uploaded: %s (%s, %d bytes)", url_path, file.content_type, len(contents))
    return url_path


def delete_template_background(background_image_url: Optional[str]) -> None:
    if not background_image_url or not background_image_url.startswith("/uploads/templates/"):
        return
    try:
        # Resolve to absolute path and verify it is under TEMPLATE_UPLOAD_DIR
        file_path = (APP_DIR / background_image_url.lstrip("/")).resolve()
        file_path.relative_to(TEMPLATE_UPLOAD_DIR.resolve())
        if file_path.exists():
            file_path.unlink()
            logger.info("Deleted template background image: %s", file_path)
    except ValueError:
        logger.warning("Prevented attempted template background delete path traversal: %s", background_image_url)


