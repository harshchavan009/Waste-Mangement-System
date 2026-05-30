import requests
import time
import random

API_URL = "http://localhost:5001/api/iot/update"

bins = [
    {"id": "BIN-101", "location": "Downtown Square", "type": "General", "level": 85},
    {"id": "BIN-102", "location": "Central Park", "type": "Recycling", "level": 45},
    {"id": "BIN-103", "location": "Main Station", "type": "General", "level": 92},
    {"id": "BIN-104", "location": "University Campus", "type": "Paper", "level": 15}
]

def simulate_iot():
    print("Starting IoT Simulator...")
    print(f"Targeting: {API_URL}")
    while True:
        for b in bins:
            # Simulate garbage being thrown in (level increases)
            # or garbage being collected (level drops to 0)
            
            if b["level"] >= 98:
                # Garbage truck collected it
                b["level"] = random.uniform(0, 5)
                print(f"[COLLECTED] {b['id']} has been emptied.")
            else:
                # Normal accumulation based on type
                increment = random.uniform(0.5, 3.0) 
                
                # Make main station fill faster to show predictive AI
                if b["id"] == "BIN-103":
                    increment *= 2.5
                    
                b["level"] = min(100.0, b["level"] + increment)

            # Send payload
            payload = {
                "id": b["id"],
                "location": b["location"],
                "type": b["type"],
                "level": b["level"]
            }
            try:
                res = requests.post(API_URL, json=payload)
                if res.status_code == 200:
                    print(f"[UPDATE] {b['id']} -> {b['level']:.1f}%")
            except Exception as e:
                print(f"[ERROR] Could not connect to server: {e}")

        # Wait a few seconds before next update cycle
        # In reality, this would be every 15-30 minutes
        time.sleep(5)

if __name__ == "__main__":
    simulate_iot()
