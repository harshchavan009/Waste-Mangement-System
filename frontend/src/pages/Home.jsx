import { motion } from 'framer-motion';
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
