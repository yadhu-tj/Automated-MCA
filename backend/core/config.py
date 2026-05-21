import logging
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("mca_api")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

APP_DIR = Path(__file__).resolve().parent.parent
UPLOAD_ROOT = APP_DIR / "uploads"
CERTIFICATE_UPLOAD_DIR = UPLOAD_ROOT / "certificates"
PHOTO_UPLOAD_DIR = UPLOAD_ROOT / "photos"

CERTIFICATE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
PHOTO_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

import os
from core.auth import hash_password

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@mca.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "1234")
ADMIN_PASSWORD_HASH = os.environ.get("ADMIN_PASSWORD_HASH", hash_password(ADMIN_PASSWORD))


