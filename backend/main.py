from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, predict, dashboard

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

@app.get("/")
async def root():
    return {"message": "Welcome to EcoVision AI API"}
