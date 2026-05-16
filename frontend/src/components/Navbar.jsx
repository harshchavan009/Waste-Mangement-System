import { Link } from 'react-router-dom';
import { Sun, Moon, Recycle, Menu, X, User } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ darkMode, toggleDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 glassmorphism">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Recycle className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl tracking-tight">EcoVision AI</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="hover:text-primary px-3 py-2 rounded-md font-medium transition-colors">Home</Link>
              <Link to="/classify" className="hover:text-primary px-3 py-2 rounded-md font-medium transition-colors">AI Classification</Link>
              <Link to="/dashboard" className="hover:text-primary px-3 py-2 rounded-md font-medium transition-colors">Dashboard</Link>
              <Link to="/bins" className="hover:text-primary px-3 py-2 rounded-md font-medium transition-colors">Smart Bins</Link>
              <Link to="/routes" className="hover:text-primary px-3 py-2 rounded-md font-medium transition-colors">Routes</Link>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link to="/auth" className="flex items-center gap-2 bg-primary hover:bg-emerald-600 text-white px-4 py-2 rounded-full font-medium transition-transform hover:scale-105 shadow-lg shadow-emerald-500/30">
              <User className="h-4 w-4" />
              Login
            </Link>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden glassmorphism"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium">Home</Link>
              <Link to="/classify" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium">AI Classification</Link>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium">Dashboard</Link>
              <Link to="/bins" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium">Smart Bins</Link>
              <Link to="/routes" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium">Routes</Link>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={toggleDarkMode} className="p-2">
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <Link to="/auth" onClick={() => setIsOpen(false)} className="bg-primary text-white px-4 py-2 rounded-md font-medium">Login</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
