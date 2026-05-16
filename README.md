# EcoVision AI – Smart Waste Management System

A modern, full-stack AI-powered waste management web application designed for smart cities. Built with React.js, Tailwind CSS, Framer Motion, FastAPI, MongoDB, and TensorFlow.

## Features

- **Modern Homepage:** Responsive landing page with animated background, smart city theme, glassmorphism UI, and key statistics.
- **Authentication System:** Secure JWT-based Login/Signup system with role management.
- **AI Waste Classification:** Upload images of waste to get instant categorization (Plastic, Metal, Glass, Organic, Paper, E-Waste) using a deep learning CNN model, complete with prediction confidence and handling instructions.
- **Smart Dashboard:** Real-time analytics, recycling efficiency charts, and total waste processed statistics visualized using Recharts.
- **Smart Bin Monitoring:** IoT-simulated dashboard showing bin fill-levels, critical alerts, and live status progress bars.
- **Route Optimization:** Interactive Map showing AI-calculated shortest paths for garbage truck fleets to optimize fuel and time.
- **Dark/Light Mode:** Full support for seamless theme switching with dynamic colors.

## Tech Stack

**Frontend:**
- React.js (Vite)
- Tailwind CSS
- Framer Motion
- Recharts
- React Leaflet
- Lucide React (Icons)

**Backend:**
- FastAPI (Python)
- MongoDB (Motor Async)
- TensorFlow / Keras (AI Model)
- OpenCV (Image Processing)
- PyJWT & Passlib (Authentication)

## Project Structure

```text
EcoVision AI/
├── frontend/                 # React.js application
│   ├── src/
│   │   ├── components/       # Reusable UI components (Navbar, Sidebar)
│   │   ├── pages/            # Page views (Home, Auth, Dashboard, etc.)
│   │   ├── App.jsx           # Main routing configuration
│   │   └── index.css         # Global styles & Tailwind config
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite bundler config
├── backend/                  # FastAPI server
│   ├── config/               # Database and environment configurations
│   ├── routes/               # API endpoint routers (auth, predict, dashboard)
│   ├── main.py               # Application entry point
│   └── requirements.txt      # Python dependencies
└── ai_model/                 # Deep Learning module
    └── classifier.py         # Image preprocessing and model inference logic
```

## Local Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- MongoDB instance (Local or Atlas)

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn main:app --reload --port 8000
```
*API will be running at: http://localhost:8000*
*Interactive API Docs (Swagger UI) available at: http://localhost:8000/docs*

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
*Frontend will be running at: http://localhost:5173*

## Deployment Instructions

### Frontend Deployment (Vercel)
1. Push the repository to GitHub.
2. Go to [Vercel](https://vercel.com/) and create a new project.
3. Import your GitHub repository.
4. Set the **Framework Preset** to `Vite`.
5. The **Build Command** should be `npm run build` and the **Output Directory** should be `dist`.
6. Add environment variables if any (e.g., `VITE_API_BASE_URL` pointing to your deployed Render backend).
7. Click **Deploy**.

### Backend Deployment (Render)
1. Go to [Render](https://render.com/) and create a new **Web Service**.
2. Connect your GitHub repository.
3. Choose **Python 3** as the environment.
4. Set the **Build Command** to `pip install -r backend/requirements.txt`.
5. Set the **Start Command** to `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`.
6. Add an Environment Variable for MongoDB connection:
   - Key: `MONGODB_URL`
   - Value: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/ecovision_db?retryWrites=true&w=majority`
7. Click **Create Web Service**.

### Database Deployment (MongoDB Atlas)
1. Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Build a new free-tier cluster.
3. In Network Access, add IP address `0.0.0.0/0` to allow connections from Render.
4. Under Database Access, create a database user and save the password.
5. Click **Connect** -> **Connect your application** and copy the connection string to use in your Backend Environment Variables.

## Future Scope

- Integration with real physical IoT sensors inside dustbins.
- Live GPS tracking of garbage trucks using Google Maps API.
- Training the AI model on a more extensive, localized dataset of waste images.
- Gamification system to reward users with "Green Points" for correctly recycling waste.

---
*Built as a final year AI/ML smart city project.*
