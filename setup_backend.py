import os
import json

files = {
    "backend/requirements.txt": """fastapi==0.104.1
uvicorn==0.24.0.post1
motor==3.3.1
pydantic==2.4.2
pydantic-settings==2.0.3
python-multipart==0.0.6
passlib[bcrypt]==1.7.4
python-jose[cryptography]==3.3.0
tensorflow==2.15.0
opencv-python-headless==4.8.1.78
Pillow==10.1.0
numpy==1.26.2
""",

    "backend/main.py": """from fastapi import FastAPI
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
""",

    "backend/config/db.py": """from motor.motor_asyncio import AsyncIOMotorClient
import os

# Default local MongoDB connection. Update MONGODB_URL in production.
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
database = client.ecovision_db

def get_db():
    return database
""",

    "backend/routes/auth.py": """from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from config.db import get_db

router = APIRouter()

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
SECRET_KEY = "ecovision_super_secret_key_change_in_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/register")
async def register_user(user: UserCreate):
    db = get_db()
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user_dict = user.model_dump()
    user_dict["password"] = get_password_hash(user.password)
    user_dict["role"] = "user"
    user_dict["created_at"] = datetime.utcnow()
    
    result = await db.users.insert_one(user_dict)
    
    return {"message": "User created successfully", "id": str(result.inserted_id)}

@router.post("/login")
async def login_user(user: UserLogin):
    db = get_db()
    
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
        
    access_token = create_access_token(
        data={"sub": str(db_user["_id"]), "email": db_user["email"], "role": db_user["role"]}
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "name": db_user["name"],
            "email": db_user["email"],
            "role": db_user["role"]
        }
    }
""",

    "backend/routes/dashboard.py": """from fastapi import APIRouter
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
""",

    "backend/routes/predict.py": """from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import sys

# Add ai_model to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from ai_model.classifier import predict_waste

router = APIRouter()

@router.post("/")
async def classify_waste_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    try:
        contents = await file.read()
        
        # In a real scenario, we might want to save the file temporarily or pass the bytes
        # to our model. We will pass bytes to our classifier.
        result = predict_waste(contents)
        
        return {
            "success": True,
            "filename": file.filename,
            "prediction": result["category"],
            "confidence": result["confidence"],
            "instructions": result["instructions"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")
""",

    "ai_model/classifier.py": """import os
import io
import numpy as np

# In a real scenario, you would uncomment this and load a trained Keras model
# import tensorflow as tf
# from PIL import Image
# MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.h5')
# model = tf.keras.models.load_model(MODEL_PATH)

def predict_waste(image_bytes):
    \"\"\"
    Mock prediction function for waste classification.
    In a real implementation, this would:
    1. Open image_bytes using PIL
    2. Resize to model input size (e.g. 224x224)
    3. Normalize pixel values
    4. Pass to tf.keras.models.predict()
    5. Map output probabilities to categories
    \"\"\"
    
    # Simulating model inference delay and logic
    # We will just return a random classification for the demo
    
    categories = {
        'Plastic': 'Please clean and place in the blue recycling bin.',
        'Metal': 'Ensure cans are empty before placing in the metal bin.',
        'Glass': 'Handle with care. Place in the green glass recycling container.',
        'Organic': 'Perfect for the compost bin.',
        'Paper': 'Keep dry and flat. Place in the paper recycling bin.',
        'E-Waste': 'Do not throw in regular bins! Take to an e-waste collection center.'
    }
    
    import random
    import time
    
    # Simulate processing time
    time.sleep(1.5)
    
    category = random.choice(list(categories.keys()))
    confidence = round(random.uniform(85.0, 99.9), 2)
    instructions = categories[category]
    
    return {
        "category": category,
        "confidence": confidence,
        "instructions": instructions
    }
"""
}

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

print("Backend setup files created.")
