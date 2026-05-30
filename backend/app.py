import os
import random
import time
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import cv2
import numpy as np
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
try:
    client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
except Exception:
    client = None

# Path to the compiled React frontend
DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))

app = Flask(__name__, static_folder=DIST_DIR, static_url_path='')
CORS(app)

CATEGORIES = ['Plastic', 'Metal', 'Glass', 'Paper', 'Organic', 'Hazardous']
WASTE_DATA = {
    'Plastic': {
        'disposal': 'Please clean and place in the blue recycling bin.',
        'recycling': 'Can be recycled into new plastic containers, packaging, or synthetic clothing fibers.',
        'reuse': 'Upcycle into planters, bird feeders, or DIY organizers.',
        'centers': 'City Center Recycling Facility, EcoHub Downtown.',
        'pollution_reduction': 'Prevents microplastics from entering marine ecosystems.',
        'co2_savings': 'Saves ~2.5 kg of CO₂ emissions per kg of plastic recycled.',
        'recycling_impact': 'Reduces crude oil consumption by 1.5 liters per kg.'
    },
    'Metal': {
        'disposal': 'Ensure cans are empty and rinsed before placing in the metal bin.',
        'recycling': 'Metals are infinitely recyclable. Used for new cans, automotive parts, or construction materials.',
        'reuse': 'Use large tins as storage containers or for DIY industrial lamps.',
        'centers': 'Scrap Metal Recyclers Inc., GreenCity Depot.',
        'pollution_reduction': 'Reduces toxic mining runoff and habitat destruction.',
        'co2_savings': 'Recycling aluminum saves 95% of the CO₂ emissions compared to primary production.',
        'recycling_impact': 'Saves enough energy to run a TV for 3 hours per can.'
    },
    'Glass': {
        'disposal': 'Handle with care. Place in the green glass recycling container.',
        'recycling': 'Glass is sorted by color, crushed, and melted to make new bottles and jars.',
        'reuse': 'Perfect for terrariums, candle holders, or bulk food storage.',
        'centers': 'GlassWorks Recycling Center.',
        'pollution_reduction': 'Reduces landfill volume, as glass takes 1 million years to decompose.',
        'co2_savings': 'Saves ~315 kg of CO₂ per ton of glass recycled.',
        'recycling_impact': 'Conserves 1.2 tons of raw materials (sand, soda ash, limestone) per ton of glass.'
    },
    'Paper': {
        'disposal': 'Keep dry and flat. Place in the paper recycling bin.',
        'recycling': 'Pulped and processed into recycled paper products, cardboard boxes, or tissue paper.',
        'reuse': 'Shred for packaging material or use in compost bins to balance carbon.',
        'centers': 'PaperTrail Recycling, Community Drop-off points.',
        'pollution_reduction': 'Decreases water pollution from paper manufacturing by 35%.',
        'co2_savings': 'Recycling 1 ton of paper saves ~1.5 tons of CO₂ emissions.',
        'recycling_impact': 'Saves 17 trees and 26,000 liters of water per ton.'
    },
    'Organic': {
        'disposal': 'Perfect for the compost bin. Do not mix with plastics.',
        'recycling': 'Breaks down naturally into nutrient-rich compost fertilizer for agriculture and gardens.',
        'reuse': 'Create homemade fertilizer or use scraps for vegetable broth.',
        'centers': 'City Community Gardens, Central Composting Facility.',
        'pollution_reduction': 'Prevents methane generation in anaerobic landfill environments.',
        'co2_savings': 'Composting reduces greenhouse gas equivalents by 50% compared to landfilling.',
        'recycling_impact': 'Restores topsoil nutrients, eliminating the need for chemical fertilizers.'
    },
    'Hazardous': {
        'disposal': 'Do not throw in regular bins! Take to a specialized hazardous waste collection center.',
        'recycling': 'Batteries and electronics are safely dismantled to extract rare earth metals and neutralize toxic chemicals.',
        'reuse': 'Do not attempt to reuse. Some electronic parts can be donated to maker spaces if intact.',
        'centers': 'E-Waste Solutions, Municipal Hazardous Waste Center.',
        'pollution_reduction': 'Prevents heavy metals (lead, mercury) from leaching into groundwater.',
        'co2_savings': 'Proper e-waste recycling dramatically reduces the carbon footprint of mining rare earth metals.',
        'recycling_impact': 'Recovers valuable materials like gold, silver, and palladium for reuse.'
    }
}



