import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
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
