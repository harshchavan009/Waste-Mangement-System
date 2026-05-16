from fastapi import APIRouter
from config.db import get_db

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats():
    # In a real app, this would aggregate data from MongoDB
    return {
        "total_collected_kg": 12450,
        "active_bins": 5430,
        "recycling_efficiency": 78.4,
        "carbon_saved_tons": 850
    }

@router.get("/bins")
async def get_bin_status():
    # Mock data for bin IoT sensors
    return [
        {"id": "BIN-101", "location": "Downtown Square", "level": 85, "status": "critical", "type": "General"},
        {"id": "BIN-102", "location": "Central Park", "level": 45, "status": "warning", "type": "Recycling"},
        {"id": "BIN-103", "location": "Main Station", "level": 92, "status": "critical", "type": "General"},
        {"id": "BIN-104", "location": "University Campus", "level": 15, "status": "good", "type": "Paper"}
    ]