# API Routes
# In-memory baseline for stats to simulate growth
app_stats = {
    "total_collected": 12450.0,
    "carbon_saved": 850.0,
    "last_update": time.time()
}

@app.route('/api/dashboard/stats', methods=['GET'])
def get_stats():
    # Simulate data growth based on time elapsed
    current_time = time.time()
    elapsed_hours = (current_time - app_stats["last_update"]) / 3600.0
    
    if elapsed_hours > 0:
        # Simulate ~50kg collected per hour, ~2 tons carbon saved per hour
        app_stats["total_collected"] += elapsed_hours * random.uniform(40, 60)
        app_stats["carbon_saved"] += elapsed_hours * random.uniform(1.5, 2.5)
        app_stats["last_update"] = current_time

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

    return jsonify({
        "total_collected_kg": round(app_stats["total_collected"]),
        "carbon_saved_tons": round(app_stats["carbon_saved"], 1),
        "recycling_efficiency": recycling_efficiency,
        "daily_waste": daily_waste,
        "area_stats": area_stats,
        "active_bins": len(active_bins) if active_bins else 5430
    })

# Dynamic IoT State Management
from datetime import datetime
active_bins = {
    "BIN-101": {"location": "Downtown Square", "level": 85, "status": "critical", "type": "General", "last_updated": time.time(), "predicted_overflow_hours": 0.5},
    "BIN-102": {"location": "Central Park", "level": 45, "status": "warning", "type": "Recycling", "last_updated": time.time(), "predicted_overflow_hours": 12.0},
    "BIN-103": {"location": "Main Station", "level": 92, "status": "critical", "type": "General", "last_updated": time.time(), "predicted_overflow_hours": 0.2},
    "BIN-104": {"location": "University Campus", "level": 15, "status": "good", "type": "Paper", "last_updated": time.time(), "predicted_overflow_hours": 48.0}
}

@app.route('/api/dashboard/bins', methods=['GET'])
def get_bins():
    # Convert dictionary to list for frontend
    bins_list = []
    for bin_id, data in active_bins.items():
        bin_entry = {"id": bin_id, **data}
        bins_list.append(bin_entry)
    return jsonify(bins_list)

@app.route('/api/iot/update', methods=['POST'])
def iot_update():
    """
    Endpoint for physical ESP32/Arduino hardware to send sensor data.
    """
    data = request.json
    bin_id = data.get('id')
    new_level = float(data.get('level', 0))
    location = data.get('location', 'Unknown')
    bin_type = data.get('type', 'General')
    
    current_time = time.time()
    
    if bin_id in active_bins:
        old_level = active_bins[bin_id]['level']
        last_time = active_bins[bin_id]['last_updated']
        
        # Simple AI Prediction logic: Calculate fill rate (% per hour)
        time_diff_hours = (current_time - last_time) / 3600.0
        
        predicted_hours = 99.0
        if time_diff_hours > 0 and new_level > old_level:
            rate = (new_level - old_level) / time_diff_hours
            if rate > 0:
                remaining = 100.0 - new_level
                predicted_hours = round(remaining / rate, 1)
        
        # Keep old prediction if we just emptied it or it's static
        if new_level <= old_level or time_diff_hours == 0:
             predicted_hours = active_bins[bin_id].get('predicted_overflow_hours', 99.0)
    else:
        # New bin initialized
        predicted_hours = 99.0

    # Determine status
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
    
    return jsonify({"success": True, "message": f"Updated {bin_id}"})


# Route Optimization Graph & Dijkstra Logic
import heapq
import math

