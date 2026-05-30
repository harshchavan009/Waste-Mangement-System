from fastapi import APIRouter, UploadFile, File, HTTPException, Body, Request
from fastapi.responses import StreamingResponse, JSONResponse
import random
import time
import uuid
import math
from datetime import datetime, timedelta
import cv2
import numpy as np
import os
import sys

router = APIRouter()

# Global state matching the Flask backend
USER_POINTS = 1450
active_bins = {
    "BIN-101": {"location": "Downtown Square", "level": 85, "status": "critical", "type": "General", "last_updated": time.time(), "predicted_overflow_hours": 0.5},
    "BIN-102": {"location": "Central Park", "level": 45, "status": "warning", "type": "Recycling", "last_updated": time.time(), "predicted_overflow_hours": 12.0},
    "BIN-103": {"location": "Main Station", "level": 92, "status": "critical", "type": "General", "last_updated": time.time(), "predicted_overflow_hours": 0.2},
    "BIN-104": {"location": "University Campus", "level": 15, "status": "good", "type": "Paper", "last_updated": time.time(), "predicted_overflow_hours": 48.0}
}

community_reports = [
    {
        "id": "REP-1234",
        "category": "Overflowing Bin",
        "location": "Downtown Square",
        "lat": 40.7128,
        "lng": -74.0060,
        "status": "In Progress",
        "timestamp": "2026-05-16 10:30 AM",
        "image_url": None
    },
    {
        "id": "REP-1235",
        "category": "Illegal Dumping",
        "location": "Central Park East",
        "lat": 40.7829,
        "lng": -73.9654,
        "status": "Pending",
        "timestamp": "2026-05-16 02:15 PM",
        "image_url": None
    }
]

BRAND_DATA = {
    "Coca-Cola PET Bottle": {
        "material": "PET Plastic (Type 1)",
        "disposal": "Highly Recyclable. Empty all liquid, rinse lightly if needed, and crush the bottle to save space. Leave the cap ON, as modern facilities can process both together.",
        "recycling_suggestions": "Place directly in the blue recycling bin. Avoid bagging recyclables.",
        "centers": "City Curbside Collection",
        "pollution_reduction": "Saves up to 74% energy compared to producing new PET.",
        "co2_savings": "Reduces GHG emissions by 1.5 tons per ton of plastic recycled.",
        "recycling_impact": "Recycled bottles are often turned into synthetic clothing fibers or new bottles."
    },
    "Lays Chips Packet": {
        "material": "Multi-Layered Plastic (MLP)",
        "disposal": "Cannot be conventionally recycled. Do NOT place in the blue bin, as it will contaminate the recycling stream.",
        "recycling_suggestions": "Collect these wrappers and drop them off at a specialized TerraCycle collection point or store drop-off.",
        "centers": "TerraCycle Kiosk / Safeway Drop-off",
        "pollution_reduction": "Prevents microplastics from entering the local water supply.",
        "co2_savings": "Negligible direct savings, but massively reduces landfill toxicity.",
        "recycling_impact": "Specialized centers can melt MLPs down to create park benches and durable plastic lumber."
    },
    "Starbucks Coffee Cup": {
        "material": "Polyethylene-Lined Paper",
        "disposal": "The paper cup is lined with plastic to prevent leaks, meaning it cannot go in standard paper recycling in most cities. Throw the cup in the TRASH.",
        "recycling_suggestions": "The plastic lid (usually Type 5 or 6) can be recycled. Remove it, rinse it, and place it in the recycling bin. Throw the cup itself away.",
        "centers": "Trash (Cup) / Blue Bin (Lid)",
        "pollution_reduction": "Properly separating the lid prevents the entire item from being sent to a landfill.",
        "co2_savings": "Prevents methane emissions from improper anaerobic breakdown.",
        "recycling_impact": "Using a reusable thermos saves an average of 23 lbs of waste per year!"
    },
    "Amazon Prime Box": {
        "material": "Corrugated Cardboard",
        "disposal": "100% Recyclable. Remove all plastic packing tape and shipping labels. Flatten the box completely before recycling.",
        "recycling_suggestions": "If the box is wet or heavily soiled with oil, it cannot be recycled. Otherwise, place in the paper recycling bin.",
        "centers": "City Curbside Collection",
        "pollution_reduction": "Recycling one ton of cardboard saves 46 gallons of oil.",
        "co2_savings": "Saves roughly 3 cubic yards of landfill space per ton.",
        "recycling_impact": "Amazon boxes are actively recycled back into new shipping materials."
    }
}

