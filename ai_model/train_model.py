import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from PIL import Image

# Configuration
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 10
NUM_CLASSES = 6
CATEGORIES = ['Plastic', 'Metal', 'Glass', 'Paper', 'Organic', 'E-Waste']
MODEL_SAVE_PATH = 'waste_detection_model.h5'
DATASET_DIR = 'dummy_dataset'

def create_synthetic_dataset():
    """
    Creates a small dummy dataset locally so the script can run out-of-the-box.
    For a real-world scenario, replace 'dummy_dataset' with your actual dataset folder
    containing subfolders for each category.
    """
    print("Creating synthetic dataset for demonstration purposes...")
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
    print("Building MobileNetV2 based model...")
    # Load MobileNetV2 without the top fully-connected layers
    base_model = MobileNetV2(
        weights='imagenet', 
        include_top=False, 
        input_shape=(224, 224, 3)
    )
    
    # Freeze the base model layers
    base_model.trainable = False
    
    # Add custom top layers for our specific 6 classes
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.5)(x)
    predictions = Dense(NUM_CLASSES, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def train():
    # 1. Prepare data
    create_synthetic_dataset()
    
    # Use ImageDataGenerator for data augmentation
    datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        validation_split=0.2 # 80% train, 20% val
    )
    
    print("Loading training data...")
    train_generator = datagen.flow_from_directory(
        DATASET_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training'
    )
    
    print("Loading validation data...")
    val_generator = datagen.flow_from_directory(
        DATASET_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation'
    )
    
    # 2. Build Model
    model = build_model()
    
    # 3. Train Model
    print("Starting training...")
    model.fit(
        train_generator,
        epochs=EPOCHS,
        validation_data=val_generator
    )
    
    # 4. Save Model
    print(f"Saving model to {MODEL_SAVE_PATH}...")
    model.save(MODEL_SAVE_PATH)
    print("Training complete! Model saved successfully.")

if __name__ == "__main__":
    train()
