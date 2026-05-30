import { useState, useEffect } from 'react';
import { Video, AlertTriangle, ShieldCheck, Camera, Maximize2, Radio, FileText, Gavel, Hash, MapPin, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CCTV() {
  const [alerts, setAlerts] = useState([
    { id: 1, time: '10:30 AM', cam: 'CAM 1', type: 'Overflowing Bin', severity: 'high' },
    { id: 2, time: '10:15 AM', cam: 'CAM 3', type: 'Illegal Dumping', severity: 'critical' },
    { id: 3, time: '09:45 AM', cam: 'CAM 2', type: 'Littering Detected', severity: 'medium' },
  ]);

  const [activeCam, setActiveCam] = useState(null);
  const [citation, setCitation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Add random alerts over time to simulate live monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const types = ['Littering Detected', 'Overflowing Bin', 'Suspicious Activity'];
      const newAlert = {
        id: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cam: `CAM ${Math.floor(Math.random() * 3) + 1}`,
        type: types[Math.floor(Math.random() * types.length)],
        severity: Math.random() > 0.8 ? 'critical' : Math.random() > 0.4 ? 'high' : 'medium'
      };
      
      setAlerts(prev => [newAlert, ...prev].slice(0, 15));
    }, 15000); // New alert every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const cameras = [
    { id: '1', name: 'Downtown Square', status: 'Active (YOLOv8)' },
    { id: '2', name: 'Central Park West', status: 'Active (YOLOv8)' },
    { id: '3', name: 'Industrial Zone B', status: 'Active (YOLOv8)' },
    { id: '4', name: 'Residential Block 4', status: 'Active (Monitoring)' }
  ];

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6 flex justify-between items-end flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-red-500" />
            Security Operations Center
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Live CCTV YOLO Object Detection for waste anomalies.</p>
        </div>
        <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-full font-bold text-sm animate-pulse">
          <Radio className="h-4 w-4" />
          LIVE SURVEILLANCE
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        
        {/* Multi-Camera Grid */}
        <div className="lg:col-span-3 grid grid-cols-2 gap-4 h-full">
          {cameras.map((cam) => (
            <motion.div 
              key={cam.id}
              layoutId={`cam-${cam.id}`}
              className={`relative bg-black rounded-2xl overflow-hidden border border-gray-800 group ${activeCam === cam.id ? 'fixed inset-4 z-50 col-span-2 row-span-2' : ''}`}
            >
              {/* The actual MJPEG stream from Flask */}
              <img 
                src={`/api/cctv/stream/${cam.id}`} 
                alt={`Camera ${cam.id}`}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay UI */}
              <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none flex justify-between items-start">
                <div>
                  <div className="text-white font-mono text-sm flex items-center gap-2">
                    <Camera className="h-4 w-4 text-red-500" />
                    CAM {cam.id} - {cam.name}
                  </div>
                  <div className="text-emerald-400 text-xs font-mono mt-1">{cam.status}</div>
                </div>
              </div>

              {/* Expand Button */}
              <button 
                onClick={() => setActiveCam(activeCam === cam.id ? null : cam.id)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-white/20 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
              >
                <Maximize2 className="h-5 w-5" />
              </button>

              {/* Scanline Effect */}
              <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'linear-gradient(transparent 50%, rgba(0, 0, 0, 0.5) 50%)', backgroundSize: '100% 4px' }}></div>
            </motion.div>
          ))}

          {/* Backdrop when camera is maximized */}
          <AnimatePresence>
            {activeCam && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveCam(null)}
                className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Live Alert Feed */}
        <div className="glassmorphism rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <h2 className="font-bold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              AI Detection Logs
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            <AnimatePresence>
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-mono text-gray-500">{alert.time}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      alert.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-gray-800 dark:text-gray-200">{alert.type}</div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Video className="h-3 w-3" /> {alert.cam}
                    </div>
                    {alert.type === 'Illegal Dumping' && (
                      <button 
                        onClick={async () => {
                          setLoading(true);
                          const res = await fetch('/api/cctv/citation', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ cam: alert.cam, offense: alert.type })
                          });
                          const data = await res.json();
                          setCitation(data.citation);
                          setLoading(false);
                        }}
                        className="text-[10px] bg-red-500 hover:bg-red-600 text-white px-2 py-0.5 rounded font-bold transition-colors"
                      >
                        GENERATE CITATION
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* SMART CITATION MODAL */}
      <AnimatePresence>
        {citation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCitation(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative border border-gray-200 dark:border-gray-800"
            >
              <div className="bg-red-600 p-6 text-white text-center relative">
                <Gavel className="h-12 w-12 mx-auto mb-2 opacity-20 absolute top-4 right-4" />
                <h2 className="text-2xl font-black tracking-tighter">SMART CITATION</h2>
                <p className="text-xs font-mono opacity-80 uppercase tracking-widest">Autonomous Enforcement Unit</p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
                  <div className="text-xs font-mono text-gray-500">CITATION_ID</div>
                  <div className="font-black font-mono text-red-500">{citation.id}</div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl">
                      <FileText className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Offense Type</div>
                      <div className="font-bold">{citation.offense}</div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl">
                      <MapPin className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Location</div>
                      <div className="font-bold text-xs">{citation.location}</div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl">
                      <Hash className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Web3 Evidence Hash</div>
                      <div className="font-mono text-[8px] truncate bg-gray-50 dark:bg-black p-1 rounded mt-1">{citation.evidence_hash}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-500">Fine Amount</span>
                    <span className="text-xl font-black text-red-500">{citation.fine_amount}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold">
                    <CheckCircle2 className="h-3 w-3" />
                    TIMESTAMPED_ON_CHAIN_IMMUTABLE
                  </div>
                </div>

                <button 
                  onClick={() => setCitation(null)}
                  className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-black py-4 rounded-2xl hover:opacity-90 transition-all"
                >
                  DISMISS RECORD
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
