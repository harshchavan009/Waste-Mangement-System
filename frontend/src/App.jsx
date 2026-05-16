import { Routes, Route } from 'react-router-dom'
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
