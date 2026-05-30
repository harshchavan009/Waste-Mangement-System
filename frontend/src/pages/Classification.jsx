import React, { useState, useRef, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, X, CheckCircle, AlertCircle, Loader2, ScanLine, Search, Camera, Box, Cpu } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';
import ARScanner from '../components/ARScanner';
import HologramView from '../components/HologramView';
import RecyclingFactory from '../components/RecyclingFactory';

export default function Classification() {
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [scanMode, setScanMode] = useState('general'); // 'general' or 'brand'
  const [showAR, setShowAR] = useState(false);
  const [showHologram, setShowHologram] = useState(false);
  const [showFactory, setShowFactory] = useState(false);
  
  // Custom scrolling logs state to simulate high-tech telemetry loading
  const [telemetryLog, setTelemetryLog] = useState('EDGE_CNN_STANDBY');
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleSnapCamera = () => {
    // Prefer the full AR scanner when getUserMedia is supported (desktop + modern mobile)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setShowAR(true);
    } else {
      // Fallback: native file picker with capture attribute for older mobile browsers
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
        cameraInputRef.current.click();
      }
    }
  };
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    if (location.state?.autoStartAR) {
      setShowAR(true);
      // Clear location state immediately to prevent re-opening on manual refreshes
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (!loading) return;
    const logs = [
      'BOOTING_INFERENCE_VECTORS...',
      'CAPTURING_PIXEL_CHANNELS...',
      'FEEDING_RESNET50_LAYERS...',
      'FILTERING_NOISE_REDUCTION...',
      'DETECTING_GEOMETRIC_EDGES...',
      'RESOLVING_POLYMER_SHAPES...',
      'EXTRACTING_BRAND_EMBLEMS...',
      'CNN_PREDICTION_COMPILING...'
    ];
    let idx = 0;
    const timer = setInterval(() => {
      setTelemetryLog(logs[idx % logs.length]);
      idx++;
    }, 400);
    return () => clearInterval(timer);
  }, [loading]);

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

  const handleAnalyze = async (passedFile = null) => {
    const fileToAnalyze = passedFile || file;
    if (!fileToAnalyze) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', fileToAnalyze);

    try {
      const endpoint = scanMode === 'brand' ? '/api/scan-brand' : '/api/predict';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      
      let finalResult = {
        category: data.prediction,
        confidence: data.confidence,
        disposal_instructions: data.disposal_instructions,
        recycling_suggestions: data.recycling_suggestions,
        reuse_ideas: data.reuse_ideas,
        recycling_centers: data.recycling_centers,
        pollution_reduction: data.pollution_reduction,
        co2_savings: data.co2_savings,
        recycling_impact: data.recycling_impact
      };

      if (language !== "English") {
        const translate = async (text) => {
          if (!text) return text;
          try {
            const res = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text, language })
            });
            const json = await res.json();
            return json.translated;
          } catch(e) { return text; }
        };

        const [tCat, tDisp, tRec, tReu, tCent, tPoll, tCo2, tImp] = await Promise.all([
          translate(finalResult.category),
          translate(finalResult.disposal_instructions),
          translate(finalResult.recycling_suggestions),
          translate(finalResult.reuse_ideas),
          translate(finalResult.recycling_centers),
          translate(finalResult.pollution_reduction),
          translate(finalResult.co2_savings),
          translate(finalResult.recycling_impact)
        ]);

        finalResult = {
          ...finalResult,
          category: tCat,
          disposal_instructions: tDisp,
          recycling_suggestions: tRec,
          reuse_ideas: tReu,
          recycling_centers: tCent,
          pollution_reduction: tPoll,
          co2_savings: tCo2,
          recycling_impact: tImp
        };
      }
      
      setResult(finalResult);
    } catch (error) {
      console.error(error);
      setResult({
        category: "Error",
        confidence: 0,
        disposal_instructions: "Could not connect to the AI model. Ensure backend is running.",
        recycling_suggestions: "",
        reuse_ideas: "",
        recycling_centers: "",
        pollution_reduction: "",
        co2_savings: "",
        recycling_impact: ""
      });
    } finally {
      setLoading(false);
    }
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
        
        {/* Scan Mode Toggle */}
        <div className="flex justify-center mt-6">
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl flex items-center shadow-inner">
            <button 
              onClick={() => { setScanMode('general'); setResult(null); }}
              className={`px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${scanMode === 'general' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <Search className="h-4 w-4" />
              General Waste
            </button>
            <button 
              onClick={() => { setScanMode('brand'); setResult(null); }}
              className={`px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${scanMode === 'brand' ? 'bg-white dark:bg-gray-700 text-emerald-500 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <ScanLine className="h-4 w-4" />
              Brand Scanner
            </button>
          </div>
        </div>

        {/* AI Recycling Factory presentation card */}
        <div className="mt-8 max-w-2xl mx-auto p-5 rounded-2xl glassmorphism border border-emerald-500/20 bg-gradient-to-tr from-emerald-500/5 to-cyan-500/5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="text-left flex items-center gap-4">
             <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Cpu className="h-6 w-6 text-white animate-pulse" />
             </div>
             <div>
                <h4 className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                   3D Smart Factory Sim
                   <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">PRESENTATION READY</span>
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Explore autonomous sorting belts & multi-axis robotic arms.</p>
             </div>
          </div>
          <button 
            onClick={() => setShowFactory(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-transform hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-1.5"
          >
            Launch Factory
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showAR && (
          <ARScanner 
            scanMode={scanMode}
            onClose={() => setShowAR(false)}
            onCapture={(capturedFile) => {
              setShowAR(false);
              setFile(capturedFile);
              const reader = new FileReader();
              reader.onload = () => setPreview(reader.result);
              reader.readAsDataURL(capturedFile);
              handleAnalyze(capturedFile);
            }}
          />
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => setShowAR(true)}
            className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-primary/20 transition-all active:scale-95 animate-pulse"
          >
            <Camera className="h-6 w-6" />
            OPEN AR HUD SCANNER
          </button>

          <div 
            className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-700 hover:border-primary/50'} glassmorphism h-[400px] flex flex-col items-center justify-center relative overflow-hidden`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {preview ? (
              <div className="relative w-full h-full rounded-2xl overflow-hidden group">
                <img src={preview} alt="Preview" className="w-full h-full object-cover filter brightness-[0.85]" />
                
                {/* ADVANCED FUTURISTIC AI SCANNERS OVERLAY */}
                {loading && (
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    
                    {/* 1. Futuristic AI Grid Effect Layer */}
                    <div 
                      className="absolute inset-0 opacity-[0.25]"
                      style={{
                        backgroundSize: '24px 24px',
                        backgroundImage: `linear-gradient(to right, #10b981 1px, transparent 1px),
                                          linear-gradient(to bottom, #10b981 1px, transparent 1px)`
                      }}
                    />

                    {/* 2. Sweeping Volumetric Laser Beam */}
                    <motion.div 
                      animate={{ top: ['-5%', '105%', '-5%'] }}
                      transition={{ repeat: Infinity, duration: 2.0, ease: "easeInOut" }}
                      className="absolute left-0 right-0 h-[4px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent shadow-[0_0_22px_7px_rgba(16,185,129,0.85)]"
                    />

                    {/* Wide laser volumetric sweep light panel */}
                    <motion.div 
                      animate={{ top: ['-25%', '85%', '-25%'] }}
                      transition={{ repeat: Infinity, duration: 2.0, ease: "easeInOut" }}
                      className="absolute left-0 right-0 h-[80px] bg-gradient-to-b from-[#10b981]/15 to-transparent filter blur-md opacity-60"
                    />

                    {/* 3. AI Target Detection Box Reticle */}
                    <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border border-emerald-500/30 rounded-lg flex items-center justify-center">
                      
                      {/* Corner Brackets */}
                      <div className="border-t-4 border-l-4 border-emerald-400 w-5 h-5 absolute top-[-2px] left-[-2px] rounded-tl-md" />
                      <div className="border-t-4 border-r-4 border-emerald-400 w-5 h-5 absolute top-[-2px] right-[-2px] rounded-tr-md" />
                      <div className="border-b-4 border-l-4 border-emerald-400 w-5 h-5 absolute bottom-[-2px] left-[-2px] rounded-bl-md" />
                      <div className="border-b-4 border-r-4 border-emerald-400 w-5 h-5 absolute bottom-[-2px] right-[-2px] rounded-br-md" />

                      {/* Scanning targeting ticks */}
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                      
                      {/* Dynamic Target HUD Label */}
                      <div className="absolute top-2 left-2.5 font-mono text-[8px] text-emerald-400 font-extrabold uppercase tracking-widest bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/20">
                        Acquiring Target...
                      </div>

                      {/* Random coordinates HUD */}
                      <div className="absolute bottom-2 left-2.5 font-mono text-[8px] text-cyan-400 font-extrabold bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-500/20">
                        {telemetryLog}
                      </div>

                      <div className="absolute bottom-2 right-2.5 font-mono text-[8px] text-yellow-400 font-extrabold bg-slate-950/80 px-2 py-0.5 rounded border border-yellow-500/20">
                        RES_512x512
                      </div>
                    </div>

                    {/* Outer telemetry HUD readings */}
                    <div className="absolute top-3 right-3 font-mono text-[9px] text-[#10b981] font-black bg-black/60 px-2.5 py-1 rounded backdrop-blur border border-emerald-500/20">
                      MODEL: CNN_RESNET_V2
                    </div>
                  </div>
                )}

                {/* Locked active grid framing when scan finishes */}
                {result && !loading && (
                  <div className="absolute inset-0 pointer-events-none z-10 border-4 border-emerald-500/40 rounded-2xl bg-emerald-500/5">
                    <div className="absolute top-3 left-3 border border-emerald-400/50 bg-black/60 rounded px-2 py-0.5 font-mono text-[8px] font-bold text-emerald-400 tracking-wider">
                      [ LOCKED_TARGET_CLASSIFIED ]
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30">
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
                <p className="text-gray-500 dark:text-gray-400 mb-6">or click to scan from your device</p>
                {/* Photo Library picker (no capture attribute) */}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileInput}
                />
                {/* Dedicated camera-only snap input (capture=environment fallback) */}
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="hidden" 
                  ref={cameraInputRef}
                  onChange={handleFileInput}
                />
                
                {/* Mobile Touch-Friendly Upload & Camera Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs justify-center px-4 relative z-20">
                  <button 
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''; // reset so same file can re-trigger
                        fileInputRef.current.click();
                      }
                    }}
                    className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
                  >
                    <Upload className="h-4 w-4 text-emerald-500" />
                    PHOTO LIBRARY
                  </button>
                  <button 
                    onClick={handleSnapCamera}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-xs font-black rounded-2xl transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-lg shadow-emerald-500/25"
                  >
                    <Camera className="h-4 w-4" />
                    SNAP CAMERA
                  </button>
                </div>
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
        <div className="glassmorphism rounded-3xl p-8 h-[500px] flex flex-col justify-center">
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
                <div className={`p-4 rounded-full mb-6 ${scanMode === 'brand' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                  {scanMode === 'brand' ? <ScanLine className="h-12 w-12 text-emerald-500" /> : <CheckCircle className="h-12 w-12 text-primary" />}
                </div>
                <h2 className="text-3xl font-black mb-2">{result.category}</h2>
                <div className="inline-block px-4 py-1 bg-gray-100 dark:bg-gray-800 rounded-full mb-6 flex items-center gap-2">
                  <span className="text-sm font-semibold">Confidence: <span className={scanMode === 'brand' ? 'text-emerald-500' : 'text-primary'}>{result.confidence}%</span></span>
                  {scanMode === 'brand' && <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">BRAND IDENTIFIED</span>}
                </div>

                <button 
                  onClick={() => setShowHologram(true)}
                  className="w-full mb-6 bg-gradient-to-r from-primary to-blue-500 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all"
                >
                  <Box className="h-5 w-5" />
                  VIEW 3D HOLOGRAM
                </button>

                <div className="space-y-3 w-full text-left overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Disposal Instructions
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{result.disposal_instructions}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Recycling Suggestions
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{result.recycling_suggestions}</p>
                  </div>
                  {result.reuse_ideas && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-yellow-500" />
                        Reuse & Upcycle Ideas
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{result.reuse_ideas}</p>
                    </div>
                  )}
                  {result.recycling_centers && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                        Local Recycling Centers
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{result.recycling_centers}</p>
                    </div>
                  )}
                  {result.pollution_reduction && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        AI Environmental Impact Estimates
                      </h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                        <li><span className="font-semibold">🌍 Pollution Reduction:</span> {result.pollution_reduction}</li>
                        <li><span className="font-semibold">☁️ CO₂ Savings:</span> {result.co2_savings}</li>
                        <li><span className="font-semibold">♻️ Recycling Impact:</span> {result.recycling_impact}</li>
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showHologram && (
          <HologramView 
            type={result?.category} 
            onClose={() => setShowHologram(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFactory && (
          <RecyclingFactory 
            onClose={() => setShowFactory(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
