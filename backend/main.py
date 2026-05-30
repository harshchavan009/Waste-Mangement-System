from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from routes import auth, predict, dashboard, extra_api
import os

app = FastAPI(
    title="EcoVision AI API",
    description="Backend API for Smart Waste Management System",
    version="1.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, change to actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(predict.router, prefix="/api/predict", tags=["AI Classification"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(extra_api.router, prefix="/api", tags=["Extra Services"])

# Robust path resolution to locate the React frontend build folder
DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))

if not os.path.exists(DIST_DIR):
    # Try relative to the current working directory
    DIST_DIR = os.path.abspath(os.path.join(os.getcwd(), 'frontend', 'dist'))

if not os.path.exists(DIST_DIR):
    # Try inside the backend folder (in case it was built there)
    DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), 'dist'))

@app.get("/debug")
async def debug():
    return {
        "cwd": os.getcwd(),
        "dist_dir": DIST_DIR,
        "exists": os.path.exists(DIST_DIR)
    }

print("="*60)
print(f"🔍 [Deployment Check] Resolving frontend build path...")
print(f"📂 Resolved Path: {DIST_DIR}")
print(f"✅ Path Exists:  {os.path.exists(DIST_DIR)}")
if os.path.exists(DIST_DIR):
    try:
        print(f"📁 Directory Contents: {os.listdir(DIST_DIR)}")
    except Exception as e:
        print(f"⚠️ Directory Listing Failed: {e}")
print("="*60)

if os.path.exists(DIST_DIR):
    # Mount assets folder for static files (CSS, JS, images)
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")

    # Add fallback routing for SPA (React Router)
    @app.get("/{fallback_path:path}")
    async def fallback(fallback_path: str):
        # Exclude API routes
        if fallback_path.startswith("api/"):
            return JSONResponse(status_code=404, content={"error": "Not Found"})
        
        # Check if the file exists directly in the dist directory (e.g., manifest.json, favicon.ico)
        file_path = os.path.join(DIST_DIR, fallback_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
        # Return index.html for all React SPA routes
        return FileResponse(os.path.join(DIST_DIR, "index.html"))
else:
    @app.get("/")
    async def root():
        return {
            "message": "Welcome to EcoVision AI API",
            "status": "Frontend build folder missing. Expected at: " + DIST_DIR
        }


