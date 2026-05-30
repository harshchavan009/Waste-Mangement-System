import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Leaf, Zap, BarChart3, ShieldCheck, Recycle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Earth3D from '../components/Earth3D';
import EcoParticles from '../components/EcoParticles';
import ThreeDRecyclingIcon from '../components/ThreeDRecyclingIcon';

// Premium 3D Interactive Card carrying Volumetric Depth and Specular Sheen
function TiltCard({ children, style, className }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [sheenPos, setSheenPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    // Subtle 3D tilt limit (max 10 degrees)
    const degX = -(y / (box.height / 2)) * 10;
    const degY = (x / (box.width / 2)) * 10;

    setRotateX(degX);
    setRotateY(degY);

    // Track specular sheen coordinates
    const sheenX = ((e.clientX - box.left) / box.width) * 100;
    const sheenY = ((e.clientY - box.top) / box.height) * 100;
    setSheenPos({ x: sheenX, y: sheenY });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      style={{
        ...style,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      animate={{
        rotateX: rotateX,
        rotateY: rotateY
      }}
      transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-all duration-200 ease-out group relative ${className}`}
    >
      {/* Specular light reflectivity sheen layer */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl"
        style={{
          background: `radial-gradient(circle at ${sheenPos.x}% ${sheenPos.y}%, rgba(255,255,255,0.06), transparent 50%)`,
          transform: 'translateZ(1px)'
        }}
      />
      {children}
    </motion.div>
  );
}

export default function Home() {
  const { scrollY } = useScroll();

  // 1. Hero Left Text Parallax
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 450], [1, 0]);

  // 2. 3D Globe Parallax
  const globeY = useTransform(scrollY, [0, 500], [0, 60]);
  const globeScale = useTransform(scrollY, [0, 500], [1, 0.93]);

  // 3. Background Neon Blobs Parallax
  const bg1Y = useTransform(scrollY, [0, 1200], [0, 160]);
  const bg2Y = useTransform(scrollY, [0, 1200], [0, -160]);

  // 4. Stats cards parallax
  const statsY = useTransform(scrollY, [100, 900], [50, -40]);

  // 5. Individual Feature Card staggered depth parallax (scroll offsets)
  const feature1Y = useTransform(scrollY, [500, 1500], [70, -70]);
  const feature2Y = useTransform(scrollY, [500, 1500], [110, -30]);
  const feature3Y = useTransform(scrollY, [500, 1500], [50, -90]);

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
    <div className="relative overflow-hidden bg-[#070b19]">
      {/* Interactive Eco-themed AI Floating Particles Background */}
      <EcoParticles />

      {/* Parallax Background Glow Decorations */}
      <motion.div 
        style={{ y: bg1Y }}
        className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-primary/10 blur-[130px] pointer-events-none" 
      />
      <motion.div 
        style={{ y: bg2Y }}
        className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-secondary/10 blur-[130px] pointer-events-none" 
      />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Hand Parallax Text Section */}
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="text-center lg:text-left">
            <motion.h1 
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-300 animate-pulse"
            >
              AI-Powered Waste Management
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-4 text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0 font-semibold"
            >
              Building smarter, greener cities with state-of-the-art computer vision, real-time IoT tracking, and optimized logistics.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/classify" className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/40 hover:-translate-y-1">
                <Zap className="h-5 w-5" />
                Upload Waste Image
              </Link>
              <Link to="/dashboard" className="flex items-center justify-center gap-2 px-8 py-4 glassmorphism text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all hover:-translate-y-1">
                <BarChart3 className="h-5 w-5" />
                Live Dashboard
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Right Hand Parallax 3D Globe Section */}
          <motion.div
            style={{ y: globeY, scale: globeScale }}
            className="relative w-full h-full flex items-center justify-center min-h-[400px] md:min-h-[600px] z-10"
          >
            {/* Soft backdrop glow behind the globe */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
            <Earth3D />
          </motion.div>
        </div>
      </div>

      {/* Stats Section with Smooth Floating Parallax */}
      <motion.div 
        style={{ y: statsY }}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10"
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
              <div className="text-sm md:text-base text-gray-400 font-bold uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 3D Recycling Icons Showcase Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center mb-16">
          <span className="text-xs font-mono text-cyan-400 font-black tracking-widest uppercase">Procedural Classification</span>
          <h2 className="text-3xl md:text-5xl font-black text-white mt-1">Interactive 3D Waste Catalog</h2>
          <p className="text-base text-gray-400 mt-2 font-semibold">Procedural 3D assets generated in real-time by the EcoVision Edge-AI engine. Hover elements to spin!</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { type: 'leaf', name: 'Organic Leaf', desc: 'Compostable foliage & raw garden bio-waste.', yield: 'Recycling: 98%' },
            { type: 'bottle', name: 'Plastic Bottle', desc: 'High-density transparent PET polymers.', yield: 'Recycling: 92%' },
            { type: 'can', name: 'Metal Can', desc: 'Highly recyclable grade-A aluminium alloy.', yield: 'Recycling: 96%' },
            { type: 'paper', name: 'Recycled Paper', desc: 'Fibreboard & dynamic mixed paper stock.', yield: 'Recycling: 90%' },
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -8 }}
              className="p-6 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.35)] hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(16,185,129,0.12)] transition-all duration-300 text-center relative overflow-hidden group"
            >
              {/* Dynamic light reflect bar */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Animated 3D WebGL Icon */}
              <ThreeDRecyclingIcon type={item.type} />
              
              <h3 className="text-xl font-extrabold text-white mt-4">{item.name}</h3>
              <p className="text-xs text-gray-400 font-semibold mt-2 px-2 leading-relaxed">{item.desc}</p>
              
              <div className="mt-5 inline-block text-[10px] font-bold font-mono px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full shadow-inner">
                {item.yield}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features Section with staggered 3D multi-layered parallax cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="text-center mb-20">
          <span className="text-xs font-mono text-cyan-400 font-black tracking-widest uppercase">Intelligent Grid</span>
          <h2 className="text-3xl md:text-5xl font-black text-white mt-1">Smart Features</h2>
          <p className="text-base text-gray-400 mt-2 font-semibold">Next-generation ecological automation at scale</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1: AI Classification */}
          <TiltCard 
            style={{ y: feature1Y }}
            className="p-8 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] transition-all duration-300 relative overflow-hidden"
          >
            <div 
              style={{ transform: 'translateZ(45px)' }}
              className="mb-6 p-4 bg-emerald-500/10 rounded-2xl inline-block group-hover:scale-110 transition-all border border-emerald-500/20 shadow-lg"
            >
              <Leaf className="h-8 w-8 text-primary" />
            </div>
            <h3 
              style={{ transform: 'translateZ(30px)' }}
              className="text-2xl font-bold mb-3 text-white transition-transform"
            >
              AI Classification
            </h3>
            <p 
              style={{ transform: 'translateZ(20px)' }}
              className="text-gray-400 leading-relaxed font-semibold text-sm transition-transform"
            >
              Instantly categorize waste using advanced convolutional deep learning models at edge bins.
            </p>
          </TiltCard>

          {/* Card 2: Smart Bin IoT */}
          <TiltCard 
            style={{ y: feature2Y }}
            className="p-8 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_rgba(6,182,212,0.15)] transition-all duration-300 relative overflow-hidden"
          >
            <div 
              style={{ transform: 'translateZ(45px)' }}
              className="mb-6 p-4 bg-cyan-500/10 rounded-2xl inline-block group-hover:scale-110 transition-all border border-cyan-500/20 shadow-lg"
            >
              <ShieldCheck className="h-8 w-8 text-secondary" />
            </div>
            <h3 
              style={{ transform: 'translateZ(30px)' }}
              className="text-2xl font-bold mb-3 text-white transition-transform"
            >
              Smart Bin IoT
            </h3>
            <p 
              style={{ transform: 'translateZ(20px)' }}
              className="text-gray-400 leading-relaxed font-semibold text-sm transition-transform"
            >
              Real-time monitoring of bin levels with automated predictive fill alerts and dynamic pickup dispatches.
            </p>
          </TiltCard>

          {/* Card 3: Route Optimization */}
          <TiltCard 
            style={{ y: feature3Y }}
            className="p-8 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_rgba(234,179,8,0.12)] transition-all duration-300 relative overflow-hidden"
          >
            <div 
              style={{ transform: 'translateZ(45px)' }}
              className="mb-6 p-4 bg-yellow-500/10 rounded-2xl inline-block group-hover:scale-110 transition-all border border-yellow-500/20 shadow-lg"
            >
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
            <h3 
              style={{ transform: 'translateZ(30px)' }}
              className="text-2xl font-bold mb-3 text-white transition-transform"
            >
              Route Optimization
            </h3>
            <p 
              style={{ transform: 'translateZ(20px)' }}
              className="text-gray-400 leading-relaxed font-semibold text-sm transition-transform"
            >
              AI-calculated shortest collection tracks for garbage fleets, minimizing fuel burn and carbon offsets.
            </p>
          </TiltCard>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-20 relative z-10 bg-black/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Recycle className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-white">EcoVision AI</span>
          </div>
          <p className="text-gray-500 text-sm font-semibold">© 2026 EcoVision AI Project. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
