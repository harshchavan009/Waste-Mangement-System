import { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, CheckCircle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BinMonitoring() {
  const [bins, setBins] = useState([
    { id: 'BIN-101', location: 'Downtown Square', level: 85, status: 'critical', type: 'General' },
    { id: 'BIN-102', location: 'Central Park', level: 45, status: 'warning', type: 'Recycling' },
    { id: 'BIN-103', location: 'Main Station', level: 92, status: 'critical', type: 'General' },
    { id: 'BIN-104', location: 'University Campus', level: 15, status: 'good', type: 'Paper' },
    { id: 'BIN-105', location: 'Shopping Mall', level: 60, status: 'warning', type: 'Plastic' },
    { id: 'BIN-106', location: 'Hospital Area', level: 5, status: 'good', type: 'Biohazard' },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBins(prev => prev.map(bin => {
        // Randomly increase bin level slightly
        const newLevel = Math.min(100, bin.level + Math.floor(Math.random() * 3));
        let status = 'good';
        if (newLevel > 80) status = 'critical';
        else if (newLevel > 50) status = 'warning';
        return { ...bin, level: newLevel, status };
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
          <h1 className="text-3xl font-bold">Smart Bin Monitoring</h1>
          <p className="text-gray-500 dark:text-gray-400">Live IoT sensor data from city dustbins</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 text-sm rounded-full bg-red-500/10 text-red-500 font-medium border border-red-500/20 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> 2 Critical</span>
          <span className="px-3 py-1 text-sm rounded-full bg-yellow-500/10 text-yellow-500 font-medium border border-yellow-500/20">2 Warning</span>
          <span className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary font-medium border border-primary/20">2 Good</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bins.map((bin) => (
          <motion.div 
            key={bin.id}
            layout
            className={`p-6 rounded-2xl glassmorphism border ${getStatusColor(bin.status).replace('text-', 'border-').replace('bg-', 'hover:bg-').split(' ')[2]} transition-all`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${getStatusColor(bin.status).split(' ').slice(0,2).join(' ')}`}>
                  <Trash2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{bin.id}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {bin.location}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 uppercase">
                {bin.type}
              </span>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Fill Level</span>
                <span className={`text-2xl font-black ${getStatusColor(bin.status).split(' ')[0]}`}>{bin.level}%</span>
              </div>
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${bin.level}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full rounded-full shadow-lg ${getProgressColor(bin.status)}`}
                />
              </div>
            </div>

            {bin.status === 'critical' && (
              <div className="mt-4 flex items-center gap-2 text-red-500 text-sm font-medium bg-red-500/10 p-2 rounded-lg">
                <AlertTriangle className="h-4 w-4" /> Schedule immediate pickup
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
