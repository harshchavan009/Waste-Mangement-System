import os

files = {
    "frontend/src/pages/Classification.jsx": """import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function Classification() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
      setResult(null); // reset result on new image
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    processFile(droppedFile);
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    
    // Mock API call to backend
    setTimeout(() => {
      const categories = ['Plastic', 'Metal', 'Glass', 'Organic', 'Paper', 'E-Waste'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const randomConfidence = (Math.random() * 20 + 80).toFixed(1); // 80-100%
      
      setResult({
        category: randomCategory,
        confidence: randomConfidence,
        instructions: `Please ensure this item is clean and place it in the ${randomCategory} recycling bin.`
      });
      setLoading(false);
    }, 2000);
  };

  const clearImage = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">AI Waste Classification</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">Upload an image of waste to instantly identify its category and recycling instructions.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="flex flex-col gap-4">
          <div 
            className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-700 hover:border-primary/50'} glassmorphism h-[400px] flex flex-col items-center justify-center relative`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {preview ? (
              <div className="relative w-full h-full rounded-2xl overflow-hidden group">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={clearImage} className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition shadow-lg">
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Drag & Drop Image</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">or click to browse from your device</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileInput}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-800 rounded-full font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition"
                >
                  Browse Files
                </button>
              </>
            )}
          </div>
          
          <button 
            onClick={handleAnalyze}
            disabled={!file || loading}
            className={`py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${!file ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-primary hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:-translate-y-1'}`}
          >
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImageIcon className="h-6 w-6" />}
            {loading ? 'Analyzing with AI...' : 'Analyze Waste'}
          </button>
        </div>

        {/* Results Section */}
        <div className="glassmorphism rounded-3xl p-8 h-[400px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-gray-500"
              >
                <div className="bg-gray-100 dark:bg-gray-800/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-10 w-10 text-gray-400" />
                </div>
                <p>Upload an image and click analyze to see results</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                </div>
                <p className="text-lg font-medium text-primary animate-pulse">Running CNN Inference...</p>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full mb-6">
                  <CheckCircle className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-3xl font-black mb-2">{result.category}</h2>
                <div className="inline-block px-4 py-1 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
                  <span className="text-sm font-semibold">Confidence: <span className="text-primary">{result.confidence}%</span></span>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 w-full text-left">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-secondary" />
                    Instructions
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{result.instructions}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
""",

    "frontend/src/pages/Dashboard.jsx": """import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Trash2, ArrowUpRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const monthlyData = [
  { name: 'Jan', processed: 4000, recycled: 2400 },
  { name: 'Feb', processed: 3000, recycled: 1398 },
  { name: 'Mar', processed: 2000, recycled: 9800 },
  { name: 'Apr', processed: 2780, recycled: 3908 },
  { name: 'May', processed: 1890, recycled: 4800 },
  { name: 'Jun', processed: 2390, recycled: 3800 },
];

const categoryData = [
  { name: 'Plastic', amount: 400 },
  { name: 'Paper', amount: 300 },
  { name: 'Glass', amount: 200 },
  { name: 'Organic', amount: 500 },
  { name: 'Metal', amount: 150 },
];

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Real-time smart city waste insights</p>
        </div>
        <button className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition">
          <Activity className="h-4 w-4" />
          Live Report
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: "Total Collected", value: "12,450 kg", trend: "+12.5%", color: "text-primary" },
          { title: "Active Smart Bins", value: "5,430", trend: "+3.2%", color: "text-secondary" },
          { title: "Recycling Efficiency", value: "78.4%", trend: "+5.1%", color: "text-emerald-400" }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 glassmorphism rounded-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className={`h-16 w-16 ${stat.color}`} />
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">{stat.title}</h3>
            <div className="text-4xl font-black mb-2">{stat.value}</div>
            <div className="flex items-center gap-1 text-sm text-emerald-500 font-medium">
              <ArrowUpRight className="h-4 w-4" />
              {stat.trend} from last month
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Collection Trend */}
        <div className="p-6 glassmorphism rounded-2xl border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold mb-6">Waste Processing Trends (6 Months)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '8px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="processed" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorProcessed)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 glassmorphism rounded-2xl border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold mb-6">Collection by Category</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.2} />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '8px', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
""",

    "frontend/src/pages/BinMonitoring.jsx": """import { useState, useEffect } from 'react';
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
""",

    "frontend/src/pages/RouteOptimization.jsx": """import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Truck, Navigation, Clock } from 'lucide-react';
import { Icon } from 'leaflet';

// Fix for default marker icons in react-leaflet
const binIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3299/3299935.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const truckIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2764/2764491.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const center = [40.7128, -74.0060]; // New York coordinates for demo

const routePath = [
  [40.7128, -74.0060],
  [40.7150, -74.0100],
  [40.7200, -74.0050],
  [40.7250, -73.9950],
  [40.7300, -73.9900]
];

export default function RouteOptimization() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">AI Route Optimization</h1>
          <p className="text-gray-500 dark:text-gray-400">Shortest paths calculated for active garbage trucks</p>
        </div>
        <div className="flex gap-4">
          <div className="glassmorphism px-4 py-2 rounded-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Estimated Saving: 2.5 Hrs</span>
          </div>
        </div>
      </div>

      <div className="flex-grow grid lg:grid-cols-4 gap-6 h-full pb-6">
        {/* Map Container */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden glassmorphism border border-gray-200 dark:border-gray-800 shadow-xl relative z-0">
          <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {routePath.map((pos, idx) => (
              <Marker key={idx} position={pos} icon={idx === 0 ? truckIcon : binIcon}>
                <Popup>
                  {idx === 0 ? 'Truck #42 (Active)' : `Collection Point ${idx}`}
                </Popup>
              </Marker>
            ))}
            <Polyline positions={routePath} color="#10b981" weight={5} opacity={0.8} dashArray="10, 10" />
          </MapContainer>
        </div>

        {/* Sidebar Info */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          <div className="p-5 glassmorphism rounded-2xl">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-secondary" />
              Active Fleet Status
            </h3>
            <div className="space-y-4">
              {[
                { id: 'Truck 42', status: 'On Route', progress: 45 },
                { id: 'Truck 18', status: 'Returning', progress: 90 },
                { id: 'Truck 07', status: 'Idle', progress: 0 },
              ].map((truck, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                  <div className="flex justify-between text-sm mb-1 font-semibold">
                    <span>{truck.id}</span>
                    <span className={truck.status === 'On Route' ? 'text-primary' : 'text-gray-500'}>{truck.status}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary" style={{ width: `${truck.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 glassmorphism rounded-2xl flex-grow">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Navigation className="h-5 w-5 text-primary" />
              Current Route Info
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-gray-500">Total Distance</span>
                <span className="font-bold">12.4 km</span>
              </div>
              <div className="flex justify-between text-sm border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-gray-500">Stops Remaining</span>
                <span className="font-bold">4 / 15</span>
              </div>
              <div className="flex justify-between text-sm border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-gray-500">Est. Completion</span>
                <span className="font-bold text-primary">14:30 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"""
}

for path, content in files.items():
    with open(path, 'w') as f:
        f.write(content)

print("Rest of frontend pages created.")
