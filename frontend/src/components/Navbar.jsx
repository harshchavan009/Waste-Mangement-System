import { Link } from 'react-router-dom';
import { Sun, Moon, Recycle, Menu, X, User, Globe, Bell, Shield, Radio, Terminal, Trash2 } from 'lucide-react';
import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from '../context/LanguageContext';

const NAV_DICT = {
  English: { home: "Home", classify: "AI Classification", dash: "Dashboard", bins: "Smart Bins", routes: "Routes", fleet: "Fleet", forecast: "AI Forecast", cctv: "Live CCTV", report: "Report Issue", rewards: "Rewards", market: "EcoToken Market", login: "Login" },
  Hindi: { home: "होम", classify: "AI वर्गीकरण", dash: "डैशबोर्ड", bins: "स्मार्ट डिब्बे", routes: "मार्ग", fleet: "बेड़ा", forecast: "AI पूर्वानुमान", cctv: "लाइव CCTV", report: "समस्या दर्ज करें", rewards: "इनाम", market: "इकोटोकन बाजार", login: "लॉग इन" },
  Marathi: { home: "मुख्यपृष्ठ", classify: "AI वर्गीकरण", dash: "डॅशबोर्ड", bins: "स्मार्ट डबे", routes: "मार्ग", fleet: "ताफा", forecast: "AI अंदाज", cctv: "थेट CCTV", report: "समस्या नोंदवा", rewards: "बक्षिसे", market: "इकोटोकन बाजार", login: "लॉगिन" },
  Spanish: { home: "Inicio", classify: "Clasificación IA", dash: "Panel", bins: "Contenedores", routes: "Rutas", fleet: "Flota", forecast: "Pronóstico IA", cctv: "CCTV en vivo", report: "Reportar", rewards: "Recompensas", market: "Mercado Eco", login: "Acceder" }
};