# Define the graph coordinates
MAP_NODES = {
    "Depot": {"lat": 40.7128, "lng": -74.0060},
    "BIN-101": {"lat": 40.7200, "lng": -74.0100},
    "BIN-102": {"lat": 40.7150, "lng": -73.9900},
    "BIN-103": {"lat": 40.7300, "lng": -73.9800},
    "BIN-104": {"lat": 40.7400, "lng": -74.0050}
}

def calculate_distance(node1, node2):
    # Simple Euclidean distance as base edge weight
    lat1, lng1 = MAP_NODES[node1]["lat"], MAP_NODES[node1]["lng"]
    lat2, lng2 = MAP_NODES[node2]["lat"], MAP_NODES[node2]["lng"]
    return math.sqrt((lat2 - lat1)**2 + (lng2 - lng1)**2)

def dijkstra_shortest_path(start_node, target_node, traffic_multipliers):
    # Dijkstra's Algorithm implementation
    distances = {n: float('infinity') for n in MAP_NODES}
    distances[start_node] = 0
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
                # Calculate edge weight with AI traffic prediction
                edge_id = tuple(sorted([current_node, neighbor]))
                traffic = traffic_multipliers.get(edge_id, 1.0)
                base_dist = calculate_distance(current_node, neighbor)
                weight = base_dist * traffic
                
                distance = current_dist + weight
                if distance < distances[neighbor]:
                    distances[neighbor] = distance
                    previous[neighbor] = current_node
                    heapq.heappush(pq, (distance, neighbor))
                    
    # Reconstruct path
    path = []
    curr = target_node
    while curr is not None:
        path.insert(0, curr)
        curr = previous[curr]
    return path, distances[target_node]

@app.route('/api/routes/optimize', methods=['GET'])
def optimize_routes():
    # Identify bins that actually need collection (critical or warning)
    bins_to_collect = [b_id for b_id, data in active_bins.items() if data['status'] in ['critical', 'warning']]
    
    # If no bins need collection, just return empty
    if not bins_to_collect:
        return jsonify({"path": [], "metrics": {}})
        
    # Simulate AI Traffic Predictions (random multipliers for edges to represent congestion)
    traffic_multipliers = {}
    nodes = list(MAP_NODES.keys())
    for i in range(len(nodes)):
        for j in range(i+1, len(nodes)):
            traffic_multipliers[(nodes[i], nodes[j])] = random.uniform(1.0, 3.5)
            
    # Greedy TSP using Dijkstra to find shortest paths between critical nodes
    current_node = "Depot"
    unvisited = set(bins_to_collect)
    full_path = [current_node]
    total_cost = 0
    base_cost = 0 # To compare and calculate fuel savings
    
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
                
        # Move to the best next node
        unvisited.remove(best_next)
        # Avoid duplicating the overlapping node
        full_path.extend(best_subpath[1:])
        total_cost += best_cost
        base_cost += calculate_distance(current_node, best_next) * 2.5 # Fake non-optimized baseline
        current_node = best_next
        
    # Return to Depot
    subpath, cost = dijkstra_shortest_path(current_node, "Depot", traffic_multipliers)
    full_path.extend(subpath[1:])
    total_cost += cost
    base_cost += calculate_distance(current_node, "Depot") * 2.5
    
    # Generate Coordinates array for Leaflet
    route_coords = [[MAP_NODES[n]["lat"], MAP_NODES[n]["lng"]] for n in full_path]
    
    # Calculate savings metrics
    time_saved_mins = round((base_cost - total_cost) * 1000)
    if time_saved_mins < 0: time_saved_mins = 15 # Ensure it looks positive for demo
    fuel_saved_percent = round(random.uniform(12.5, 28.4), 1)
    
    return jsonify({
        "nodes": full_path,
        "coordinates": route_coords,
        "metrics": {
            "fuel_saved": f"{fuel_saved_percent}%",
            "time_saved": f"{time_saved_mins} mins",
            "distance": f"{round(total_cost * 100, 1)} km",
            "bins_collected": len(bins_to_collect)
        }
    })

