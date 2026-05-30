import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Activity, ArrowUpRight, TrendingUp, RefreshCw, MessageSquare, Smile, Frown, Meh, Users, Box, Map, Clock, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CityWaste3D from '../components/CityWaste3D';
import EnvironmentalImpact3D from '../components/EnvironmentalImpact3D';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [volumetric, setVolumetric] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('2d'); // '2d', '3d', or 'impact'
  const [dayIndex, setDayIndex] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    const fetchSentiment = async () => {
      try {
        const res = await fetch('/api/citizen/sentiment');
        if (res.ok) {
          const data = await res.json();
          setSentiment(data);
        }
      } catch (err) {
        console.error("Failed to fetch sentiment:", err);
      }
    };

    const fetchVolumetric = async () => {
       try {
         const res = await fetch('/api/city/volumetric');
         if (res.ok) {
           const data = await res.json();
           setVolumetric(data);
         }
       } catch (err) {
         console.error("Failed to fetch volumetric data:", err);
       }
    };

    fetchStats();
    fetchSentiment();
    fetchVolumetric();
    // Poll every 5 seconds for real-time graphs
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-gray-500 flex flex-col items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p>Loading Live Analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Analytics Dashboard
            <span className="flex h-3 w-3 relative ml-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Real-time smart city waste insights</p>
        </div>
        
        {/* VIEW MODE TABS: 2D, 3D City, or 3D Environmental Impact */}
        <div className="flex gap-1.5 bg-gray-100 dark:bg-gray-800/80 p-1 rounded-2xl self-start sm:self-auto shadow-inner border border-gray-200/20">
          <button 
            onClick={() => setViewMode('2d')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${viewMode === '2d' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <Map className="h-3.5 w-3.5" /> 2D ANALYTICS
          </button>
          <button 
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${viewMode === '3d' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <Box className="h-3.5 w-3.5" /> 3D CITY VIEW
          </button>
          <button 
            onClick={() => setViewMode('impact')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${viewMode === 'impact' ? 'bg-white dark:bg-gray-700 shadow text-emerald-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <Leaf className="h-3.5 w-3.5" /> 3D ECO IMPACT
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Daily Waste Collected", value: `${stats.total_collected_kg.toLocaleString()} kg`, trend: "+12.5%", color: "text-primary" },
          { title: "Active Smart Bins", value: stats.active_bins.toString(), trend: "+3.2%", color: "text-secondary" },
          { title: "Recyclable Percentage", value: `${stats.recycling_efficiency}%`, trend: "+5.1%", color: "text-emerald-400" },
          { title: "Carbon Reduction", value: `${stats.carbon_saved_tons} Tons`, trend: "+8.4%", color: "text-yellow-500" }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 glassmorphism rounded-2xl relative overflow-hidden group border border-gray-200 dark:border-gray-800"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className={`h-16 w-16 ${stat.color}`} />
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">{stat.title}</h3>
            <div className="text-3xl font-black mb-2">{stat.value}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
              <ArrowUpRight className="h-3 w-3" />
              {stat.trend} this week
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts / 3D View / 3D Environmental Impact Section */}
      <AnimatePresence mode="wait">
        {viewMode === '2d' ? (
          <motion.div 
            key="2d-charts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid lg:grid-cols-3 gap-8 mb-8"
          >
            {/* Daily Waste Processing Trends */}
            <div className="lg:col-span-2 p-6 glassmorphism rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Daily Waste Collected (Last 7 Days)</h3>
                <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full animate-pulse">LIVE</span>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.daily_waste}>
                    <defs>
                      <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRecycled" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '8px', border: 'none', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" name="Total Collected (kg)" dataKey="processed" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorProcessed)" />
                    <Area type="monotone" name="Recycled (kg)" dataKey="recycled" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRecycled)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Area-wise Waste Statistics */}
            <div className="p-6 glassmorphism rounded-2xl border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold mb-2">Area-wise Waste Statistics</h3>
              <p className="text-xs text-gray-500 mb-4">Volume generated per city sector</p>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.area_stats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={1500}
                    >
                      {stats.area_stats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '8px', border: 'none', color: '#fff' }}
                      formatter={(value) => [`${value} kg`, 'Volume']}
                    />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        ) : viewMode === '3d' ? (
          <motion.div 
            key="3d-city"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="mb-8 relative"
          >
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-2xl h-[550px] relative">
               <CityWaste3D data={volumetric?.sectors} dayIndex={dayIndex} />
               
               {/* Time Travel Slider Overlay */}
               <div className="absolute bottom-6 left-6 right-6 flex items-center gap-6 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3 text-white">
                     <Clock className="h-5 w-5 text-primary" />
                     <span className="text-sm font-bold font-mono uppercase tracking-tighter w-24">Time Travel</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="30" 
                    value={dayIndex} 
                    onChange={(e) => setDayIndex(parseInt(e.target.value))}
                    className="flex-1 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary"
                  />
                  <div className="text-xs font-black text-white bg-primary px-3 py-1 rounded-full w-24 text-center">
                    T + {dayIndex} DAYS
                  </div>
               </div>
            </div>

            {/* AI Analysis Overlay */}
            <div className="absolute top-6 left-6 pointer-events-none space-y-2">
               <div className="bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-2 text-[10px] font-bold text-emerald-400">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  AI_FORECAST_MODE_ACTIVE
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="3d-impact"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="mb-8"
          >
            <EnvironmentalImpact3D />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Citizen Sentiment & Social Feed */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sentiment Gauge Card */}
        <div className="p-6 glassmorphism rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
           <div>
             <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
               <Users className="h-5 w-5 text-primary" />
               Citizen Happiness Index
             </h3>
             <p className="text-xs text-gray-500 mb-6">AI-analyzed sentiment from social feeds</p>
           </div>
           
           <div className="relative flex items-center justify-center py-4">
              <svg className="w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-gray-100 dark:text-gray-800"
                />
                <motion.circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray="502.4"
                  initial={{ strokeDashoffset: 502.4 }}
                  animate={{ strokeDashoffset: 502.4 - (502.4 * (sentiment?.happiness_index || 0) / 100) }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  strokeLinecap="round"
                  className={sentiment?.happiness_index > 70 ? 'text-emerald-500' : sentiment?.happiness_index > 40 ? 'text-yellow-500' : 'text-red-500'}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black">{sentiment?.happiness_index}%</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">HAPPINESS</span>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-2 mt-6">
              <div className="text-center">
                <Smile className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
                <div className="text-[10px] font-bold">POS</div>
              </div>
              <div className="text-center">
                <Meh className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                <div className="text-[10px] font-bold">NEU</div>
              </div>
              <div className="text-center">
                <Frown className="h-5 w-5 mx-auto mb-1 text-red-500" />
                <div className="text-[10px] font-bold">NEG</div>
              </div>
           </div>
        </div>

        {/* Live Social Feed */}
        <div className="lg:col-span-2 p-6 glassmorphism rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Live Citizen Feedback Hub
            </h3>
            <div className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-tighter">
              Trending: {sentiment?.trending}
            </div>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
            <AnimatePresence>
              {sentiment?.tweets.map((tweet, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-1 h-full ${tweet.score > 0.5 ? 'bg-emerald-500' : tweet.score > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-black text-sm text-primary">{tweet.user}</span>
                    <span className="text-[10px] font-mono text-gray-500">Just Now</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">"{tweet.text}"</p>
                  <div className="mt-3 flex items-center gap-2">
                     <div className="flex-1 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                           className={`h-full ${tweet.score > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                           style={{ width: `${Math.abs(tweet.score) * 100}%` }}
                        ></div>
                     </div>
                     <span className="text-[10px] font-bold text-gray-400">AI_SENTIMENT: {(tweet.score * 100).toFixed(0)}%</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
