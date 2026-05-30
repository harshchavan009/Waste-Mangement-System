import { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, CheckCircle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import SmartBin3D from '../components/SmartBin3D';

function VisualBin({ level, status }) {
  const isOverflow = level >= 80;
  
  // Dynamic color matching
  let fillColor = '#10b981'; // Good (Green)
  let glowColor = 'rgba(16, 185, 129, 0.4)';
  if (level >= 80) {
    fillColor = '#ef4444'; // Critical (Red)
    glowColor = 'rgba(239, 68, 68, 0.5)';
  } else if (level >= 50) {
    fillColor = '#f59e0b'; // Warning (Yellow)
    glowColor = 'rgba(245, 158, 11, 0.4)';
  }

  return (
    <div className="relative w-16 h-28 flex flex-col items-center justify-end">
      {/* Dynamic bouncing lid for critical overflow */}
      <div 
        className={`w-14 h-2 rounded-full mb-1 transition-all ${
          isOverflow ? 'bg-red-500 animate-bounce' : 'bg-slate-400 dark:bg-slate-600'
        }`}
        style={{
          boxShadow: isOverflow ? '0 0 10px #ef4444' : 'none'
        }}
      />
      
      {/* Outer transparent glass dustbin structure */}
      <div className="relative w-12 h-24 bg-slate-100 dark:bg-slate-800/80 border-2 border-slate-300 dark:border-slate-700 rounded-b-xl overflow-hidden shadow-inner flex flex-col justify-end">
        {/* Physical Waste Fill Layer */}
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: `${level}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 10 }}
          className="relative w-full rounded-b-lg overflow-hidden"
          style={{ 
            backgroundColor: fillColor,
            boxShadow: `inset 0 4px 10px rgba(255,255,255,0.2), 0 0 15px ${glowColor}`
          }}
        >
          {/* Animated wave sheen representing fluid waste load */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-white/20 animate-pulse" />
          
          {/* Internal bubbling scanning indicator inside waste */}
          {isOverflow && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-white/40 animate-ping" />
            </div>
          )}
        </motion.div>

        {/* Level overlay indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[10px] font-black text-slate-850 dark:text-slate-150 bg-white/50 dark:bg-black/45 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
            {level}%
          </span>
        </div>
      </div>

      {/* Overflow Alert Indicator */}
      {isOverflow && (
        <span className="absolute -top-3.5 text-[9px] text-red-500 animate-pulse font-black drop-shadow-[0_0_8px_#ef4444] uppercase tracking-wider">
          ⚠️ FULL
        </span>
      )}
    </div>
  );
}

export default function BinMonitoring() {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dispatchedBins, setDispatchedBins] = useState(new Set());

  // Fetch real-time data from IoT backend
  useEffect(() => {
    const fetchBins = async () => {
      try {
        const response = await fetch('/api/dashboard/bins');
        if (response.ok) {
          const data = await response.json();
          // Sort bins: critical first
          const sorted = data.sort((a, b) => b.level - a.level);
          setBins(sorted);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch bins:", error);
      }
    };

    fetchBins();
    const interval = setInterval(fetchBins, 3000); // Poll every 3 seconds for live IoT updates
    return () => clearInterval(interval);
  }, []);

  const handleDispatch = (binId) => {
    setDispatchedBins(prev => new Set(prev).add(binId));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'good': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-gray-500';
    }
  };

  const getProgressColor = (status) => {
    switch(status) {
      case 'critical': return 'bg-red-500 shadow-red-500/50';
      case 'warning': return 'bg-yellow-500 shadow-yellow-500/50';
      case 'good': return 'bg-primary shadow-emerald-500/50';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Smart Bin Monitoring
            <span className="flex h-3 w-3 relative ml-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Live IoT sensor data & AI predictive overflow analytics</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 text-sm rounded-full bg-red-500/10 text-red-500 font-medium border border-red-500/20 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4"/> {bins.filter(b => b.status === 'critical').length} Critical
          </span>
          <span className="px-3 py-1 text-sm rounded-full bg-yellow-500/10 text-yellow-500 font-medium border border-yellow-500/20">
            {bins.filter(b => b.status === 'warning').length} Warning
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Connecting to IoT Sensors...</div>
      ) : (
      <>
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            AI Vision System
            <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full animate-pulse uppercase tracking-widest">LIVE Feed</span>
          </h2>
          <SmartBin3D />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bins.map((bin) => (
          <motion.div 
            key={bin.id}
            layout
            className={`p-6 rounded-2xl glassmorphism border ${getStatusColor(bin.status).replace('text-', 'border-').replace('bg-', 'hover:bg-').split(' ')[2]} transition-all flex gap-4`}
          >
            {/* Left Hand Information Details */}
            <div className="flex-grow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${getStatusColor(bin.status).split(' ').slice(0,2).join(' ')}`}>
                    <Trash2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{bin.id}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" /> {bin.location}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-semibold text-gray-500">Fill Capacity</span>
                  <span className={`text-xl font-black ${getStatusColor(bin.status).split(' ')[0]}`}>{bin.level}%</span>
                </div>
                <div className="h-2 w-full bg-gray-250 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${bin.level}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full shadow-lg ${getProgressColor(bin.status)}`}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-150 dark:border-gray-800 flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Overflow ETA</span>
                {bin.predicted_overflow_hours < 2 ? (
                   <span className="text-red-500 font-black animate-pulse">&lt; {Math.max(0.1, bin.predicted_overflow_hours)} hours</span>
                ) : (
                   <span className="text-gray-700 dark:text-gray-300 font-black">~{bin.predicted_overflow_hours} hours</span>
                )}
              </div>

              <div className="mt-3 flex items-center gap-1.5">
                 <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 uppercase tracking-wider">
                   {bin.type}
                 </span>
              </div>

              {bin.status === 'critical' && (
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-bold bg-red-500/10 p-2 rounded-lg">
                    <AlertTriangle className="h-3.5 w-3.5" /> OVERFLOW THRESHOLD EXCEEDED
                  </div>
                  <button 
                    onClick={() => handleDispatch(bin.id)}
                    disabled={dispatchedBins.has(bin.id)}
                    className={`w-full py-2 text-white rounded-lg text-xs font-bold shadow-lg transition ${dispatchedBins.has(bin.id) ? 'bg-emerald-500 hover:bg-emerald-600 animate-pulse' : 'bg-red-500 hover:bg-red-600'}`}
                  >
                    {dispatchedBins.has(bin.id) ? 'Truck Dispatched! ✓' : 'Dispatch Collector'}
                  </button>
                </div>
              )}
            </div>

            {/* Right Hand Visual Fill Dustbin Indicator */}
            <div className="flex-shrink-0 flex items-center justify-center pl-2 border-l border-gray-150 dark:border-gray-800/40">
              <VisualBin level={bin.level} status={bin.status} />
            </div>
          </motion.div>
        ))}
      </div>
      </>
      )}
    </div>
  );
}
