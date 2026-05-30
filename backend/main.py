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

# Path to the compiled React frontend
DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))

if os.path.exists(DIST_DIR):
    # Mount assets folder
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")

    # Add fallback routing for SPA (React Router)
    @app.get("/{fallback_path:path}")
    async def fallback(fallback_path: str):
        # Exclude API routes
        if fallback_path.startswith("api/"):
            return JSONResponse(status_code=404, content={"error": "Not Found"})
        
        # Check if the file exists in the dist directory
        file_path = os.path.join(DIST_DIR, fallback_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
        return FileResponse(os.path.join(DIST_DIR, "index.html"))
else:
    @app.get("/")
    async def root():
        return {"message": "Welcome to EcoVision AI API (Frontend build missing)"}

