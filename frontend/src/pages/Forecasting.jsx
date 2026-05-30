import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import { Brain, CloudRain, Sun, Users, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Forecasting() {
  const [data, setData] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulation Variables
  const [festival, setFestival] = useState(false);
  const [weather, setWeather] = useState('clear');
  const [populationFactor, setPopulationFactor] = useState(1.0);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          festival,
          weather,
          population_factor: populationFactor
        })
      });
      const json = await res.json();
      if (json.success) {
        setData(json.forecast);
        setMetrics(json.metrics);
      }
    } catch (error) {
      console.error("Failed to fetch forecast", error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever variables change
  useEffect(() => {
    fetchForecast();
  }, [festival, weather, populationFactor]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
          <p className="font-bold mb-2">{label}</p>
          {payload.map((entry, idx) => (
            <p key={idx} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: <span className="font-bold">{entry.value} Tons</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            AI Waste Forecasting
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Predictive time-series modeling for smart city resource allocation.</p>
        </div>
        
        {/* Status Indicators */}
        <div className="flex gap-4">
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <div className="text-sm">
              <div className="text-gray-500 text-xs font-bold uppercase">Peak Prediction</div>
              <div className="font-bold">{metrics?.peak_prediction || '--'} Tons</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* UI Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glassmorphism rounded-3xl p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">Simulation Variables</h3>
            
            <div className="space-y-6">
              {/* Event Toggle */}
              <div>
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <Calendar className={`h-5 w-5 ${festival ? 'text-primary' : 'text-gray-400'}`} />
                    <span className="font-medium text-sm">Upcoming Festival</span>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${festival ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}>
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${festival ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                  <input type="checkbox" className="hidden" checked={festival} onChange={(e) => setFestival(e.target.checked)} />
                </label>
                <p className="text-xs text-gray-500 mt-1 pl-7">Simulates a massive spike in plastic and packaging waste.</p>
              </div>

              {/* Weather Dropdown */}
              <div>
                <label className="flex items-center gap-2 font-medium text-sm mb-2">
                  {weather === 'rain' ? <CloudRain className="h-5 w-5 text-blue-500" /> : <Sun className="h-5 w-5 text-yellow-500" />}
                  Weather Condition
                </label>
                <select 
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                >
                  <option value="clear">Clear Skies</option>
                  <option value="rain">Heavy Rain / Monsoon</option>
                  <option value="heat">Heatwave</option>
                </select>
                <p className="text-xs text-gray-500 mt-1 pl-7">Rain slows collection; Heat increases organic decay mass.</p>
              </div>

              {/* Population Slider */}
              <div>
                <label className="flex items-center gap-2 font-medium text-sm mb-2">
                  <Users className="h-5 w-5 text-indigo-500" />
                  Population Density Factor
                </label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2.0" 
                    step="0.1" 
                    value={populationFactor}
                    onChange={(e) => setPopulationFactor(parseFloat(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-sm font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded-md">
                    {populationFactor}x
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-800 dark:text-yellow-500 leading-relaxed">
                <strong className="block mb-1">AI Insight</strong>
                Modifying these variables re-calculates the entire mathematical time-series instantly. Notice how "Festivals" create sharp demand spikes that require preemptive truck routing.
              </p>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="lg:col-span-3 glassmorphism rounded-3xl p-6 border border-gray-200 dark:border-gray-800 min-h-[500px] flex flex-col relative">
          {loading && (
            <div className="absolute inset-0 z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex items-center justify-center rounded-3xl">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="font-bold">Calculating Prediction Matrix...</span>
              </div>
            </div>
          )}
          
          <h3 className="text-lg font-bold mb-6">30-Day Generation Trend (Tons)</h3>
          
          <div className="flex-1 w-full h-full min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-200 dark:text-gray-800" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'currentColor' }} 
                  className="text-gray-500 text-xs" 
                  tickMargin={10}
                />
                <YAxis 
                  tick={{ fill: 'currentColor' }} 
                  className="text-gray-500 text-xs"
                  tickFormatter={(val) => `${val}t`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                
                {/* Visual separator for "Today" */}
                {data.length > 0 && (
                  <ReferenceArea x1={data[13]?.date} x2={data[14]?.date} strokeOpacity={0.3} fill="currentColor" className="text-primary/10" />
                )}
                
                <Line 
                  type="monotone" 
                  dataKey="historical" 
                  name="Historical Data" 
                  stroke="#94a3b8" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  name="AI Prediction" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
