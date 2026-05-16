from motor.motor_asyncio import AsyncIOMotorClient
import os

# Default local MongoDB connection. Update MONGODB_URL in production.
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
database = client.ecovision_db

def get_db():
    return database
