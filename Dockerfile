# Stage 1: Build the React frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Python backend and assemble the application
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

# Copy the built frontend static files to the expected location
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Set the entrypoint to run the Flask app
ENV PORT=8080
EXPOSE 8080
CMD ["python", "backend/app.py"]
