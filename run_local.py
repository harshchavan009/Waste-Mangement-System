import subprocess
import sys
import os
import signal
import time

# Handle process termination cleanly on Ctrl+C
backend_process = None
frontend_process = None

def signal_handler(sig, frame):
    print("\n🛑 Shutting down local servers...")
    if backend_process:
        backend_process.terminate()
    if frontend_process:
        frontend_process.terminate()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

print("="*60)
print("🚀 Starting EcoVision AI Local Development Environment...")
print("="*60)

# Determine path to the Python executable in the virtual environment
root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, 'backend')
frontend_dir = os.path.join(root_dir, 'frontend')

venv_python = os.path.join(backend_dir, 'venv', 'bin', 'python')
if not os.path.exists(venv_python):
    venv_python = 'python' # Fallback to global Python if venv is missing

# 1. Start the Flask Backend on port 5001
print("👉 Starting Flask Backend (Port 5001)...")
backend_process = subprocess.Popen(
    [venv_python, 'app.py'],
    cwd=backend_dir
)

# Wait a brief moment to ensure backend starts before Vite tries to connect proxy
time.sleep(1.5)

# 2. Start the Vite Frontend on port 5173
print("👉 Starting Vite React Frontend (Port 5173)...")
frontend_process = subprocess.Popen(
    ['npm', 'run', 'dev'],
    cwd=frontend_dir
)

print("\n" + "="*60)
print("🌍 EcoVision AI is fully loaded!")
print(f"👉 Local Web Application:  http://localhost:5173")
print(f"👉 Local Backend API:      http://localhost:5001")
print("="*60)
print("Press CTRL+C to terminate both servers concurrently.\n")

# Keep the parent process alive to monitor children
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    pass
