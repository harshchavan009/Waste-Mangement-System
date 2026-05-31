import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
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
import { useState, useEffect, useContext } from 'react'
import { LanguageContext } from './context/LanguageContext'
import { AuthProvider, AuthContext } from './context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/auth" replace />;
}

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

  const isAuthPage = location.pathname === '/auth';

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <AuthProvider>
        <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
          
          {/* Top Desktop Navigation — hidden on auth/login page */}
          {!isAuthPage && <Navbar darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />}
          
          {/* Mobile-first Swipe Page Transitions */}
          <main className={isAuthPage ? '' : 'pt-16'}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                className={isAuthPage ? '' : 'pb-24 md:pb-8'}
              >
                <Routes location={location}>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/bins" element={<ProtectedRoute><BinMonitoring /></ProtectedRoute>} />
                  <Route path="/routes" element={<ProtectedRoute><RouteOptimization /></ProtectedRoute>} />
                  <Route path="/classify" element={<ProtectedRoute><Classification /></ProtectedRoute>} />
                  <Route path="/report" element={<ProtectedRoute><CommunityReport /></ProtectedRoute>} />
                  <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
                  <Route path="/forecast" element={<ProtectedRoute><Forecasting /></ProtectedRoute>} />
                  <Route path="/cctv" element={<ProtectedRoute><CCTV /></ProtectedRoute>} />
                  <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
                  <Route path="/fleet" element={<ProtectedRoute><Fleet /></ProtectedRoute>} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>
          
          {/* Floating Futuristic Bottom Navigation Bar — hidden on auth/login page */}
          {!isAuthPage && <BottomNavbar />}

          {/* Global Interactive AI Voice Assistant — hidden on auth/login page */}
          {!isAuthPage && <VoiceAssistant />}

        </div>
      </AuthProvider>
    </LanguageContext.Provider>
  )
}

export default App