export default function Navbar({ darkMode, toggleDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { language, setLanguage } = useContext(LanguageContext);
  
  const [showFCM, setShowFCM] = useState(false);
  const [fcmLogs, setFcmLogs] = useState([
    "FCM_CLIENT_SDK: Firebase Cloud Messaging initialised.",
    "FCM_CLIENT_SDK: Socket channels listening for triggers..."
  ]);

  const addFcmLog = (msg) => {
    const timestamp = new Date().toLocaleTimeString();
    setFcmLogs(prev => [`[${timestamp}] ${msg}`, ...prev]);
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      addFcmLog(`NOTIFICATION_PERMISSION: State update -> ${permission.toUpperCase()}`);
      if (permission === 'granted') {
        new Notification("EcoVision AI Command Center", {
          body: "FCM Push Notifications are now synced and active!",
          icon: "/icon-192.png"
        });
      }
    } else {
      addFcmLog("ERR_PUSH: Geolocation/Notification browser sandbox restricted.");
    }
  };

  const triggerFCMAlert = (type) => {
    let payload = {};
    let notificationTitle = "";
    let notificationBody = "";

    if (type === 'bin_full') {
      payload = {
        to: "fcm_device_token_client_42",
        notification: {
          title: "🚨 CRITICAL BIN ALERT",
          body: "Smart Bin #104 (Soho Sector B) has reached 98% capacity! Dispatching crew."
        },
        data: {
          type: "bin_full",
          binId: "Soho-104",
          fill_rate: "98%",
          priority: "CRITICAL"
        }
      };
    } else if (type === 'pickup_reminder') {
      payload = {
        to: "fcm_device_token_client_42",
        notification: {
          title: "♻️ PICKUP REMINDER",
          body: "EcoVision Truck #42 is 10 minutes away from your location. Place bins out!"
        },
        data: {
          type: "pickup_reminder",
          truckId: "Truck-42",
          eta: "10 mins"
        }
      };
    } else if (type === 'complaint_update') {
      payload = {
        to: "fcm_device_token_client_42",
        notification: {
          title: "✅ COMPLAINT RESOLVED",
          body: "Overflowing Bin complaint #REP-492 (Central Park) has been successfully resolved!"
        },
        data: {
          type: "complaint_update",
          reportId: "REP-492",
          status: "Resolved"
        }
      };
    }

    notificationTitle = payload.notification.title;
    notificationBody = payload.notification.body;

    addFcmLog(`FCM_BROADCAST: Sending encrypted socket feed to FCM server...`);
    
    setTimeout(() => {
      addFcmLog(`FCM_RECEIVE: Delivered! Payload: ${JSON.stringify(payload.data)}`);
      
      if ("Notification" in window && Notification.permission === 'granted') {
        new Notification(notificationTitle, {
          body: notificationBody,
          icon: "/icon-192.png",
          badge: "/icon-192.png"
        });
      } else {
        addFcmLog(`FALLBACK_ALERT: "${notificationTitle}" - ${notificationBody}`);
      }
    }, 600);
  };
  
  const t = NAV_DICT[language] || NAV_DICT.English;

  return (
    <nav className="fixed w-full z-50 glassmorphism">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Recycle className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl tracking-tight">EcoVision AI</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-3 text-sm">
              <Link to="/" className="hover:text-primary px-2 py-2 rounded-md font-medium transition-colors">{t.home}</Link>
              <Link to="/classify" className="hover:text-primary px-2 py-2 rounded-md font-medium transition-colors">{t.classify}</Link>
              <Link to="/dashboard" className="hover:text-primary px-2 py-2 rounded-md font-medium transition-colors">{t.dash}</Link>
              <Link to="/bins" className="hover:text-primary px-2 py-2 rounded-md font-medium transition-colors">{t.bins}</Link>
              <Link to="/routes" className="hover:text-primary px-2 py-2 rounded-md font-medium transition-colors">{t.routes}</Link>
              <Link to="/fleet" className="hover:text-primary px-2 py-2 rounded-md font-medium transition-colors text-blue-500">{t.fleet}</Link>
              <Link to="/cctv" className="hover:text-primary px-2 py-2 rounded-md font-medium transition-colors text-red-500 animate-pulse">{t.cctv}</Link>
              <Link to="/report" className="hover:text-primary px-2 py-2 rounded-md font-medium transition-colors">{t.report}</Link>
              <Link to="/rewards" className="hover:text-primary px-2 py-2 rounded-md font-medium transition-colors text-yellow-500 flex items-center gap-1">{t.rewards}</Link>
              <Link to="/marketplace" className="hover:text-primary px-2 py-2 rounded-md font-medium transition-colors text-emerald-500 font-bold border border-emerald-500/30 bg-emerald-500/10">{t.market}</Link>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 relative">
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className="p-2 flex items-center gap-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                <Globe className="h-5 w-5" />
                <span className="text-xs font-bold">{language.substring(0,2).toUpperCase()}</span>
              </button>
              {langOpen && (
                <div className="absolute top-12 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden py-2 w-32">
                  {['English', 'Hindi', 'Marathi', 'Spanish'].map(l => (
                    <button 
                      key={l} 
                      onClick={() => { setLanguage(l); setLangOpen(false); }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/30 ${language === l ? 'font-bold text-emerald-500' : ''}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* FCM Push Notification Bell trigger */}
            <button 
              onClick={() => setShowFCM(true)} 
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition text-yellow-500 relative animate-pulse"
              title="FCM Command Center"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link to="/auth" className="flex items-center gap-2 bg-primary hover:bg-emerald-600 text-white px-4 py-2 rounded-full font-medium transition-transform hover:scale-105 shadow-lg shadow-emerald-500/30">
              <User className="h-4 w-4" />
              {t.login}
            </Link>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden glassmorphism"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium">Home</Link>
              <Link to="/classify" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium">AI Classification</Link>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium">Dashboard</Link>
              <Link to="/bins" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium">Smart Bins</Link>
              <Link to="/routes" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium">{t.routes}</Link>
              <Link to="/fleet" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-blue-500">{t.fleet}</Link>
              <Link to="/forecast" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium">{t.forecast}</Link>
              <Link to="/cctv" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-red-500">Live CCTV</Link>
              <Link to="/report" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium">Report Issue</Link>
              <Link to="/rewards" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-yellow-500">Rewards</Link>
              <Link to="/marketplace" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-emerald-500 bg-emerald-500/10">EcoToken Market</Link>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => { setShowFCM(true); setIsOpen(false); }} 
                  className="p-2 text-yellow-500 relative flex items-center gap-1.5"
                >
                  <Bell className="h-5 w-5 animate-pulse" />
                  <span className="text-xs font-bold">FCM Alert Center</span>
                </button>
                <button onClick={toggleDarkMode} className="p-2">
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <Link to="/auth" onClick={() => setIsOpen(false)} className="bg-primary text-white px-4 py-2 rounded-md font-medium">Login</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FCM PUSH NOTIFICATIONS MODAL CENTER */}
      <AnimatePresence>
        {showFCM && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-darker border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-lg p-6 overflow-hidden shadow-2xl relative"
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowFCM(false)}
                className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center">
                  <Radio className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-gray-900 dark:text-white">FCM Push Commander</h3>
                  <p className="text-xs text-gray-500">Firebase Cloud Messaging Socket Console</p>
                </div>
              </div>

              {/* Status Header */}
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-500" />
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    System Push permissions
                  </span>
                </div>
                <button 
                  onClick={requestNotificationPermission}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] rounded-lg tracking-wider transition-all"
                >
                  REQUEST AUTHORIZATION
                </button>
              </div>

              {/* Fire FCM Triggers */}
              <div className="space-y-3 mb-6">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Broadcaster Triggers</h4>
                
                <button 
                  onClick={() => triggerFCMAlert('bin_full')}
                  className="w-full py-3.5 px-4 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-500 text-xs font-black rounded-xl text-left transition-all active:scale-[0.98] flex justify-between items-center"
                >
                  <span>🚨 Trigger Bin Full Alert</span>
                  <span className="text-[9px] bg-red-500/20 px-2 py-0.5 rounded font-bold uppercase">FCM DATA</span>
                </button>

                <button 
                  onClick={() => triggerFCMAlert('pickup_reminder')}
                  className="w-full py-3.5 px-4 bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 text-blue-500 text-xs font-black rounded-xl text-left transition-all active:scale-[0.98] flex justify-between items-center"
                >
                  <span>♻️ Send Fleet Pickup Reminder</span>
                  <span className="text-[9px] bg-blue-500/20 px-2 py-0.5 rounded font-bold uppercase">FCM DATA</span>
                </button>

                <button 
                  onClick={() => triggerFCMAlert('complaint_update')}
                  className="w-full py-3.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-500 text-xs font-black rounded-xl text-left transition-all active:scale-[0.98] flex justify-between items-center"
                >
                  <span>✅ Push Complaint Status Update</span>
                  <span className="text-[9px] bg-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase">FCM DATA</span>
                </button>
              </div>

              {/* Scrolling FCM Logs */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Terminal className="h-4 w-4" /> Telemetry Socket Logs
                  </h4>
                  <button 
                    onClick={() => setFcmLogs(["FCM_CLIENT_SDK: Socket console cleared."])}
                    className="p-1 hover:text-red-500 text-gray-400 rounded transition"
                    title="Clear Console"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="bg-black/90 dark:bg-black rounded-xl p-3 h-36 font-mono text-[10px] text-gray-300 overflow-y-auto space-y-1.5 custom-scrollbar border border-gray-800">
                  {fcmLogs.map((log, index) => (
                    <div key={index} className={`truncate ${log.includes('ERR') ? 'text-red-400' : log.includes('RECEIVE') ? 'text-cyan-400' : log.includes('BROADCAST') ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
}
