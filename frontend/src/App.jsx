import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import BottomNavbar from './components/BottomNavbar'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Classification from './pages/Classification'
import Dashboard from './pages/Dashboard'
import RouteOptimization from './pages/RouteOptimization'
import BinMonitoring from './pages/BinMonitoring'
import CommunityReport from './pages/CommunityReport'
import Rewards from './pages/Rewards'
import Forecasting from './pages/Forecasting'
import CCTV from './pages/CCTV'
import Marketplace from './pages/Marketplace'
import Fleet from './pages/Fleet'
import VoiceAssistant from './components/VoiceAssistant'
import { useState, useEffect } from 'react'
import { LanguageContext } from './context/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState("English");
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
        
        {/* Top Desktop Navigation */}
        <Navbar darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
        
        {/* Mobile-first Swipe Page Transitions */}
        <main className="pt-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="pb-24 md:pb-8" // Add padding to avoid overlapping the bottom navigation bar on mobile
            >
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/bins" element={<BinMonitoring />} />
                <Route path="/routes" element={<RouteOptimization />} />
                <Route path="/classify" element={<Classification />} />
                <Route path="/report" element={<CommunityReport />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/forecast" element={<Forecasting />} />
                <Route path="/cctv" element={<CCTV />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/fleet" element={<Fleet />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
        
        {/* Floating Futuristic Bottom Navigation Bar */}
        <BottomNavbar />

        {/* Global Interactive AI Voice Assistant */}
        <VoiceAssistant />

      </div>
    </LanguageContext.Provider>
  )
}

export default App