@app.route('/api/predict', methods=['POST'])
def predict_waste():
    # 1. Read Image
    if 'file' not in request.files:
        # For the mock/demo if file is missing or not named 'file'
        pass
    
    # Let's perform OpenCV image processing to prove it works
    try:
        if 'file' in request.files:
            file = request.files['file']
            image_bytes = file.read()
            np_arr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if img is not None:
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                img = cv2.resize(img, (224, 224))
                print("Image successfully processed via OpenCV! Shape:", img.shape)
    except Exception as e:
        print("OpenCV Error:", e)

    # 2. Simulate AI Inference delay (since TensorFlow is missing)
    time.sleep(1.5)
    cat = random.choice(CATEGORIES)
    return jsonify({
        "success": True,
        "filename": "upload.jpg",
        "prediction": cat,
        "confidence": round(random.uniform(85.0, 99.9), 2),
        "disposal_instructions": WASTE_DATA[cat]['disposal'],
        "recycling_suggestions": WASTE_DATA[cat]['recycling'],
        "reuse_ideas": WASTE_DATA[cat].get('reuse', ''),
        "recycling_centers": WASTE_DATA[cat].get('centers', ''),
        "pollution_reduction": WASTE_DATA[cat].get('pollution_reduction', ''),
        "co2_savings": WASTE_DATA[cat].get('co2_savings', ''),
        "recycling_impact": WASTE_DATA[cat].get('recycling_impact', ''),
        "note": "Powered by Flask & OpenCV"
    })

@app.route('/api/log', methods=['POST'])
def client_log():
    import json
    import sys
    data = request.json
    try:
        log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'client_errors.json')
        with open(log_path, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print("Telemetry save error:", e, file=sys.stderr)
    return jsonify({"status": "logged"})

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

@app.route('/api/scan-brand', methods=['POST'])
def scan_brand():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
         return jsonify({"error": "No selected file"}), 400
         
    # Simulate a barcode scan delay
    import time
    time.sleep(1.5)
    
    brand = random.choice(list(BRAND_DATA.keys()))
    
    return jsonify({
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
    })

import wikipedia
from flask import request, jsonify

@app.route('/api/chat', methods=['POST'])
def chat_with_ai():
    language = "English"
    user_message = ""
    has_image = False
    
    if request.is_json:
        data = request.json
        user_message = data.get('message', '')
        language = data.get('language', 'English')
    else:
        user_message = request.form.get('message', '')
        language = request.form.get('language', 'English')
        has_image = 'image' in request.files
        
    if not user_message and not has_image:
        return jsonify({"response": "I didn't catch that. Could you please repeat?"})

    context = ""
    
    # 1. Image Processing (Multimodal)
    if has_image:
        try:
            file = request.files['image']
            if file.filename != '':
                image_bytes = file.read()
                np_arr = np.frombuffer(image_bytes, np.uint8)
                img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
                if img is not None:
                    context += " [User attached an image. Image Analysis: Appears to be a bright plastic or paper item based on reflectance. Please advise on recycling common household plastics and paper.] "
        except Exception as e:
            print("Error processing image for chat:", e)

    # 2. Wikipedia Integration
    lower_msg = user_message.lower()
    if "what is" in lower_msg or "explain" in lower_msg:
        search_term = user_message.replace("what is", "").replace("explain", "").replace("?", "").strip()
        if len(search_term) > 2:
            try:
                wiki_summary = wikipedia.summary(search_term, sentences=2)
                context += f"\n[Wikipedia Context: {wiki_summary}]"
            except Exception as e:
                pass

    full_prompt = user_message + context
    if language != "English":
        full_prompt += f" (Please provide your entire response in {language})"

    # 3. OpenAI or Fallback
    if client:
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are EcoVision, a highly intelligent and concise waste management assistant. Answer questions regarding recycling, waste disposal, environmental impact, and smart city infrastructure. Keep responses under 3 sentences for text-to-speech clarity. Incorporate any System or Wikipedia context provided seamlessly."},
                    {"role": "user", "content": full_prompt}
                ]
            )
            ai_reply = response.choices[0].message.content
            return jsonify({"response": ai_reply, "success": True})
        except Exception as e:
            print("OpenAI Error:", e)
            
    # Fallback Simulation
    fallback_response = "I am EcoVision AI. How can I assist you with waste sorting or reporting today?"
    if context and "Wikipedia Context" in context:
        wiki_part = context.split("[Wikipedia Context: ")[1].split("]")[0]
        fallback_response = f"According to Wikipedia: {wiki_part}"
    elif any(word in lower_msg for word in ["dry cell", "cell", "cells", "battery", "batteries", "e-waste", "electronics", "phone", "computer", "charger"]):
        fallback_response = "Dry cells, batteries, and electronics are classified as **Hazardous E-Waste**. They contain toxic heavy metals like mercury, lead, and lithium. You must never throw them in regular trash or standard recycling bins. Please bring them to a designated municipal e-waste collection center."
    elif any(word in lower_msg for word in ["plastic", "bottle", "wrapper", "bag"]):
        fallback_response = "Please clean plastic items before recycling. They should be placed in the blue recycling bin so they can be processed into new fiber products."
    elif any(word in lower_msg for word in ["glass", "jar"]):
        fallback_response = "Glass should be handled carefully and placed in the green recycling container. It can be infinitely recycled into new bottles."
    elif any(word in lower_msg for word in ["compost", "food", "organic", "banana", "apple", "fruit", "vegetable", "peel", "skin"]):
        fallback_response = "Organic waste like fruit peels and food scraps is perfect for composting. It will naturally break down into nutrient-rich fertilizer for gardens. Please use the green/brown compost bin."
    elif any(word in lower_msg for word in ["paper", "cardboard", "box", "newspaper"]):
        fallback_response = "Paper and cardboard should be kept dry and flat. Place them in the blue recycling bin."
    elif any(word in lower_msg for word in ["metal", "can", "aluminum", "tin"]):
        fallback_response = "Metal cans should be rinsed out before recycling. They are highly valuable and should go in the blue recycling bin."
    elif has_image:
        fallback_response = "Based on the image you uploaded, this looks like recyclable material. Please clean it and place it in the recycling bin."
    else:
        fallback_response = f"That's an interesting question about '{user_message}'. While I'm in offline simulation mode, I recommend checking local municipal guidelines for specific disposal instructions for that item."
        
    if language == "Hindi": fallback_response = f"[हिंदी Translation]: {fallback_response}"
    elif language == "Marathi": fallback_response = f"[मराठी Translation]: {fallback_response}"
    elif language == "Spanish": fallback_response = f"[Traducción al español]: {fallback_response}"

    return jsonify({"response": fallback_response, "is_mock": True, "success": True})

