from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import sys

# Add ai_model to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
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
