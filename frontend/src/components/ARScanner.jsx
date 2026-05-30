import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Zap, Target, Cpu, ShieldCheck, Activity, RefreshCw, Box, CheckCircle } from 'lucide-react';

export default function ARScanner({ onCapture, onClose, scanMode = 'general' }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Real-time automated detection state
  const [liveDetection, setLiveDetection] = useState(null);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [lockedObject, setLockedObject] = useState(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Continuous background auto-scan loop while scanner is open
  useEffect(() => {
    if (!stream || lockedObject) return;

    // Trigger instant initial scan after 1 second, then run every 2.5 seconds
    const initialTimer = setTimeout(() => {
      performLiveScan();
    }, 1000);

    const interval = setInterval(() => {
      performLiveScan();
    }, 2500);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [stream, lockedObject, scanMode]);

  const performLiveScan = () => {
    if (!videoRef.current || !canvasRef.current || analyzing || lockedObject) return;
    
    setAnalyzing(true);
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    
    canvasRef.current.toBlob((blob) => {
      if (!blob) {
        setAnalyzing(false);
        return;
      }
      
      const file = new File([blob], "live-capture.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = scanMode === 'brand' ? '/api/scan-brand' : '/api/predict';
      
      fetch(endpoint, {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        if (data.prediction) {
          const timestamp = new Date().toLocaleTimeString();
          const confidence = data.confidence || 0.88;
          
          setLiveDetection({
            category: data.prediction,
            confidence: confidence,
            disposal: data.disposal_instructions || "Recyclable material.",
            time: timestamp
          });
          
          // Auto-lock high confidence targets (> 75%)
          if (confidence > 0.75) {
            setLockedObject({
              category: data.prediction,
              confidence: confidence,
              file: file,
              disposal: data.disposal_instructions || "Recyclable material."
            });
          }
        }
        setAnalyzing(false);
        setLastScanTime(new Date().toLocaleTimeString());
      })
      .catch(err => {
        console.error(err);
        setAnalyzing(false);
      });
    }, 'image/jpeg');
  };

  const handleConfirmLock = () => {
    if (lockedObject && lockedObject.file) {
      onCapture(lockedObject.file);
    }
  };

  const handleManualCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setAnalyzing(true);
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    
    canvasRef.current.toBlob((blob) => {
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      onCapture(file);
      setAnalyzing(false);
    }, 'image/jpeg');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Background Video Stream */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />
      
      {/* HUD SCI-FI OVERLAYS */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
        
        {/* Top HUD Row */}
        <div className="flex justify-between items-start">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-[#0b0f19]/80 border-l-4 border-emerald-500 p-4 rounded-r-xl backdrop-blur-md shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
            <div>
              <div className="text-[10px] text-emerald-400 font-mono font-black uppercase tracking-widest">AI_INSTANT_INF_ACTIVATED</div>
              <div className="flex items-center gap-2 text-white">
                <Zap className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-mono">AUTONOMOUS_WASTE_EDGE_V2</span>
              </div>
            </div>
          </motion.div>
          
          <button 
            onClick={onClose}
            className="pointer-events-auto bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-all shadow-lg active:scale-95"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Center Holographic Aim reticles */}
        <div className="flex-grow flex items-center justify-center relative">
          
          {/* Outer radar spinning */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute"
          >
            <Target className={`h-80 w-80 transition-colors duration-500 stroke-[0.5] ${lockedObject ? 'text-emerald-500/40' : 'text-primary/30'}`} />
          </motion.div>
          
          {/* Scanner Box frame */}
          <div className="relative">
             <motion.div 
               animate={lockedObject ? { scale: [1, 1.05, 1], borderColor: '#10b981' } : { scale: [1, 1.08, 1], borderColor: '#3b82f6' }}
               transition={{ duration: 2, repeat: Infinity }}
               className={`border-4 w-56 h-56 rounded-3xl flex items-center justify-center transition-colors duration-500 shadow-2xl`}
             >
                <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 ${lockedObject ? 'bg-emerald-500 animate-ping' : 'bg-primary'}`}></div>
             </motion.div>
             
             {/* Glowing Brackets */}
             <div className={`absolute -top-3 -left-3 w-8 h-8 border-t-4 border-l-4 rounded-tl-xl transition-colors duration-500 ${lockedObject ? 'border-emerald-500' : 'border-primary'}`}></div>
             <div className={`absolute -top-3 -right-3 w-8 h-8 border-t-4 border-r-4 rounded-tr-xl transition-colors duration-500 ${lockedObject ? 'border-emerald-500' : 'border-primary'}`}></div>
             <div className={`absolute -bottom-3 -left-3 w-8 h-8 border-b-4 border-l-4 rounded-bl-xl transition-colors duration-500 ${lockedObject ? 'border-emerald-500' : 'border-primary'}`}></div>
             <div className={`absolute -bottom-3 -right-3 w-8 h-8 border-b-4 border-r-4 rounded-br-xl transition-colors duration-500 ${lockedObject ? 'border-emerald-500' : 'border-primary'}`}></div>
             
             {/* WebXR Holographic Spatial AR Projection Overlay */}
             <AnimatePresence>
               {lockedObject && (
                 <motion.div 
                   initial={{ scale: 0.6, opacity: 0, y: 30 }}
                   animate={{ scale: 1, opacity: 1, y: 0 }}
                   exit={{ scale: 0.6, opacity: 0, y: 30 }}
                   className="absolute -top-52 left-1/2 -translate-x-1/2 w-64 bg-slate-950/90 border border-emerald-400 rounded-2xl p-4 shadow-[0_0_30px_rgba(16,185,129,0.4)] backdrop-blur-md z-20 pointer-events-auto"
                   style={{
                     transformStyle: 'preserve-3d',
                     perspective: '1000px',
                     rotateX: '12deg'
                   }}
                 >
                   {/* Neon Leader Pointer Line */}
                   <div className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 w-0.5 h-4 bg-gradient-to-b from-emerald-400 to-transparent animate-pulse"></div>

                   <div className="text-[8px] font-mono text-emerald-400 font-extrabold uppercase tracking-[0.2em] mb-1 text-center">
                     🛰️ WebXR_SPATIAL_PROJECTION
                   </div>
                   <h4 className="text-white text-md font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5 justify-center">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                     {lockedObject.category}
                   </h4>

                   {/* Holographic AR instructions plate */}
                   <div className="bg-emerald-950/40 rounded-xl p-3 border border-emerald-500/20 text-left space-y-1.5">
                     <div className="text-[8px] font-bold text-emerald-300 uppercase tracking-widest font-mono">
                       Recycling Instructions
                     </div>
                     <p className="text-[10px] text-gray-200 font-medium leading-relaxed">
                       {lockedObject.disposal}
                     </p>
                   </div>

                   <div className="mt-2.5 text-[7px] text-emerald-300/40 font-mono flex justify-between">
                     <span>SYS_STATUS: SYNCED</span>
                     <span>AZIMUTH: 312.4°</span>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
          
          {/* Dynamic Laser Sweep */}
          <motion.div 
            animate={{ y: [-110, 110, -110] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute w-56 h-1 rounded-full blur-[1px] ${lockedObject ? 'bg-emerald-500/80 shadow-[0_0_15px_#10b981]' : 'bg-primary/80 shadow-[0_0_15px_#3b82f6]'}`}
          />

          {/* Real-time Detections Floating HUD Card */}
          <div className="absolute top-[80%] w-full max-w-sm px-4">
            <AnimatePresence mode="wait">
              {lockedObject ? (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="bg-emerald-950/80 border border-emerald-500/30 backdrop-blur-lg rounded-2xl p-4 shadow-2xl text-center pointer-events-auto"
                >
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold uppercase tracking-widest text-xs mb-1.5 animate-pulse">
                    <CheckCircle className="h-4 w-4" />
                    Material Lock Acquired
                  </div>
                  <h4 className="text-white text-lg font-black">{lockedObject.category}</h4>
                  <p className="text-[10px] text-emerald-300 font-mono mt-0.5">Confidence match: {(lockedObject.confidence * 100).toFixed(0)}%</p>
                  <p className="text-xs text-gray-300 mt-2 font-medium italic">"{lockedObject.disposal}"</p>
                  
                  <button 
                    onClick={handleConfirmLock}
                    className="w-full mt-3 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-extrabold text-xs rounded-xl tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  >
                    LOCK & INGEST MATERIAL
                  </button>
                </motion.div>
              ) : liveDetection ? (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-[#0b0f19]/80 border border-primary/20 backdrop-blur-md rounded-2xl p-4 shadow-2xl flex items-center gap-3"
                >
                  <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center animate-spin text-primary">
                    <RefreshCw className="h-5 w-5" />
                  </div>
                  <div className="text-left flex-grow">
                    <div className="text-[9px] text-primary font-mono tracking-widest font-extrabold uppercase">Live AI Evaluation</div>
                    <h5 className="text-white font-black text-sm">{liveDetection.category}</h5>
                    <p className="text-[9px] text-gray-400 font-mono mt-0.5">Analyzing material signature ({(liveDetection.confidence * 100).toFixed(0)}%)</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="bg-black/60 border border-white/5 backdrop-blur-sm rounded-xl py-3 px-6 text-center text-white/70 font-mono text-xs tracking-wider font-extrabold"
                >
                  📡 POINT CAMERA AT RECYCLABLE WASTE...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom HUD row */}
        <div className="flex justify-between items-end">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col gap-1.5"
          >
            <div className="flex items-center gap-2 text-white/50 text-[9px] font-mono">
              <Cpu className="h-3 w-3" /> INF_TENSOR_ENGINE: ACTIVE
            </div>
            <div className="flex items-center gap-2 text-white/50 text-[9px] font-mono">
              <ShieldCheck className="h-3 w-3" /> PWA_LOCAL_DB: SYNCED
            </div>
            {lastScanTime && (
              <div className="flex items-center gap-2 text-emerald-400/70 text-[9px] font-mono animate-pulse">
                <Activity className="h-3 w-3" /> LAST_PROBE_PING: {lastScanTime}
              </div>
            )}
          </motion.div>
          
          {/* Manual Snapshot capture fallback */}
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={handleManualCapture}
              disabled={analyzing || !!lockedObject}
              className="pointer-events-auto w-16 h-16 rounded-full bg-white/10 border-4 border-white/30 flex items-center justify-center shadow-2xl active:scale-90 transition-transform disabled:opacity-40"
              title="Manual Trigger Capture"
            >
              <div className="w-10 h-10 rounded-full bg-white/90"></div>
            </button>
            <span className="text-white/60 text-[9px] font-mono tracking-widest uppercase">MANUAL_SNAP</span>
          </div>
          
          {/* High-tech audio wave telemetry bars */}
          <div className="w-20 h-10 bg-white/5 border border-white/10 rounded p-1.5 flex flex-col justify-end items-end gap-1">
             <div className="flex gap-0.5">
               {[1,2,3,4,5].map(i => (
                 <motion.div 
                   key={i}
                   animate={lockedObject ? { height: [2, 4, 2] } : { height: [3, 14, 3] }}
                   transition={{ duration: 0.8, repeat: Infinity, delay: i*0.15 }}
                   className={`w-0.5 rounded-full ${lockedObject ? 'bg-emerald-500' : 'bg-primary'}`}
                 />
               ))}
             </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