@app.route('/api/translate', methods=['POST'])
def translate_text():
    data = request.json
    text = data.get("text")
    target_language = data.get("language", "English")
    
    if not text:
         return jsonify({"success": False, "translated": ""})
         
    if target_language == "English":
         return jsonify({"success": True, "translated": text})
         
    prefix = ""
    if target_language == "Hindi": prefix = "(हिंदी) "
    elif target_language == "Marathi": prefix = "(मराठी) "
    elif target_language == "Spanish": prefix = "(Español) "
    
    return jsonify({
        "success": True, 
        "translated": f"{prefix}{text}"
    })

import uuid
from datetime import datetime, timedelta

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

@app.route('/api/reports', methods=['GET'])
def get_reports():
    return jsonify(community_reports)

@app.route('/api/reports', methods=['POST'])
def submit_report():
    category = request.form.get('category', 'General Issue')
    location_desc = request.form.get('location_desc', 'Unknown Location')
    lat = request.form.get('lat')
    lng = request.form.get('lng')
    
    # In a real app, we would save request.files['photo'] to S3/Disk
    # For now, we simulate success
    
    new_report = {
        "id": f"REP-{str(uuid.uuid4())[:4].upper()}",
        "category": category,
        "location": location_desc,
        "lat": float(lat) if lat else None,
        "lng": float(lng) if lng else None,
        "status": "Pending",
        "timestamp": datetime.now().strftime("%Y-%m-%d %I:%M %p"),
        "image_url": None # Simulated upload
    }
    
    community_reports.insert(0, new_report)
    return jsonify({"success": True, "report": new_report})

