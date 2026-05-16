import os

files = {
    "frontend/src/components/Navbar.jsx": """import { Link } from 'react-router-dom';
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
""",

    "frontend/src/pages/Home.jsx": """import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Zap, BarChart3, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-300"
        >
          AI-Powered Waste Management
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-4 text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10"
        >
          Building smarter, greener cities with state-of-the-art computer vision, real-time IoT tracking, and optimized logistics.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/classify" className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/40 hover:-translate-y-1">
            <Zap className="h-5 w-5" />
            Upload Waste Image
          </Link>
          <Link to="/dashboard" className="flex items-center justify-center gap-2 px-8 py-4 glassmorphism text-gray-900 dark:text-white rounded-full font-bold text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:-translate-y-1">
            <BarChart3 className="h-5 w-5" />
            Live Dashboard
          </Link>
        </motion.div>
      </div>

      {/* Stats Section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Total Waste Processed', value: '1.2M kg' },
            { label: 'Recycling Rate', value: '78%' },
            { label: 'Active Smart Bins', value: '5,430' },
            { label: 'Carbon Saved', value: '850 Tons' },
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants} className="text-center p-6 glassmorphism rounded-2xl border-t-2 border-primary/50">
              <div className="text-3xl md:text-4xl font-black text-primary mb-2">{stat.value}</div>
              <div className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Smart Features</h2>
          <p className="text-xl text-gray-500 dark:text-gray-400">Everything you need for next-gen waste management</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {[
            { icon: <Leaf className="h-8 w-8 text-primary" />, title: 'AI Classification', desc: 'Instantly categorize waste using advanced CNN deep learning models.' },
            { icon: <ShieldCheck className="h-8 w-8 text-secondary" />, title: 'Smart Bin IoT', desc: 'Real-time monitoring of bin fill levels to prevent overflow.' },
            { icon: <Zap className="h-8 w-8 text-yellow-500" />, title: 'Route Optimization', desc: 'AI-calculated shortest paths for garbage trucks saving time and fuel.' },
          ].map((feature, i) => (
            <motion.div key={i} variants={itemVariants} className="p-8 rounded-3xl glassmorphism hover:bg-white/40 dark:hover:bg-dark/40 transition-colors group">
              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl inline-block group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Recycle className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">EcoVision AI</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400">© 2026 EcoVision AI Project. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
""",

    "frontend/src/pages/Auth.jsx": """import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glassmorphism rounded-3xl p-8 relative z-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {isLogin ? 'Enter your details to access your dashboard' : 'Join the smart waste management revolution'}
          </p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input 
                type="text" 
                placeholder="Full Name" 
                className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          <button className="w-full bg-primary hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-primary/30">
            {isLogin ? 'Sign In' : 'Sign Up'}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
"""
}

for path, content in files.items():
    with open(path, 'w') as f:
        f.write(content)

print("Navbar, Home, Auth created.")
