import json
from http.server import HTTPServer, BaseHTTPRequestHandler
import random
import time

class MockBackendHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type")
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        if self.path == '/api/dashboard/stats':
            response = {
                "total_collected_kg": 12450,
                "active_bins": 5430,
                "recycling_efficiency": 78.4,
                "carbon_saved_tons": 850
            }
        elif self.path == '/api/dashboard/bins':
            response = [
                {"id": "BIN-101", "location": "Downtown Square", "level": 85, "status": "critical", "type": "General"},
                {"id": "BIN-102", "location": "Central Park", "level": 45, "status": "warning", "type": "Recycling"},
                {"id": "BIN-103", "location": "Main Station", "level": 92, "status": "critical", "type": "General"},
                {"id": "BIN-104", "location": "University Campus", "level": 15, "status": "good", "type": "Paper"}
            ]
        else:
            response = {"message": "Welcome to EcoVision AI Mock API"}
            
        self.wfile.write(json.dumps(response).encode())

    def do_POST(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        if self.path.startswith('/api/predict'):
            # Simulate prediction delay
            time.sleep(1.5)
            categories = ['Plastic', 'Metal', 'Glass', 'Paper', 'Organic', 'E-Waste']
            instructions = {
                'Plastic': 'Please clean and place in the blue recycling bin.',
                'Metal': 'Ensure cans are empty before placing in the metal bin.',
                'Glass': 'Handle with care. Place in the green glass recycling container.',
                'Paper': 'Keep dry and flat. Place in the paper recycling bin.',
                'Organic': 'Perfect for the compost bin.',
                'E-Waste': 'Do not throw in regular bins! Take to an e-waste collection center.'
            }
            cat = random.choice(categories)
            response = {
                "success": True,
                "filename": "upload.jpg",
                "prediction": cat,
                "confidence": round(random.uniform(85.0, 99.9), 2),
                "instructions": instructions[cat],
                "note": "Using built-in Mock Server"
            }
        else:
            response = {"message": "POST received"}
            
        self.wfile.write(json.dumps(response).encode())

def run(server_class=HTTPServer, handler_class=MockBackendHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Starting mock backend server on port {port}...")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