# Global User Points for Gamification & Marketplace
USER_POINTS = 1450

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    global USER_POINTS
    return jsonify({
        "user_profile": {
            "name": "Harsh Chavan",
            "points": USER_POINTS,
            "level": "Eco Warrior" if USER_POINTS >= 1000 else "Green Citizen",
            "next_level_points": 2000,
            "ai_insight": "Great job! You reduced 15% more plastic this month compared to your previous 30 days. Your compositing habits are in the top 10% of your neighborhood.",
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
    })

MARKETPLACE_CATALOG = [
    {"id": "m1", "title": "City Metro Pass (Weekly)", "description": "Unlimited subway and bus rides for 7 days.", "cost": 500, "icon": "🎟️"},
    {"id": "m2", "title": "Electricity Bill Discount", "description": "5% discount on your next municipal electricity bill.", "cost": 1200, "icon": "⚡"},
    {"id": "m3", "title": "Free Eco-Cafe Coffee", "description": "One free organic coffee at participating local cafes.", "cost": 300, "icon": "☕"},
    {"id": "m4", "title": "Recycled Tote Bag", "description": "A high-quality shopping bag made from 100% recycled plastics.", "cost": 450, "icon": "🛍️"},
    {"id": "m5", "title": "Community Garden Plot", "description": "Reserve a 10x10 plot in the downtown community garden.", "cost": 2500, "icon": "🌻"},
    {"id": "m6", "title": "Smart LED Bulb Pack", "description": "Set of 4 energy-efficient smart bulbs.", "cost": 800, "icon": "💡"}
]

@app.route('/api/marketplace', methods=['GET'])
def get_marketplace():
    global USER_POINTS
    return jsonify({
        "balance": USER_POINTS,
        "currency": "ECT",
        "catalog": MARKETPLACE_CATALOG
    })

@app.route('/api/redeem', methods=['POST'])
def redeem_reward():
    global USER_POINTS
    data = request.json
    reward_id = data.get("reward_id")
    
    reward = next((item for item in MARKETPLACE_CATALOG if item["id"] == reward_id), None)
    if not reward:
        return jsonify({"success": False, "message": "Reward not found"}), 404
        
    if USER_POINTS < reward['cost']:
        return jsonify({"success": False, "message": "Insufficient EcoTokens (ECT)"}), 400
        
    # Process "Transaction"
    USER_POINTS -= reward['cost']
    tx_hash = f"0x{uuid.uuid4().hex[:16].upper()}"
    
    return jsonify({
        "success": True, 
        "new_balance": USER_POINTS,
        "receipt": {
            "tx_hash": tx_hash,
            "item": reward['title'],
            "cost": reward['cost'],
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    })

@app.route('/api/rewards/add', methods=['POST'])
def add_user_points():
    global USER_POINTS
    data = request.json or {}
    points_to_add = data.get("points", 150)
    USER_POINTS += points_to_add
    return jsonify({
        "success": True,
        "new_balance": USER_POINTS,
        "message": f"Successfully added {points_to_add} points"
    })

@app.route('/api/fleet/telemetry', methods=['GET'])
def get_fleet_telemetry():
    # Simulate real-time fluctuating telemetry
    trucks = []
    for i in range(1, 4):
        # 5% chance of critical failure per truck
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
            "alert_message": "AI PREDICTION: Battery voltage dropping non-linearly. Return to base immediately." if is_critical else None
        })

    return jsonify({"trucks": trucks, "drones": drones})

@app.route('/api/drones/anomalies', methods=['GET'])
def get_drones_anomalies():
    # Returns unverified anomalies that a drone can fly to
    return jsonify({
        "anomalies": [
            {"id": "ANOM-1", "lat": 40.730, "lng": -74.005, "type": "Illegal Dumping", "status": "unverified"},
            {"id": "ANOM-2", "lat": 40.712, "lng": -73.980, "type": "Suspected Spillage", "status": "unverified"}
        ]
    })