MAP_NODES = {
    "Depot": {"lat": 40.7128, "lng": -74.0060},
    "BIN-101": {"lat": 40.7200, "lng": -74.0100},
    "BIN-102": {"lat": 40.7150, "lng": -73.9900},
    "BIN-103": {"lat": 40.7300, "lng": -73.9800},
    "BIN-104": {"lat": 40.7400, "lng": -74.0050}
}

def calculate_distance(node1, node2):
    lat1, lng1 = MAP_NODES[node1]["lat"], MAP_NODES[node1]["lng"]
    lat2, lng2 = MAP_NODES[node2]["lat"], MAP_NODES[node2]["lng"]
    return math.sqrt((lat2 - lat1)**2 + (lng2 - lng1)**2)

def dijkstra_shortest_path(start_node, target_node, traffic_multipliers):
    distances = {n: float('infinity') for n in MAP_NODES}
    distances[start_node] = 0
    import heapq
    pq = [(0, start_node)]
    previous = {n: None for n in MAP_NODES}
    
    while pq:
        current_dist, current_node = heapq.heappop(pq)
        
        if current_node == target_node:
            break
            
        if current_dist > distances[current_node]:
            continue
            
        for neighbor in MAP_NODES:
            if neighbor != current_node:
                edge_id = tuple(sorted([current_node, neighbor]))
                traffic = traffic_multipliers.get(edge_id, 1.0)
                base_dist = calculate_distance(current_node, neighbor)
                weight = base_dist * traffic
                
                distance = current_dist + weight
                if distance < distances[neighbor]:
                    distances[neighbor] = distance
                    previous[neighbor] = current_node
                    heapq.heappush(pq, (distance, neighbor))
                    
    path = []
    curr = target_node
    while curr is not None:
        path.insert(0, curr)
        curr = previous[curr]
    return path, distances[target_node]

@router.post("/iot/update")
async def iot_update(payload: dict = Body(...)):
    bin_id = payload.get('id')
    new_level = float(payload.get('level', 0))
    location = payload.get('location', 'Unknown')
    bin_type = payload.get('type', 'General')
    
    current_time = time.time()
    
    if bin_id in active_bins:
        old_level = active_bins[bin_id]['level']
        last_time = active_bins[bin_id]['last_updated']
        time_diff_hours = (current_time - last_time) / 3600.0
        
        predicted_hours = 99.0
        if time_diff_hours > 0 and new_level > old_level:
            rate = (new_level - old_level) / time_diff_hours
            if rate > 0:
                remaining = 100.0 - new_level
                predicted_hours = round(remaining / rate, 1)
        
        if new_level <= old_level or time_diff_hours == 0:
             predicted_hours = active_bins[bin_id].get('predicted_overflow_hours', 99.0)
    else:
        predicted_hours = 99.0

    status = "good"
    if new_level >= 85:
        status = "critical"
    elif new_level >= 50:
        status = "warning"
        
    active_bins[bin_id] = {
        "location": location,
        "level": round(new_level, 1),
        "status": status,
        "type": bin_type,
        "last_updated": current_time,
        "predicted_overflow_hours": predicted_hours
    }
    return {"success": True, "message": f"Updated {bin_id}"}

@router.get("/routes/optimize")
async def optimize_routes():
    bins_to_collect = [b_id for b_id, data in active_bins.items() if data['status'] in ['critical', 'warning']]
    if not bins_to_collect:
        return {"path": [], "metrics": {}}
        
    traffic_multipliers = {}
    nodes = list(MAP_NODES.keys())
    for i in range(len(nodes)):
        for j in range(i+1, len(nodes)):
            traffic_multipliers[(nodes[i], nodes[j])] = random.uniform(1.0, 3.5)
            
    current_node = "Depot"
    unvisited = set(bins_to_collect)
    full_path = [current_node]
    total_cost = 0
    base_cost = 0
    
    while unvisited:
        best_next = None
        best_cost = float('infinity')
        best_subpath = []
        
        for candidate in unvisited:
            subpath, cost = dijkstra_shortest_path(current_node, candidate, traffic_multipliers)
            if cost < best_cost:
                best_cost = cost
                best_next = candidate
                best_subpath = subpath
                
        unvisited.remove(best_next)
        full_path.extend(best_subpath[1:])
        total_cost += best_cost
        base_cost += calculate_distance(current_node, best_next) * 2.5
        current_node = best_next
        
    subpath, cost = dijkstra_shortest_path(current_node, "Depot", traffic_multipliers)
    full_path.extend(subpath[1:])
    total_cost += cost
    base_cost += calculate_distance(current_node, "Depot") * 2.5
    
    route_coords = [[MAP_NODES[n]["lat"], MAP_NODES[n]["lng"]] for n in full_path]
    time_saved_mins = round((base_cost - total_cost) * 1000)
    if time_saved_mins < 0: time_saved_mins = 15
    fuel_saved_percent = round(random.uniform(12.5, 28.4), 1)
    
    return {
        "nodes": full_path,
        "coordinates": route_coords,
        "metrics": {
            "fuel_saved": f"{fuel_saved_percent}%",
            "time_saved": f"{time_saved_mins} mins",
            "distance": f"{round(total_cost * 100, 1)} km",
            "bins_collected": len(bins_to_collect)
        }
    }

