import asyncio
from beanie import init_beanie
from database import db
import models
from core.config import logger
from pymongo.errors import PyMongoError

# Global flag to track connection status
db_initialized = False
db_init_lock = asyncio.Lock()

async def initialize_database(custom_db=None, is_startup=False):
    global db_initialized
    async with db_init_lock:
        if db_initialized:
            return True

        target_db = custom_db if custom_db is not None else db
        try:
            await init_beanie(
                database=target_db,
                document_models=[
                    models.DBMember,
                    models.DBTemplate,
                    models.DBDepartmentEvent,
                    models.DBAchievement,
                ],
            )
            db_initialized = True
            logger.info("Successfully connected to MongoDB and initialized Beanie.")
            return True
        except (PyMongoError, Exception) as e:
            logger.error(f"Failed to initialize MongoDB database: {e}")
            if is_startup:
                # Spawn a background task to retry the connection
                asyncio.create_task(retry_initialize_database(custom_db))
                return False
            raise e

async def retry_initialize_database(custom_db=None):
    global db_initialized
    # Wait a few seconds before the first retry to let server boot / avoid spam
    await asyncio.sleep(5)
    while not db_initialized:
        logger.info("Retrying MongoDB connection and Beanie initialization...")
        success = False
        async with db_init_lock:
            if db_initialized:
                break
            target_db = custom_db if custom_db is not None else db
            try:
                await init_beanie(
                    database=target_db,
                    document_models=[
                        models.DBMember,
                        models.DBTemplate,
                        models.DBDepartmentEvent,
                        models.DBAchievement,
                    ],
                )
                db_initialized = True
                success = True
                logger.info("Successfully connected to MongoDB on retry.")
            except Exception as e:
                logger.warning(f"Database connection retry failed: {e}")
        if success:
            break
        await asyncio.sleep(5)