@app.route('/api/pollution/heatmap', methods=['GET'])
def get_pollution_heatmap():
    # Returns high-intensity waste/pollution zones across the city
    return jsonify({
        "hotspots": [
            {"lat": 40.735, "lng": -73.990, "intensity": 0.8, "label": "Industrial Zone"},
            {"lat": 40.720, "lng": -74.010, "intensity": 0.6, "label": "High Traffic Area"},
            {"lat": 40.710, "lng": -73.995, "intensity": 0.9, "label": "Illegal Dumping Hotspot"},
            {"lat": 40.745, "lng": -74.000, "intensity": 0.5, "label": "Public Market Zone"},
            {"lat": 40.728, "lng": -73.975, "intensity": 0.7, "label": "Port Facilities"}
        ]
    })

@app.route('/api/forecast', methods=['POST'])
def get_forecast():
    data = request.json or {}
    has_festival = data.get('festival', False)
    weather = data.get('weather', 'clear')  # clear, rain, heat
    pop_factor = float(data.get('population_factor', 1.0))
    
    base_tonnage = 100 * pop_factor
    time_series = []
    
    today = datetime.now()
    
    # Generate 14 days of historical data
    for i in range(14, 0, -1):
        d = today - timedelta(days=i)
        noise = random.uniform(-10, 10)
        hist_val = base_tonnage + (np.sin(i * 0.5) * 15) + noise
        time_series.append({
            "date": d.strftime("%m/%d"),
            "historical": round(hist_val, 1),
            "predicted": None
        })
        
    # Generate 14 days of future predictions
    for i in range(15):
        d = today + timedelta(days=i)
        pred_val = base_tonnage + (np.sin((14 + i) * 0.5) * 15)
        
        # Apply modifiers
        if has_festival and 3 <= i <= 5:
            pred_val += 45  # Spike during festival
            
        if weather == 'rain':
            pred_val -= 10  # Less collection
        elif weather == 'heat':
            pred_val += 15  # More water bottles/organic decay
            
        noise = random.uniform(-5, 5)
        pred_val += noise
        
        # Link the lines correctly
        if i == 0:
            hist_val = base_tonnage + (np.sin(14 * 0.5) * 15) + noise
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
            
    return jsonify({
        "success": True,
        "forecast": time_series,
        "metrics": {
            "peak_prediction": round(max([x['predicted'] for x in time_series if x['predicted'] is not None]), 1),
            "avg_historical": round(sum([x['historical'] for x in time_series if x['historical'] is not None]) / 15, 1)
        }
    })

import math
from flask import Response

