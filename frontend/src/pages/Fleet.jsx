import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Activity, AlertTriangle, Battery, BatteryCharging, Droplets, Thermometer, Radio, Settings, ShieldAlert, BoxSelect, Gauge, Cpu, Box, X, Compass, Globe, Terminal, Video } from 'lucide-react';
import FleetModel3D from '../components/FleetModel3D';

export default function Fleet() {
  const [telemetry, setTelemetry] = useState({ trucks: [], drones: [] });
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' or '3d'
  
  // Custom futuristic scrolling terminal logs state
  const [logs, setLogs] = useState([
    'SYS_BOOT: AI mission control online.',
    'NET_LINK: SAT-COM orbital lock established.',
    'AI_INFERENCE: CNN ResNet models loaded successfully.'
  ]);

  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/fleet/telemetry');
      const data = await res.json();
      setTelemetry(data);
      
      // Auto select the first vehicle if none selected
      if (!selectedVehicle && (data.trucks.length > 0 || data.drones.length > 0)) {
        setSelectedVehicle(data.trucks[0] || data.drones[0]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  // Procedural futuristic scrolling logs generator
  useEffect(() => {
    if (viewMode !== '3d') return;
    const phrases = [
      'CAPTURING_PIXEL_CHANNELS...',
      'RESOLVING_POLYMER_SHAPES...',
      'RECOMPUTING_DIJKSTRA_COORDINATES...',
      'UPDATING_IOT_MAST_PINGS...',
      'CALIBRATING_THERMAL_SENSORS...',
      'POLLING_GRID_TELEMETRY...',
      'EDGE_INFERENCE: 99.4% CONFIDENCE',
      'GPS_TELEMETRY: lock sync stable.',
      'DRONE_RECON: telemetry stream OK.',
      'COMPACTION_PRESS: pressure normalized.'
    ];
    
    const logInterval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const newLog = `[${timeStr}] ${phrases[Math.floor(Math.random() * phrases.length)]}`;
      setLogs(prev => [newLog, ...prev.slice(0, 10)]);
    }, 2200);

    return () => clearInterval(logInterval);
  }, [viewMode]);

  const hasAlert = telemetry.trucks.some(t => t.predictive_alert) || telemetry.drones.some(d => d.predictive_alert);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      
      {/* Red Flash Overlay for Critical Alert */}
      <AnimatePresence>
        {hasAlert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-0 border-8 border-red-500/50 bg-red-500/5"
          >
             <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-ping"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold font-mono tracking-tighter flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              FLEET TELEMETRY <span className="text-xs bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded-sm">LIVE</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Real-time IoT diagnostics and AI predictive maintenance.</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-2">
              <Truck className="h-5 w-5 text-gray-500" />
              <span className="font-bold text-sm">{telemetry.trucks.length} Active</span>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-2">
              <Radio className="h-5 w-5 text-gray-500" />
              <span className="font-bold text-sm">{telemetry.drones.length} Active</span>
            </div>
            
            {/* View Mode Selector Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shadow-inner border border-gray-200/20">
              <button 
                onClick={() => setViewMode('dashboard')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'dashboard' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                DASHBOARD
              </button>
              <button 
                onClick={() => setViewMode('3d')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === '3d' ? 'bg-white dark:bg-gray-700 shadow text-primary font-black flex items-center gap-1.5' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                <Cpu className="h-3.5 w-3.5 animate-pulse text-[#10b981]" />
                AI CONTROL HUD
              </button>
            </div>
          </div>
        </div>

        {/* Global Alert Banner */}
        <AnimatePresence>
          {hasAlert && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-red-500 text-white p-4 rounded-xl mb-8 flex items-center gap-4 shadow-lg shadow-red-500/30 border-2 border-red-400"
            >
              <ShieldAlert className="h-8 w-8 animate-pulse text-white" />
              <div>
                <h3 className="font-black text-lg tracking-widest uppercase">AI PREDICTIVE MAINTENANCE ALERT</h3>
                <p className="text-sm font-medium">Critical anomaly detected in fleet telemetry. Syncing remote diagnostic repair instructions...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Activity className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'dashboard' ? (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                {/* Trucks Section */}
                <div>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
                    <Truck className="h-6 w-6 text-primary" /> Heavy Compactors
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {telemetry.trucks.map(truck => (
                      <motion.div 
                        key={truck.id}
                        layout
                        onClick={() => { setSelectedVehicle(truck); setViewMode('3d'); }}
                        className={`p-6 rounded-2xl border-2 transition-all cursor-pointer hover:scale-[1.02] ${truck.predictive_alert ? 'border-red-500 bg-red-500/5 shadow-lg shadow-red-500/20' : 'border-gray-200 dark:border-gray-800 glassmorphism'}`}
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-xl font-black font-mono">{truck.id}</h3>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${truck.predictive_alert ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                              {truck.status}
                            </span>
                          </div>
                          <Settings className={`h-5 w-5 ${truck.predictive_alert ? 'text-red-500 animate-spin' : 'text-gray-400'}`} style={{ animationDuration: '3s' }} />
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1 font-medium">
                              <span className="flex items-center gap-1 text-gray-500"><Battery className="h-4 w-4" /> Fuel Level</span>
                              <span className={truck.fuel_level < 20 ? 'text-red-500' : ''}>{truck.fuel_level}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div className={`h-2 rounded-full transition-all duration-500 ${truck.fuel_level < 20 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${truck.fuel_level}%` }}></div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-center">
                              <div className="text-[10px] text-gray-500 flex items-center justify-center gap-1 mb-1"><Thermometer className="h-3 w-3" /> Temp</div>
                              <div className={`text-sm font-black font-mono ${truck.engine_temp > 105 ? 'text-red-500' : ''}`}>{truck.engine_temp}°C</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-center">
                              <div className="text-[10px] text-gray-500 flex items-center justify-center gap-1 mb-1"><Droplets className="h-3 w-3" /> Oil</div>
                              <div className={`text-sm font-black font-mono ${truck.oil_life < 15 ? 'text-red-500' : ''}`}>{truck.oil_life}%</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Drones Section */}
                <div>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
                    <Radio className="h-6 w-6 text-blue-500" /> Recon Drones
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {telemetry.drones.map(drone => (
                      <motion.div 
                        key={drone.id}
                        layout
                        onClick={() => { setSelectedVehicle(drone); setViewMode('3d'); }}
                        className={`p-6 rounded-2xl border-2 transition-all cursor-pointer hover:scale-[1.02] ${drone.predictive_alert ? 'border-orange-500 bg-orange-500/5 shadow-lg shadow-orange-500/20' : 'border-gray-200 dark:border-gray-800 glassmorphism'}`}
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-xl font-black font-mono">{drone.id}</h3>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${drone.predictive_alert ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'}`}>
                              {drone.status}
                            </span>
                          </div>
                          <Radio className={`h-5 w-5 ${drone.predictive_alert ? 'text-orange-500 animate-pulse' : 'text-blue-500'}`} />
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1 font-medium">
                              <span className="flex items-center gap-1 text-gray-500"><BatteryCharging className="h-4 w-4" /> Battery</span>
                              <span className={drone.battery < 20 ? 'text-orange-500' : ''}>{drone.battery}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div className={`h-2 rounded-full transition-all duration-500 ${drone.battery < 20 ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: `${drone.battery}%` }}></div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-center">
                              <div className="text-[10px] text-gray-500 flex items-center justify-center gap-1 mb-1"><Settings className="h-3 w-3" /> RPM</div>
                              <div className="text-sm font-black font-mono">{drone.rotor_rpm}</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-center">
                              <div className="text-[10px] text-gray-500 flex items-center justify-center gap-1 mb-1"><Radio className="h-3 w-3" /> Signal</div>
                              <div className="text-sm font-black font-mono">{drone.signal_dbm}</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              /* FUTURISTIC CONTROL ROOM UI WITH FLOATING SCREENS AND LIVE AI DATA */
              <motion.div 
                key="3d"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                className="grid lg:grid-cols-5 gap-8 h-[650px] relative"
              >
                 {/* Tactical Unit Selector Console */}
                 <div className="lg:col-span-1 glassmorphism rounded-3xl border border-[#10b981]/20 overflow-y-auto p-4 space-y-3 custom-scrollbar flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4 px-2 border-b border-gray-800 pb-2">
                        <Terminal className="h-4 w-4 text-[#10b981] animate-pulse" />
                        <h3 className="text-xs font-black text-[#10b981] uppercase tracking-widest">TACTICAL_SYS</h3>
                      </div>
                      <div className="space-y-2">
                        {[...telemetry.trucks, ...telemetry.drones].map(unit => (
                          <button 
                            key={unit.id}
                            onClick={() => setSelectedVehicle(unit)}
                            className={`w-full p-3.5 rounded-xl border-2 text-left transition-all relative overflow-hidden ${selectedVehicle?.id === unit.id ? 'border-[#10b981] bg-[#10b981]/5 shadow-[0_0_15px_2px_rgba(16,185,129,0.15)]' : 'border-gray-800 hover:bg-gray-800/40'}`}
                          >
                            <div className="flex items-center gap-3">
                              {unit.id.startsWith('TRUCK') ? <Truck className="h-4 w-4 text-[#10b981]" /> : <Radio className="h-4 w-4 text-cyan-400" />}
                              <span className="font-mono font-black text-xs tracking-tighter">{unit.id}</span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${unit.predictive_alert ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-emerald-500/10 text-[#10b981]'}`}>
                                {unit.status}
                              </span>
                              <span className="text-[8px] font-mono text-gray-500">PING: 12ms</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Remote system status mast */}
                    <div className="p-3 bg-gray-950/80 rounded-xl border border-gray-800 font-mono text-[8px] space-y-1 text-gray-400 mt-4">
                      <div>SEC_LEVEL: ALPHA</div>
                      <div>INF_LAYERS: STABLE</div>
                      <div className="text-[#10b981] animate-pulse font-extrabold">Remote diagnostics: OK</div>
                    </div>
                 </div>

                 {/* 3D Viewport Control Center with Floating Screens */}
                 <div className="lg:col-span-4 glassmorphism rounded-3xl border border-[#10b981]/20 relative overflow-hidden bg-[#090d16] flex flex-col justify-between">
                    {selectedVehicle ? (
                      <div className="w-full h-full relative flex flex-col">
                         
                         {/* Centered R3F Viewport */}
                         <div className="w-full h-full absolute inset-0 z-0">
                           <FleetModel3D 
                             type={selectedVehicle.id.startsWith('TRUCK') ? 'truck' : 'drone'} 
                             telemetry={selectedVehicle} 
                           />
                         </div>

                         {/* FLOATING CONTROL HUD LAYOUT */}

                         {/* Screen 1: Top-Left Floating Sat-Com Diagnostic Screen */}
                         <div className="absolute top-4 left-4 z-10 pointer-events-none w-56 bg-slate-950/85 backdrop-blur-md p-4 rounded-xl border border-[#10b981]/20 shadow-xl shadow-black/60">
                            <div className="flex items-center gap-1.5 border-b border-gray-800 pb-1.5 mb-2">
                              <Globe className="h-3.5 w-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                              <span className="text-[9px] font-mono text-cyan-400 font-extrabold tracking-widest">SAT_COM_LINK</span>
                            </div>
                            <div className="font-mono text-[8px] text-gray-300 space-y-1">
                              <div className="flex justify-between"><span>SAT_ID:</span> <span className="text-white font-bold">ORBITAL_ECO_4</span></div>
                              <div className="flex justify-between"><span>LAT:</span> <span className="text-white">37.7749</span></div>
                              <div className="flex justify-between"><span>LNG:</span> <span className="text-white">-122.4194</span></div>
                              <div className="flex justify-between"><span>TELE_SIG:</span> <span className="text-emerald-400 font-extrabold animate-pulse">OPTIMAL</span></div>
                            </div>
                         </div>

                         {/* Screen 2: Bottom-Left Floating Live AI Terminal Logs */}
                         <div className="absolute bottom-4 left-4 z-10 pointer-events-none w-72 bg-slate-950/85 backdrop-blur-md p-4 rounded-xl border border-gray-800 shadow-xl shadow-black/60">
                            <div className="flex items-center gap-1.5 border-b border-gray-800 pb-1.5 mb-2">
                              <Terminal className="h-3.5 w-3.5 text-[#10b981]" />
                              <span className="text-[9px] font-mono text-[#10b981] font-extrabold tracking-widest">LIVE_AI_TELEMETRY</span>
                            </div>
                            <div className="font-mono text-[8px] text-[#10b981] space-y-1 max-h-[100px] overflow-hidden">
                              {logs.map((log, i) => (
                                <div key={i} className={i === 0 ? 'text-emerald-300 font-extrabold animate-pulse' : 'text-[#10b981]/70'}>
                                  {log}
                                </div>
                              ))}
                            </div>
                         </div>

                         {/* Screen 3: Bottom-Right Floating Futuristic CCTV Stream */}
                         <div className="absolute bottom-4 right-4 z-10 pointer-events-none w-56 bg-slate-950/85 backdrop-blur-md p-3 rounded-xl border border-[#10b981]/20 shadow-xl shadow-black/60 overflow-hidden">
                            <div className="flex justify-between items-center border-b border-gray-800 pb-1.5 mb-2">
                              <div className="flex items-center gap-1.5">
                                <Video className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                                <span className="text-[9px] font-mono text-gray-300 font-extrabold tracking-widest">CAM_FEED_#42</span>
                              </div>
                              <span className="text-[7px] font-black text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded animate-pulse">REC</span>
                            </div>
                            
                            {/* Simulated green night-vision filter container */}
                            <div className="h-20 bg-emerald-950/40 rounded border border-emerald-900/60 relative overflow-hidden flex items-center justify-center">
                              <div className="absolute inset-0 bg-gradient-to-b from-[#10b981]/5 to-transparent z-10 pointer-events-none" />
                              {/* Glowing scanline sweep */}
                              <div className="absolute left-0 right-0 h-0.5 bg-[#10b981]/25 top-0 animate-bounce" style={{ animationDuration: '4s' }} />
                              <div className="text-[8px] font-mono text-[#10b981] font-black text-center select-none uppercase tracking-tighter opacity-80">
                                CCTV_REMOTE_SYNCED
                                <div className="text-[6px] text-gray-400 mt-1">LAT_LNG: 37.77 / -122.41</div>
                              </div>
                            </div>
                         </div>

                         {/* Screen 4: Top-Right Floating Diagnostic Telemetry Screen */}
                         <div className="absolute top-4 right-4 z-10 pointer-events-none w-64 bg-slate-950/85 backdrop-blur-md p-5 rounded-xl border border-[#10b981]/20 shadow-xl shadow-black/60">
                            <div className="flex justify-between items-start border-b border-gray-800 pb-2 mb-4">
                               <div>
                                 <span className="text-[8px] font-mono text-[#10b981] font-black block tracking-widest uppercase">SYNCHRONIZED_TWIN</span>
                                 <span className="text-xl font-black text-white">{selectedVehicle.id}</span>
                               </div>
                               <Compass className="h-5 w-5 text-cyan-400 animate-pulse" />
                            </div>
                            <div className="space-y-3 font-mono text-[9px] text-gray-300">
                               <div className="flex justify-between gap-8 items-center border-b border-white/5 pb-2">
                                  <span className="text-[9px] text-gray-500">FUEL_POWER_LOAD</span>
                                  <span className="text-xs font-black text-emerald-400">{selectedVehicle.fuel_level || selectedVehicle.battery}%</span>
                               </div>
                               <div className="flex justify-between gap-8 items-center border-b border-white/5 pb-2">
                                  <span className="text-[9px] text-gray-500">THERMAL_THRESHOLD</span>
                                  <span className="text-xs font-black">{selectedVehicle.engine_temp || '24'}°C</span>
                               </div>
                               <div className="flex justify-between gap-8 items-center">
                                  <span className="text-[9px] text-gray-500">DIAGNOSTIC_REPORT</span>
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${selectedVehicle.predictive_alert ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                     {selectedVehicle.status}
                                  </span>
                                </div>
                            </div>
                         </div>

                         {/* Floating Ambient Crosshair in very center */}
                         <div className="absolute inset-0 z-5 pointer-events-none flex items-center justify-center opacity-25">
                            <div className="w-16 h-16 border-2 border-dashed border-[#10b981] rounded-full animate-spin" style={{ animationDuration: '24s' }} />
                            <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full absolute" />
                         </div>

                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 italic">
                        <BoxSelect className="h-12 w-12 mb-4 opacity-20" />
                        Select a vehicle unit to initiate 3D remote command synchronization
                      </div>
                    )}
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
