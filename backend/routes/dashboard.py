from fastapi import APIRouter
from config.db import get_db
import time
import random

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats():
    current_time = time.time()
    
    # Generate recent 7 days of daily waste
    daily_waste = []
    base_val = 1800
    for i in range(7):
        day_name = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][(int(current_time) // 86400 + i) % 7]
        # Adding some randomness to simulate real daily fluctuations
        processed = int(base_val + random.uniform(-300, 800) + (i * 50))
        recycled = int(processed * random.uniform(0.65, 0.85)) # 65-85% recycling rate
        daily_waste.append({
            "name": day_name,
            "processed": processed,
            "recycled": recycled
        })

    # Area-wise waste statistics
    area_stats = [
        {"name": "Downtown Square", "value": int(random.uniform(300, 500)), "fill": "#3b82f6"},
        {"name": "Central Park", "value": int(random.uniform(100, 250)), "fill": "#10b981"},
        {"name": "Main Station", "value": int(random.uniform(400, 600)), "fill": "#f59e0b"},
        {"name": "University Campus", "value": int(random.uniform(150, 350)), "fill": "#8b5cf6"},
        {"name": "Industrial Zone", "value": int(random.uniform(500, 800)), "fill": "#ef4444"}
    ]
    
    # Calculate live recycling efficiency based on daily waste
    total_processed = sum(d["processed"] for d in daily_waste)
    total_recycled = sum(d["recycled"] for d in daily_waste)
    recycling_efficiency = round((total_recycled / total_processed) * 100, 1)

    return {
        "total_collected_kg": 12450,
        "active_bins": 5430,
        "recycling_efficiency": recycling_efficiency,
        "carbon_saved_tons": 850,
        "daily_waste": daily_waste,
        "area_stats": area_stats
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