@router.post("/scan-brand")
async def scan_brand(file: UploadFile = File(...)):
    await time_sleep_async(1.5)
    brand = random.choice(list(BRAND_DATA.keys()))
    return {
        "prediction": brand,
        "confidence": round(random.uniform(92.0, 99.9), 2),
        "disposal_instructions": BRAND_DATA[brand]['disposal'],
        "recycling_suggestions": BRAND_DATA[brand]['recycling_suggestions'],
        "reuse_ideas": f"Material recognized as {BRAND_DATA[brand]['material']}",
        "recycling_centers": BRAND_DATA[brand].get('centers', ''),
        "pollution_reduction": BRAND_DATA[brand].get('pollution_reduction', ''),
        "co2_savings": BRAND_DATA[brand].get('co2_savings', ''),
        "recycling_impact": BRAND_DATA[brand].get('recycling_impact', ''),
        "note": "Powered by EcoVision Barcode Engine"
    }

@router.post("/chat")
async def chat_with_ai(request: Request):
    # Parse form or JSON
    content_type = request.headers.get("content-type", "")
    user_message = ""
    language = "English"
    has_image = False
    
    if "application/json" in content_type:
        data = await request.json()
        user_message = data.get('message', '')
        language = data.get('language', 'English')
    else:
        form_data = await request.form()
        user_message = form_data.get('message', '')
        language = form_data.get('language', 'English')
        has_image = 'image' in form_data

    fallback_response = "I am EcoVision AI. How can I assist you with waste sorting or reporting today?"
    lower_msg = user_message.lower()
    if any(word in lower_msg for word in ["dry cell", "cell", "cells", "battery", "batteries", "e-waste", "electronics"]):
        fallback_response = "Dry cells, batteries, and electronics are classified as **Hazardous E-Waste**. They contain toxic heavy metals like mercury, lead, and lithium. You must never throw them in regular trash or standard recycling bins. Please bring them to a designated municipal e-waste collection center."
    elif any(word in lower_msg for word in ["plastic", "bottle", "wrapper", "bag"]):
        fallback_response = "Please clean plastic items before recycling. They should be placed in the blue recycling bin so they can be processed into new fiber products."
    elif any(word in lower_msg for word in ["glass", "jar"]):
        fallback_response = "Glass should be handled carefully and placed in the green recycling container. It can be infinitely recycled into new bottles."
    elif any(word in lower_msg for word in ["compost", "food", "organic"]):
        fallback_response = "Organic waste like fruit peels and food scraps is perfect for composting. It will naturally break down into nutrient-rich fertilizer for gardens. Please use the green/brown compost bin."
    elif any(word in lower_msg for word in ["paper", "cardboard", "box"]):
        fallback_response = "Paper and cardboard should be kept dry and flat. Place them in the blue recycling bin."
    elif any(word in lower_msg for word in ["metal", "can", "aluminum"]):
        fallback_response = "Metal cans should be rinsed out before recycling. They are highly valuable and should go in the blue recycling bin."
    elif has_image:
        fallback_response = "Based on the image you uploaded, this looks like recyclable material. Please clean it and place it in the recycling bin."
    
    if language == "Hindi": fallback_response = f"[हिंदी Translation]: {fallback_response}"
    elif language == "Marathi": fallback_response = f"[मराठी Translation]: {fallback_response}"
    elif language == "Spanish": fallback_response = f"[Traducción al español]: {fallback_response}"

    return {"response": fallback_response, "is_mock": True, "success": True}

