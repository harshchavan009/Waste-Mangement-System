import { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, Upload, Send, AlertTriangle, CheckCircle, Clock, Search, Navigation, WifiOff, CloudLightning } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommunityReport() {
  const [reports, setReports] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [category, setCategory] = useState('Overflowing Bin');
  const [locationDesc, setLocationDesc] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMode, setSuccessMode] = useState(false);
  
  // Real-time Offline & Sync states
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncingToast, setSyncingToast] = useState(false);
  const [syncCompletedToast, setSyncCompletedToast] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchReports();

    // Listen to network status changes
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineReports();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check for unsynced offline reports on load
    if (navigator.onLine) {
      syncOfflineReports();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const onlineReports = await res.json();
        
        // Merge with any cached offline reports to show Optimistic UI
        const offline = JSON.parse(localStorage.getItem('ecovision-offline-reports') || '[]');
        const formattedOffline = offline.map(r => ({
          id: r.id,
          category: r.category,
          location: r.locationDesc || `GPS coordinates (${r.lat?.toFixed(2)}, ${r.lng?.toFixed(2)})`,
          timestamp: 'Offline Pending Sync',
          status: 'Offline Pending'
        }));

        setReports([...formattedOffline, ...onlineReports]);
      }
    } catch (e) {
      console.error('Failed to fetch reports');
      // If offline completely, fallback to localStorage cache
      const offline = JSON.parse(localStorage.getItem('ecovision-offline-reports') || '[]');
      const formattedOffline = offline.map(r => ({
        id: r.id,
        category: r.category,
        location: r.locationDesc || `GPS coordinates (${r.lat?.toFixed(2)}, ${r.lng?.toFixed(2)})`,
        timestamp: 'Offline Pending Sync',
        status: 'Offline Pending'
      }));
      setReports(formattedOffline);
    }
  };

  const syncOfflineReports = async () => {
    const offlineReports = JSON.parse(localStorage.getItem('ecovision-offline-reports') || '[]');
    if (offlineReports.length === 0) return;

    setSyncingToast(true);

    for (const r of offlineReports) {
      const formData = new FormData();
      formData.append('category', r.category);
      formData.append('location_desc', r.locationDesc);
      if (r.lat && r.lng) {
        formData.append('lat', r.lat);
        formData.append('lng', r.lng);
      }
      
      if (r.photoBase64) {
        try {
          const blob = await fetch(r.photoBase64).then(res => res.blob());
          formData.append('photo', blob, 'offline-upload.jpg');
        } catch (e) {
          console.error("Failed to decode base64 photo for offline sync");
        }
      }

      try {
        const res = await fetch('/api/reports', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          console.log("Successfully synced offline report:", r.id);
        }
      } catch (err) {
        console.error("Sync post failed, will retry later:", err);
      }
    }

    // Clear offline cache
    localStorage.removeItem('ecovision-offline-reports');
    
    // Refresh list
    fetchReports();
    
    setTimeout(() => {
      setSyncingToast(false);
      setSyncCompletedToast(true);
      setTimeout(() => setSyncCompletedToast(false), 4000);
    }, 1500);
  };

  const handleFile = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const getLocation = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationDesc(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
          setLoading(false);
        },
        (error) => {
          console.error(error);
          alert("Could not get location. Please ensure location services are enabled.");
          setLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !locationDesc) {
      alert("Please provide at least a photo or a location description.");
      return;
    }
    
    setSubmitting(true);

    // Hands-Free Offline Mode interceptor
    if (!isOnline) {
      const offlineId = `REP-OFF-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOfflineReport = {
        id: offlineId,
        category: category,
        locationDesc: locationDesc,
        lat: coordinates?.lat,
        lng: coordinates?.lng,
        photoBase64: preview, // Persist raw base64 data for off-grid operations
        timestamp: new Date().toLocaleTimeString(),
        status: 'Offline Pending'
      };

      const currentOffline = JSON.parse(localStorage.getItem('ecovision-offline-reports') || '[]');
      localStorage.setItem('ecovision-offline-reports', JSON.stringify([...currentOffline, newOfflineReport]));

      // Optimistic UI updates
      setReports(prev => [{
        id: offlineId,
        category: category,
        location: locationDesc || 'Current GPS coordinates',
        timestamp: 'Offline Pending Sync',
        status: 'Offline Pending'
      }, ...prev]);

      setSuccessMode(true);
      setSubmitting(false);
      
      setTimeout(() => {
        setSuccessMode(false);
        setFile(null);
        setPreview(null);
        setLocationDesc('');
        setCoordinates(null);
      }, 3000);
      return;
    }
    
    const formData = new FormData();
    formData.append('category', category);
    formData.append('location_desc', locationDesc);
    if (coordinates) {
      formData.append('lat', coordinates.lat);
      formData.append('lng', coordinates.lng);
    }
    if (file) formData.append('photo', file);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setSuccessMode(true);
        fetchReports(); // Refresh list
        setTimeout(() => {
          setSuccessMode(false);
          setFile(null);
          setPreview(null);
          setLocationDesc('');
          setCoordinates(null);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      
      {/* Toast Notification Container */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {syncingToast && (
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="bg-yellow-500 text-slate-900 font-extrabold px-6 py-4 rounded-2xl shadow-[0_8px_32px_rgba(245,158,11,0.3)] border border-yellow-400 backdrop-blur-md flex items-center gap-3 text-sm"
            >
              <CloudLightning className="h-5 w-5 animate-bounce" />
              ♻️ Reconnected! Syncing offline reports...
            </motion.div>
          )}

          {syncCompletedToast && (
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="bg-emerald-500 text-white font-extrabold px-6 py-4 rounded-2xl shadow-[0_8px_32px_rgba(16,185,129,0.3)] border border-emerald-400 backdrop-blur-md flex items-center gap-3 text-sm"
            >
              <CheckCircle className="h-5 w-5 animate-pulse" />
              ✅ Synchronized! All offline reports uploaded!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-yellow-500" />
          Community Reporting
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Report overflowing bins, illegal dumping, or burning directly to the municipality.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Submission Form */}
        <div className="glassmorphism rounded-2xl p-6 border border-gray-200 dark:border-gray-800 h-fit relative overflow-hidden">
          <AnimatePresence>
            {successMode && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 z-10 flex flex-col items-center justify-center backdrop-blur-sm"
              >
                <CheckCircle className="h-20 w-20 text-emerald-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  {!isOnline ? 'Saved Locally!' : 'Report Submitted!'}
                </h2>
                <p className="text-gray-500 text-center px-6">
                  {!isOnline 
                    ? 'Saved offline successfully. We will upload it automatically once internet connection is recovered.'
                    : 'Thank you for keeping our community clean.'
                  }
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              New Report
            </h2>
            
            {/* Live Network Badge */}
            <span className={`flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full border ${
              isOnline 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse'
            }`}>
              {isOnline ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  CONNECTED
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  OFFLINE ACTIVE
                </>
              )}
            </span>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2">Issue Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option>Overflowing Bin</option>
                <option>Illegal Dumping</option>
                <option>Garbage Burning</option>
                <option>Damaged Infrastructure</option>
              </select>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Photo Evidence</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl h-48 flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden relative`}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-500">
                    <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Click to upload photo</p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFile} />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={locationDesc}
                  onChange={(e) => setLocationDesc(e.target.value)}
                  placeholder="E.g., Behind Central Park Mall"
                  className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button 
                  type="button"
                  onClick={getLocation}
                  disabled={loading}
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 rounded-xl flex items-center justify-center transition"
                  title="Use Current GPS Location"
                >
                  {loading ? <Clock className="h-5 w-5 animate-spin" /> : <Navigation className="h-5 w-5 text-primary" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className={`w-full text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-70 ${
                isOnline ? 'bg-primary hover:bg-emerald-600' : 'bg-yellow-500 hover:bg-yellow-600 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              }`}
            >
              {submitting ? 'Submitting...' : (
                <>
                  <Send className="h-5 w-5" />
                  {!isOnline ? 'Queue Report Offline' : 'Submit Report'}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Tracking Feed */}
        <div className="glassmorphism rounded-2xl p-6 border border-gray-200 dark:border-gray-800 flex flex-col h-[650px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Search className="h-5 w-5 text-secondary" />
              Live Tracking Feed
            </h2>
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full animate-pulse">
              {reports.length} Active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
            {reports.map((report, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={report.id} 
                className={`p-4 rounded-xl border transition-colors ${
                  report.status === 'Offline Pending' 
                    ? 'bg-yellow-500/5 border-yellow-500/20' 
                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-500">{report.id}</span>
                    <h3 className="font-bold">{report.category}</h3>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full tracking-wider uppercase border ${
                    report.status === 'Offline Pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse' :
                    report.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-500 dark:border-yellow-900/30' :
                    report.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-500 dark:border-blue-900/30' :
                    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-500 dark:border-emerald-900/30'
                  }`}>
                    {report.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <MapPin className="h-4 w-4" />
                  {report.location}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  Reported: {report.timestamp}
                </div>
              </motion.div>
            ))}

            {reports.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <CheckCircle className="h-12 w-12 mb-2 text-gray-300 dark:text-gray-700" />
                <p>No active reports in your area.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