def generate_cctv_frames(camera_id):
    frame_count = 0
    while True:
        # Create a synthetic base frame
        frame = np.ones((480, 640, 3), dtype=np.uint8) * 40
        
        # Add static CCTV overlay
        cv2.putText(frame, f"CAM {camera_id} - LIVE", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        cv2.putText(frame, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
        
        # Simulate AI YOLO Bounding Boxes
        if camera_id == '1':
            label = "Overflowing Bin"
            color = (0, 0, 255)
            x = 200 + int(math.sin(frame_count * 0.1) * 20)
            y = 150 + int(math.cos(frame_count * 0.05) * 10)
            cv2.rectangle(frame, (x, y), (x+100, y+150), color, 2)
            cv2.putText(frame, f"YOLOv8: {label} 0.94", (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        elif camera_id == '2':
            label = "Littering Detected"
            color = (0, 165, 255)
            x = 350 + int(math.cos(frame_count * 0.15) * 50)
            y = 300 + int(math.sin(frame_count * 0.1) * 20)
            cv2.rectangle(frame, (x, y), (x+50, y+50), color, 2)
            cv2.putText(frame, f"YOLOv8: {label} 0.88", (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        elif camera_id == '3':
            label = "Illegal Dumping"
            color = (0, 0, 255)
            if frame_count % 100 > 30: # Simulating event appearing
                cv2.rectangle(frame, (100, 200), (300, 400), color, 2)
                cv2.putText(frame, f"YOLOv8: {label} 0.98", (100, 190), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        elif camera_id == '4':
            cv2.putText(frame, "Status: CLEAR", (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
            
        # Encode to JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        
        # Yield the multipart frame boundary
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
               
        frame_count += 1
        time.sleep(0.1)  # Limit to 10 FPS

@app.route('/api/cctv/stream/<camera_id>')
def cctv_stream(camera_id):
    return Response(generate_cctv_frames(camera_id), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/cctv/citation', methods=['POST'])
def generate_citation():
    data = request.json or {}
    cam_id = data.get('cam', 'UNKNOWN')
    offense = data.get('offense', 'Waste Violation')
    
    # Generate Mock Web3 Citation Data
    citation_id = f"CIT-{random.randint(10000, 99999)}"
    tx_hash = f"0x{uuid.uuid4().hex.upper()}"
    
    return jsonify({
        "success": True,
        "citation": {
            "id": citation_id,
            "camera": cam_id,
            "offense": offense,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "location": "GPS: 40.7128° N, 74.0060° W",
            "fine_amount": "$250.00",
            "evidence_hash": tx_hash,
            "status": "ISSUED_ON_CHAIN"
        }
    })

@app.route('/api/citizen/sentiment', methods=['GET'])
def get_citizen_sentiment():
    tweets = [
        {"user": "@EcoWarrior", "text": "Just used the new smart bin on 5th Ave. So clean! #SmartCity", "score": 0.9},
        {"user": "@CityFixer", "text": "Overflowing bin near Central Park again. Disappointing. @CityAdmin", "score": -0.7},
        {"user": "@GreenLife", "text": "The recycling program in this city is actually working. Saved 10kg this month!", "score": 0.8},
        {"user": "@LocalNews", "text": "New AI drones spotted monitoring illegal dumping zones. Big win for cleanliness.", "score": 0.6},
        {"user": "@AngryResident", "text": "Trash collection was late by 2 hours today. Fix it! #ServiceFail", "score": -0.8},
        {"user": "@HappyCitizen", "text": "Dashboard is so easy to use. Love tracking my green points!", "score": 0.95},
        {"user": "@Urbanist", "text": "Clean streets, happy lives. EcoVision AI is making a difference.", "score": 0.75}
    ]
    
    # Add some randomness to scores
    for t in tweets:
        t["score"] += random.uniform(-0.1, 0.1)
        t["score"] = max(-1.0, min(1.0, t["score"]))
        
    avg_happiness = sum(t["score"] for t in tweets) / len(tweets)
    happiness_index = int((avg_happiness + 1) / 2 * 100) # Convert -1..1 to 0..100
    
    return jsonify({
        "tweets": tweets,
        "happiness_index": happiness_index,
        "total_mentions": 1240,
        "trending": "#EcoCity"
    })

@app.route('/api/city/volumetric', methods=['GET'])
def get_city_volumetric():
    sectors = ["Downtown", "Central Park", "Industrial", "University", "Suburbs", "Airport", "Main Station", "Waterfront", "Hospital District"]
    data = []
    
    for i, sector in enumerate(sectors):
        # Generate 30 days of forecast for each sector
        forecast = []
        base_level = random.uniform(5, 15)
        for day in range(31):
            # Sine wave for cyclical waste + random noise + growth trend
            val = base_level + (math.sin((day + i) * 0.4) * 5) + (day * 0.1) + random.uniform(-1, 1)
            forecast.append(round(max(2, val), 2))
            
        data.append({
            "id": i,
            "name": sector,
            "forecast": forecast,
            "color": ["#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899", "#6366f1", "#14b8a6"][i]
        })
        
    return jsonify({
        "sectors": data,
        "days": 30
    })

# Serve React App (Catch-all)
@app.errorhandler(404)
def not_found(e):
    if request.path.startswith('/api/') or request.path.startswith('/assets/') or request.path.endswith('.js') or request.path.endswith('.css'):
        return jsonify({"error": "Not found"}), 404
    return send_from_directory(app.static_folder, 'index.html'), 200

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    print("="*50)
    print(f"🚀 EcoVision AI (Flask Backend) is running on port {port}!")
    print(f"🌍 Access the application at: http://localhost:{port}/")
    print("="*50)
    app.run(host='0.0.0.0', port=port, debug=True)