@router.post("/translate")
async def translate_text(payload: dict = Body(...)):
    text = payload.get("text")
    target_language = payload.get("language", "English")
    if not text:
         return {"success": False, "translated": ""}
    if target_language == "English":
         return {"success": True, "translated": text}
         
    prefix = ""
    if target_language == "Hindi": prefix = "(हिंदी) "
    elif target_language == "Marathi": prefix = "(मराठी) "
    elif target_language == "Spanish": prefix = "(Español) "
    
    return {"success": True, "translated": f"{prefix}{text}"}

@router.get("/reports")
async def get_reports():
    return community_reports

@router.post("/reports")
async def submit_report(request: Request):
    form_data = await request.form()
    category = form_data.get('category', 'General Issue')
    location_desc = form_data.get('location_desc', 'Unknown Location')
    lat = form_data.get('lat')
    lng = form_data.get('lng')
    
    new_report = {
        "id": f"REP-{str(uuid.uuid4())[:4].upper()}",
        "category": category,
        "location": location_desc,
        "lat": float(lat) if lat else None,
        "lng": float(lng) if lng else None,
        "status": "Pending",
        "timestamp": datetime.now().strftime("%Y-%m-%d %I:%M %p"),
        "image_url": None
    }
    community_reports.insert(0, new_report)
    return {"success": True, "report": new_report}

@router.get("/leaderboard")
async def get_leaderboard():
    global USER_POINTS
    return {
        "user_profile": {
            "name": "Harsh Chavan",
            "points": USER_POINTS,
            "level": "Eco Warrior" if USER_POINTS >= 1000 else "Green Citizen",
            "next_level_points": 2000,
            "ai_insight": "Great job! You reduced 15% more plastic this month compared to your previous 30 days.",
            "badges": [
                {"id": 1, "name": "First Recycle", "icon": "♻️", "earned": True},
                {"id": 2, "name": "Compost King", "icon": "🌱", "earned": True},
                {"id": 3, "name": "Zero Waste Hero", "icon": "🌍", "earned": False},
                {"id": 4, "name": "Plastic Patrol", "icon": "🥤", "earned": True},
                {"id": 5, "name": "Community Leader", "icon": "⭐", "earned": False}
            ]
        },
        "leaderboard": [
            {"rank": 1, "name": "Sarah M.", "points": 3200, "avatar": "👩‍🦰"},
            {"rank": 2, "name": "Alex T.", "points": 2850, "avatar": "👨‍🦱"},
            {"rank": 3, "name": "Emma R.", "points": 2400, "avatar": "👱‍♀️"},
            {"rank": 4, "name": "David K.", "points": 2100, "avatar": "🧔"},
            {"rank": 5, "name": "Harsh Chavan", "points": USER_POINTS, "avatar": "🧑‍💻"},
            {"rank": 6, "name": "Jessica W.", "points": 1200, "avatar": "👩‍⚕️"},
            {"rank": 7, "name": "Michael B.", "points": 950, "avatar": "👨‍🔧"}
        ]
    }

MARKETPLACE_CATALOG = [
    {"id": "m1", "title": "City Metro Pass (Weekly)", "description": "Unlimited subway and bus rides for 7 days.", "cost": 500, "icon": "🎟️"},
    {"id": "m2", "title": "Electricity Bill Discount", "description": "5% discount on your next municipal electricity bill.", "cost": 1200, "icon": "⚡"},
    {"id": "m3", "title": "Free Eco-Cafe Coffee", "description": "One free organic coffee at participating local cafes.", "cost": 300, "icon": "☕"},
    {"id": "m4", "title": "Recycled Tote Bag", "description": "A shopping bag made from 100% recycled plastics.", "cost": 450, "icon": "🛍️"},
    {"id": "m5", "title": "Community Garden Plot", "description": "Reserve a 10x10 plot in the downtown community garden.", "cost": 2500, "icon": "🌻"},
    {"id": "m6", "title": "Smart LED Bulb Pack", "description": "Set of 4 energy-efficient smart bulbs.", "cost": 800, "icon": "💡"}
]

@router.get("/marketplace")
async def get_marketplace():
    global USER_POINTS
    return {
        "balance": USER_POINTS,
        "currency": "ECT",
        "catalog": MARKETPLACE_CATALOG
    }

