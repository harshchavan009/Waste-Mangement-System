import os
os.environ["OPENCV_AVFOUNDATION_SKIP_AUTH"] = "1"
import cv2
import numpy as np

try:
    import torch
    import torchvision.transforms as transforms
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("WARNING: PyTorch is not installed. Falling back to mock AI inference.")

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'waste_detection_model.pth')

# Categories matching the training script
CATEGORIES = ['Plastic', 'Metal', 'Glass', 'Paper', 'Organic', 'E-Waste']

INSTRUCTIONS = {
    'Plastic': 'Please clean and place in the blue recycling bin.',
    'Metal': 'Ensure cans are empty before placing in the metal bin.',
    'Glass': 'Handle with care. Place in the green glass recycling container.',
    'Paper': 'Keep dry and flat. Place in the paper recycling bin.',
    'Organic': 'Perfect for the compost bin.',
    'E-Waste': 'Do not throw in regular bins! Take to an e-waste collection center.'
}

# Load the model once when the module is imported
_model = None
if TORCH_AVAILABLE and os.path.exists(MODEL_PATH):
    print(f"Loading trained PyTorch model from {MODEL_PATH}...")
    try:
        # Load the model directly to CPU for inference
        _model = torch.load(MODEL_PATH, map_location=torch.device('cpu'), weights_only=False)
        _model.eval() # Set model to evaluation mode
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Failed to load model: {e}")
else:
    if TORCH_AVAILABLE:
        print(f"WARNING: Model file not found at {MODEL_PATH}.")
        print("Run `python backend/ai_model/train_model.py` to generate the model first. Falling back to mock AI inference.")

# Standard ImageNet transforms matching MobileNetV2
_transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def predict_waste(image_bytes):
    """
    Real prediction function for waste classification using OpenCV and PyTorch.
    1. Decodes image_bytes using OpenCV (cv2.imdecode)
    2. Converts to PyTorch Tensor and applies ImageNet normalization
    3. Passes to the PyTorch model
    4. Maps output probabilities to categories
    """
    
    # If model is not loaded or PyTorch is unavailable, use the fallback mock logic
    if _model is None or not TORCH_AVAILABLE:
        import random
        import time
        time.sleep(1.5) # Simulate processing time
        
        category = random.choice(CATEGORIES)
        confidence = round(random.uniform(85.0, 99.9), 2)
        return {
            "category": category,
            "confidence": confidence,
            "instructions": INSTRUCTIONS[category],
            "note": "MOCK INFERENCE (Model not trained/loaded)"
        }
        
    try:
        # 1. Decode image bytes to OpenCV format (numpy array)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Could not decode image bytes")
            
        # OpenCV uses BGR by default, convert to RGB
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # 2. Apply PyTorch transforms
        img_tensor = _transform(img)
        img_tensor = img_tensor.unsqueeze(0) # Add batch dimension: (1, 3, 224, 224)
        
        # 3. Run inference
        with torch.no_grad():
            outputs = _model(img_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            
        # 4. Get highest probability class
        class_idx = torch.argmax(probabilities).item()
        confidence = probabilities[class_idx].item() * 100
        category = CATEGORIES[class_idx]
        
        return {
            "category": category,
            "confidence": round(confidence, 2),
            "instructions": INSTRUCTIONS.get(category, "Please dispose of carefully.")
        }
        
    except Exception as e:
        print(f"Error during real inference: {e}")
        # Fallback in case of image processing error
        return {
            "category": "Unknown",
            "confidence": 0.0,
            "instructions": "Error processing image. Please try again.",
            "error": str(e)
        }
