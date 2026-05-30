import os
import ssl
ssl._create_default_https_context = ssl._create_unverified_context
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader
import numpy as np
from PIL import Image

# Configuration
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 3
NUM_CLASSES = 6
CATEGORIES = ['Plastic', 'Metal', 'Glass', 'Paper', 'Organic', 'E-Waste']
MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), 'waste_detection_model.pth')
DATASET_DIR = os.path.join(os.path.dirname(__file__), 'dummy_dataset')

def create_synthetic_dataset():
    """
    Creates a small dummy dataset locally so the script can run out-of-the-box.
    For a real-world scenario, replace 'dummy_dataset' with your actual dataset folder.
    """
    print("Creating synthetic dataset for PyTorch training...")
    os.makedirs(DATASET_DIR, exist_ok=True)
    
    for category in CATEGORIES:
        cat_dir = os.path.join(DATASET_DIR, category)
        os.makedirs(cat_dir, exist_ok=True)
        
        # Create 10 dummy images per category
        for i in range(10):
            img_path = os.path.join(cat_dir, f'dummy_{i}.jpg')
            if not os.path.exists(img_path):
                # Generate a random noise image
                random_array = np.random.rand(224, 224, 3) * 255
                img = Image.fromarray(random_array.astype('uint8')).convert('RGB')
                img.save(img_path)
    print("Synthetic dataset created at:", DATASET_DIR)

def build_model():
    """
    Builds a Transfer Learning model using MobileNetV2.
    """
    print("Building PyTorch MobileNetV2 based model...")
    # Load MobileNetV2 pretrained weights
    weights = models.MobileNet_V2_Weights.DEFAULT
    model = models.mobilenet_v2(weights=weights)
    
    # Freeze the base model layers
    for param in model.parameters():
        param.requires_grad = False
        
    # Replace the final classification layer
    num_features = model.classifier[1].in_features
    model.classifier[1] = nn.Sequential(
        nn.Linear(num_features, 128),
        nn.ReLU(),
        nn.Dropout(0.5),
        nn.Linear(128, NUM_CLASSES)
    )
    
    return model

def train():
    # 1. Prepare data
    create_synthetic_dataset()
    
    # Image transforms for training & validation
    data_transforms = {
        'train': transforms.Compose([
            transforms.Resize(IMG_SIZE),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(20),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'val': transforms.Compose([
            transforms.Resize(IMG_SIZE),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
    }
    
    # Load full dataset
    full_dataset = datasets.ImageFolder(DATASET_DIR, transform=data_transforms['train'])
    
    # Split train/val (80% train, 20% val)
    train_size = int(0.8 * len(full_dataset))
    val_size = len(full_dataset) - train_size
    train_dataset, val_dataset = torch.utils.data.random_split(full_dataset, [train_size, val_size])
    
    # Apply val transforms to validation set
    val_dataset.dataset.transform = data_transforms['val']
    
    # Create DataLoaders
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)
    
    # 2. Build Model
    model = build_model()
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    model = model.to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.classifier.parameters(), lr=0.001)
    
    # 3. Train Model
    print("Starting training...")
    for epoch in range(EPOCHS):
        model.train()
        running_loss = 0.0
        corrects = 0
        
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * inputs.size(0)
            _, preds = torch.max(outputs, 1)
            corrects += torch.sum(preds == labels.data)
            
        epoch_loss = running_loss / train_size
        epoch_acc = corrects.double() / train_size
        print(f"Epoch {epoch+1}/{EPOCHS} - Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}")
        
    # 4. Save Model
    print(f"Saving PyTorch model to {MODEL_SAVE_PATH}...")
    torch.save(model, MODEL_SAVE_PATH)
    print("Training complete! Model saved successfully.")

if __name__ == "__main__":
    train()
