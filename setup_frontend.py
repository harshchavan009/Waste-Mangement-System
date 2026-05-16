import os
import json

files = {
    "frontend/package.json": json.dumps({
        "name": "frontend",
        "private": True,
        "version": "0.0.0",
        "type": "module",
        "scripts": {
            "dev": "vite",
            "build": "vite build",
            "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
            "preview": "vite preview"
        },
        "dependencies": {
            "axios": "^1.6.0",
            "framer-motion": "^10.16.4",
            "lucide-react": "^0.292.0",
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-router-dom": "^6.18.0",
            "recharts": "^2.9.0",
            "react-leaflet": "^4.2.1",
            "leaflet": "^1.9.4"
        },
        "devDependencies": {
            "@types/react": "^18.2.15",
            "@types/react-dom": "^18.2.7",
            "@vitejs/plugin-react": "^4.0.3",
            "autoprefixer": "^10.4.16",
            "eslint": "^8.45.0",
            "eslint-plugin-react": "^7.32.2",
            "eslint-plugin-react-hooks": "^4.6.0",
            "eslint-plugin-react-refresh": "^0.4.3",
            "postcss": "^8.4.31",
            "tailwindcss": "^3.3.5",
            "vite": "^4.4.5"
        }
    }, indent=2),

    "frontend/vite.config.js": """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
""",

    "frontend/tailwind.config.js": """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#10b981', // Emerald 500
        secondary: '#3b82f6', // Blue 500
        dark: '#0f172a', // Slate 900
        darker: '#020617', // Slate 950
      }
    },
  },
  plugins: [],
}
""",

    "frontend/postcss.config.js": """export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
""",

    "frontend/index.html": """<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EcoVision AI - Smart Waste Management</title>
    <!-- Leaflet CSS for Map -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
  </head>
  <body class="bg-gray-50 dark:bg-darker text-gray-900 dark:text-gray-100 transition-colors duration-300">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
""",

    "frontend/src/index.css": """@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .glassmorphism {
    @apply bg-white bg-opacity-70 backdrop-blur-lg border border-white border-opacity-20 shadow-lg dark:bg-dark dark:bg-opacity-70 dark:border-gray-800;
  }
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #10b981;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #059669;
}
""",

    "frontend/src/main.jsx": """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
""",

    "frontend/src/App.jsx": """import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Classification from './pages/Classification'
import Dashboard from './pages/Dashboard'
import RouteOptimization from './pages/RouteOptimization'
import BinMonitoring from './pages/BinMonitoring'
import { useState, useEffect } from 'react'

function App() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-grow pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/classify" element={<Classification />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/routes" element={<RouteOptimization />} />
          <Route path="/bins" element={<BinMonitoring />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
"""
}

for path, content in files.items():
    with open(path, 'w') as f:
        f.write(content)

print("Frontend setup files created.")
