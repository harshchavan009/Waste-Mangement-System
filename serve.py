import os
import json
import time
import random
from http.server import SimpleHTTPRequestHandler, HTTPServer
import urllib.parse

# Path to the compiled React frontend
DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend', 'dist')

class FullStackHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type")
        self.end_headers()

    def do_GET(self):
        # API Routes
        if self.path.startswith('/api/'):
            self.handle_api_get()
            return
            
        # React Router fallback
        # If the requested file doesn't exist in DIST_DIR, serve index.html
        requested_path = self.path.lstrip('/')
        file_path = os.path.join(DIST_DIR, requested_path)
        
        if not os.path.exists(file_path) or os.path.isdir(file_path):
            self.path = '/index.html'
            
        super().do_GET()

    def handle_api_get(self):
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
        if self.path.startswith('/api/'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            if self.path.startswith('/api/predict'):
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
                    "note": "Using full-stack Mock Server"
                }
            else:
                response = {"message": "POST received"}
                
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_error(405, "Method Not Allowed")

def run(port=8080):
    server_address = ('', port)
    httpd = HTTPServer(server_address, FullStackHandler)
    print(f"\\n" + "="*50)
    print(f"🚀 EcoVision AI is fully built and running!")
    print(f"🌍 Access the application at: http://localhost:{port}/")
    print("="*50 + "\\n")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