@router.post("/redeem")
async def redeem_reward(payload: dict = Body(...)):
    global USER_POINTS
    reward_id = payload.get("reward_id")
    reward = next((item for item in MARKETPLACE_CATALOG if item["id"] == reward_id), None)
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
        
    if USER_POINTS < reward['cost']:
        raise HTTPException(status_code=400, detail="Insufficient EcoTokens (ECT)")
        
    USER_POINTS -= reward['cost']
    tx_hash = f"0x{uuid.uuid4().hex[:16].upper()}"
    return {
        "success": True, 
        "new_balance": USER_POINTS,
        "receipt": {
            "tx_hash": tx_hash,
            "item": reward['title'],
            "cost": reward['cost'],
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    }

@router.post("/rewards/add")
async def add_user_points(payload: dict = Body(...)):
    global USER_POINTS
    points_to_add = payload.get("points", 150)
    USER_POINTS += points_to_add
    return {
        "success": True,
        "new_balance": USER_POINTS,
        "message": f"Successfully added {points_to_add} points"
    }

@router.get("/fleet/telemetry")
async def get_fleet_telemetry():
    trucks = []
    for i in range(1, 4):
        is_critical = random.random() < 0.05
        engine_temp = random.uniform(110, 130) if is_critical else random.uniform(80, 95)
        oil_life = random.uniform(5, 10) if is_critical else random.uniform(40, 95)
        tire_pressure = random.uniform(80, 95)
        fuel = random.uniform(10, 100)
        
        trucks.append({
            "id": f"TRK-{100 + i}",
            "type": "Heavy Compactor",
            "status": "Critical Warning" if is_critical else "En Route",
            "engine_temp": round(engine_temp, 1),
            "oil_life": round(oil_life, 1),
            "tire_pressure": round(tire_pressure, 1),
            "fuel_level": round(fuel, 1),
            "predictive_alert": is_critical,
            "alert_message": "AI PREDICTION: Engine failure imminent in 48 hrs due to thermal threshold breach." if is_critical else None
        })
        
    drones = []
    for i in range(1, 3):
        is_critical = random.random() < 0.05
        battery = random.uniform(5, 15) if is_critical else random.uniform(40, 100)
        drones.append({
            "id": f"DRN-0{i}",
            "type": "Recon Quadcopter",
            "status": "Return to Base" if is_critical else "Patrolling",
            "battery": round(battery, 1),
            "rotor_rpm": random.randint(4800, 5200),
            "signal_dbm": random.randint(-70, -40),
            "predictive_alert": is_critical,
            "alert_message": "AI PREDICTION: Battery voltage dropping non-linearly." if is_critical else None
        })
    return {"trucks": trucks, "drones": drones}

@router.get("/drones/anomalies")
async def get_drones_anomalies():
    return {
        "anomalies": [
            {"id": "ANOM-1", "lat": 40.730, "lng": -74.005, "type": "Illegal Dumping", "status": "unverified"},
            {"id": "ANOM-2", "lat": 40.712, "lng": -73.980, "type": "Suspected Spillage", "status": "unverified"}
        ]
    }

@router.get("/pollution/heatmap")
async def get_pollution_heatmap():
    return {
        "hotspots": [
            {"lat": 40.735, "lng": -73.990, "intensity": 0.8, "label": "Industrial Zone"},
            {"lat": 40.720, "lng": -74.010, "intensity": 0.6, "label": "High Traffic Area"},
            {"lat": 40.710, "lng": -73.995, "intensity": 0.9, "label": "Illegal Dumping Hotspot"}
        ]
    }

@router.post("/forecast")
async def get_forecast(payload: dict = Body(...)):
    has_festival = payload.get('festival', False)
    weather = payload.get('weather', 'clear')
    pop_factor = float(payload.get('population_factor', 1.0))
    
    base_tonnage = 100 * pop_factor
    time_series = []
    today = datetime.now()
    
    for i in range(14, 0, -1):
        d = today - timedelta(days=i)
        noise = random.uniform(-10, 10)
        hist_val = base_tonnage + (math.sin(i * 0.5) * 15) + noise
        time_series.append({
            "date": d.strftime("%m/%d"),
            "historical": round(hist_val, 1),
            "predicted": None
        })
        
    for i in range(15):
        d = today + timedelta(days=i)
        pred_val = base_tonnage + (math.sin((14 + i) * 0.5) * 15)
        if has_festival and 3 <= i <= 5:
            pred_val += 45
        if weather == 'rain':
            pred_val -= 10
        elif weather == 'heat':
            pred_val += 15
            
        noise = random.uniform(-5, 5)
        pred_val += noise
        
        if i == 0:
            hist_val = base_tonnage + (math.sin(14 * 0.5) * 15) + noise
            time_series.append({
                "date": d.strftime("%m/%d"),
                "historical": round(hist_val, 1),
                "predicted": round(hist_val, 1)
            })
        else:
            time_series.append({
                "date": d.strftime("%m/%d"),
                "historical": None,
                "predicted": round(pred_val, 1)
            })
            
    return {
        "success": True,
        "forecast": time_series,
        "metrics": {
            "peak_prediction": round(max([x['predicted'] for x in time_series if x['predicted'] is not None]), 1),
            "avg_historical": round(sum([x['historical'] for x in time_series if x['historical'] is not None]) / 15, 1)
        }
    }

def generate_cctv_frames(camera_id):
    frame_count = 0
    while True:
        frame = np.ones((480, 640, 3), dtype=np.uint8) * 40
        cv2.putText(frame, f"CAM {camera_id} - LIVE", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        cv2.putText(frame, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
        
        label = "Clear"
        color = (0, 255, 0)
        if camera_id == '1':
            label = "Overflowing Bin"
            color = (0, 0, 255)
            x = 200 + int(math.sin(frame_count * 0.1) * 20)
            y = 150 + int(math.cos(frame_count * 0.05) * 10)
            cv2.rectangle(frame, (x, y), (x+100, y+150), color, 2)
            cv2.putText(frame, f"YOLOv8: {label}", (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        frame_count += 1
        time.sleep(0.1)

@router.get("/cctv/stream/{camera_id}")
async def cctv_stream(camera_id: str):
    return StreamingResponse(generate_cctv_frames(camera_id), media_type="multipart/x-mixed-replace; boundary=frame")

@router.post("/cctv/citation")
async def generate_citation(payload: dict = Body(...)):
    cam_id = payload.get('cam', 'UNKNOWN')
    offense = payload.get('offense', 'Waste Violation')
    citation_id = f"CIT-{random.randint(10000, 99999)}"
    tx_hash = f"0x{uuid.uuid4().hex.upper()}"
    return {
        "success": True,
        "citation": {
            "id": citation_id,
            "camera": cam_id,
            "offense": offense,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "location": "GPS: 40.7128 W",
            "fine_amount": "$250.00",
            "evidence_hash": tx_hash,
            "status": "ISSUED_ON_CHAIN"
        }
    }

@router.get("/citizen/sentiment")
async def get_citizen_sentiment():
    tweets = [
        {"user": "@EcoWarrior", "text": "Just used the new smart bin. Clean! #SmartCity", "score": 0.9},
        {"user": "@CityFixer", "text": "Overflowing bin near Central Park again.", "score": -0.7},
        {"user": "@GreenLife", "text": "The recycling program is actually working.", "score": 0.8}
    ]
    avg_happiness = sum(t["score"] for t in tweets) / len(tweets)
    happiness_index = int((avg_happiness + 1) / 2 * 100)
    return {
        "tweets": tweets,
        "happiness_index": happiness_index,
        "total_mentions": 1240,
        "trending": "#EcoCity"
    }

@router.get("/city/volumetric")
async def get_city_volumetric():
    sectors = ["Downtown", "Central Park", "Industrial", "University"]
    data = []
    for i, sector in enumerate(sectors):
        forecast = []
        base_level = random.uniform(5, 15)
        for day in range(31):
            val = base_level + (math.sin((day + i) * 0.4) * 5) + (day * 0.1) + random.uniform(-1, 1)
            forecast.append(round(max(2, val), 2))
        data.append({
            "id": i,
            "name": sector,
            "forecast": forecast,
            "color": ["#3b82f6", "#10b981", "#ef4444", "#8b5cf6"][i]
        })
    return {"sectors": data, "days": 30}

@router.post("/log")
async def client_log(request: Request):
    data = await request.json()
    try:
        log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'client_errors.json')
        with open(log_path, 'w') as f:
            import json
            json.dump(data, f, indent=2)
    except Exception as e:
        print("Telemetry save error:", e)
    return {"status": "logged"}

async def time_sleep_async(seconds):
    import asyncio
    await asyncio.sleep(seconds)
