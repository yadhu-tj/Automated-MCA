import asyncio
import os
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load env variables if any
load_dotenv()

MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.environ.get("MONGODB_DB_NAME", "mca_greetings")

async def migrate():
    print(f"Connecting to MongoDB at: {MONGODB_URI}")
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[MONGODB_DB_NAME]
    print(f"Target Database: {MONGODB_DB_NAME}")

    # 1. Migrate members
    members_col = db["members"]
    member_id_map = {}  # old_uuid_str -> new_object_id_str
    
    print("\n--- Migrating Members ---")
    async for member in members_col.find({}):
        old_id = member["_id"]
        if isinstance(old_id, str):
            new_id = ObjectId()
            member_id_map[old_id] = str(new_id)
            
            new_member = dict(member)
            new_member["_id"] = new_id
            
            await members_col.insert_one(new_member)
            await members_col.delete_one({"_id": old_id})
            print(f"Migrated member '{member.get('name')}': '{old_id}' -> {new_id}")
        else:
            print(f"Member '{member.get('name')}' already has ObjectId: {old_id}")
            member_id_map[str(old_id)] = str(old_id)

    # 2. Migrate achievements
    achievements_col = db["achievements"]
    print("\n--- Migrating Achievements ---")
    async for achievement in achievements_col.find({}):
        old_id = achievement["_id"]
        old_member_id = achievement.get("memberId")
        new_member_id = member_id_map.get(old_member_id, old_member_id)
        
        need_update = False
        new_achievement = dict(achievement)
        
        if isinstance(old_id, str):
            new_id = ObjectId()
            new_achievement["_id"] = new_id
            need_update = True
        else:
            new_id = old_id
            
        if old_member_id != new_member_id:
            new_achievement["memberId"] = new_member_id
            need_update = True
            
        if need_update:
            await achievements_col.insert_one(new_achievement)
            await achievements_col.delete_one({"_id": old_id})
            print(f"Migrated achievement '{achievement.get('title')}': ID '{old_id}' -> '{new_id}', memberId '{old_member_id}' -> '{new_member_id}'")
        else:
            print(f"Achievement '{achievement.get('title')}' is already correct.")

    # 3. Migrate templates
    templates_col = db["templates"]
    print("\n--- Migrating Templates ---")
    async for template in templates_col.find({}):
        old_id = template["_id"]
        if isinstance(old_id, str):
            new_id = ObjectId()
            new_template = dict(template)
            new_template["_id"] = new_id
            
            await templates_col.insert_one(new_template)
            await templates_col.delete_one({"_id": old_id})
            print(f"Migrated template '{template.get('name')}': '{old_id}' -> '{new_id}'")
        else:
            print(f"Template '{template.get('name')}' already has ObjectId: {old_id}")

    # 4. Migrate department events
    events_col = db["department_events"]
    print("\n--- Migrating Department Events ---")
    async for event in events_col.find({}):
        old_id = event["_id"]
        if isinstance(old_id, str):
            new_id = ObjectId()
            new_event = dict(event)
            new_event["_id"] = new_id
            
            await events_col.insert_one(new_event)
            await events_col.delete_one({"_id": old_id})
            print(f"Migrated event '{event.get('title')}': '{old_id}' -> '{new_id}'")
        else:
            print(f"Event '{event.get('title')}' already has ObjectId: {old_id}")

    print("\nMigration finished successfully.")

if __name__ == "__main__":
    asyncio.run(migrate())
