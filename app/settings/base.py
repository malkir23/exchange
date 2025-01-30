from motor.motor_asyncio import AsyncIOMotorClient
import os

# MongoDB connection URI (from environment variables)
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

# Database Name
DB_NAME = "hyperliquid"

# MongoDB Client
mongo_client = AsyncIOMotorClient(MONGO_URI)
mongo_db = mongo_client[DB_NAME]  # Reference to the database


async def get_collection(collection_name: str):
    """Return a MongoDB collection instance."""
    return mongo_db[collection_name]
