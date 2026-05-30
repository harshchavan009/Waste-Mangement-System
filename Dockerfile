# Single-stage deployment for Python backend and React frontend static host
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies (e.g., for OpenCV)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend and AI model files
COPY backend/ ./backend/

# Copy the pre-compiled frontend static files directly from the repository
COPY frontend/dist ./frontend/dist

# Set the entrypoint to run the FastAPI app via Uvicorn
ENV PORT=8080
EXPOSE 8080
CMD uvicorn backend.main:app --host 0.0.0.0 --port $PORT
