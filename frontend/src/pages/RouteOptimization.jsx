import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, Circle, useMap } from 'react-leaflet';
import { Truck, Navigation, Clock, Fuel, Activity, RadioReceiver, Crosshair, Target, Flame, Eye, EyeOff } from 'lucide-react';
import { Icon, divIcon } from 'leaflet';
import CityScene3D from '../components/CityScene3D';

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

const depotIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2163/2163350.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

const droneIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/919/919932.png',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

const anomalyIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/595/595067.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const completedBinIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3299/3299853.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const center = [40.7250, -73.9950];

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center]);
  return null;
}

export default function RouteOptimization() {
  const [routeData, setRouteData] = useState({ coordinates: [], nodes: [], metrics: null });
  const [truckPos, setTruckPos] = useState(null);
  
  // Phone/Browser GPS tracking state
  const [userGPS, setUserGPS] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsDistance, setGpsDistance] = useState(null);
  const [mapCenter, setMapCenter] = useState(center);

  // Haversine distance formula to calculate nearest distance to Truck #42
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(2); // distance in km
  };

  const syncPhoneGPS = () => {
    setGpsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserGPS([lat, lng]);
          setMapCenter([lat, lng]); // Center map on user location!
          setGpsLoading(false);
        },
        (error) => {
          console.error(error);
          // Fallback mock coordinate (Central Park area) for non-GPS test systems
          const mockUserLat = 40.7290;
          const mockUserLng = -73.9980;
          setUserGPS([mockUserLat, mockUserLng]);
          setMapCenter([mockUserLat, mockUserLng]);
          setGpsLoading(false);
        }
      );
    } else {
      setGpsLoading(false);
    }
  };

  // Recalculate distance between user and active truckPos dynamically
  useEffect(() => {
    if (userGPS && truckPos) {
      const dist = calculateDistance(userGPS[0], userGPS[1], truckPos[0], truckPos[1]);
      setGpsDistance(dist);
    }
  }, [userGPS, truckPos]);
  const [anomalies, setAnomalies] = useState([]);
  const [activeDrone, setActiveDrone] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'sim'
  
  // Custom states for rich 2D tracking animation
  const [truckStatus, setTruckStatus] = useState('Standby'); // Standby, Cruising, Collecting
  const [collectedBins, setCollectedBins] = useState([]); // indices of collected bins
  const collectedBinsRef = useRef([]);
  const [activeDestination, setActiveDestination] = useState('Depot');
  const [fuelSavings, setFuelSavings] = useState('0%');
  
  // Keep ref in sync to avoid stale closures inside the animation loop
  useEffect(() => {
    collectedBinsRef.current = collectedBins;
  }, [collectedBins]);
  
  useEffect(() => {
    fetch('/api/drones/anomalies')
      .then(res => res.json())
      .then(data => {
        const mapped = (data.anomalies || []).map(a => ({
          ...a,
          coords: [a.lat, a.lng],
          location: a.location || `${a.type} Zone`,
          verified: a.status === 'verified'
        }));
        setAnomalies(mapped);
      });

    fetch('/api/pollution/heatmap')
      .then(res => res.json())
      .then(data => setHeatmap(data.hotspots || []));
      
    const fetchRoute = async () => {
      try {
        const response = await fetch('/api/routes/optimize');
        if (response.ok) {
          const data = await response.json();
          if (data.coordinates && data.coordinates.length > 0) {
            setRouteData(data);
            if (!truckPos) setTruckPos(data.coordinates[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch optimized route:", error);
      }
    };
    
    fetchRoute();
    const interval = setInterval(fetchRoute, 5000);
    return () => clearInterval(interval);
  }, []);

  // Smooth path-sliding animation with smart-bin pickup stops
  useEffect(() => {
    if (!routeData.coordinates || routeData.coordinates.length < 2) return;
    
    let path = routeData.coordinates;
    let nodeNames = routeData.nodes;
    let currentSegment = 0;
    let step = 0;
    const stepsPerSegment = 40; // High count for butter-smooth sliding
    let animationInterval = null;
    
    setFuelSavings(routeData.metrics?.fuel_saved || '24.2%');
    
    const animate = () => {
      const nextSegment = (currentSegment + 1) % path.length;
      const start = path[currentSegment];
      const end = path[nextSegment];
      const destName = nodeNames[nextSegment] || 'Next Intersect';
      
      setActiveDestination(destName);
      
      // Smart Stop: If reached a new segment node, is a Smart Bin (not Depot), and is not yet cleared
      if (step === 0 && nodeNames[currentSegment] !== 'Depot' && !collectedBinsRef.current.includes(currentSegment)) {
        setTruckStatus('Collecting');
        clearInterval(animationInterval);
        
        // Halt to collect waste for 2.5 seconds, clear the bin, then resume cruising
        setTimeout(() => {
          setCollectedBins(prev => [...prev, currentSegment]);
          setTruckStatus('Cruising');
          step = 1;
          animationInterval = setInterval(animate, 45); // resume movement loop
        }, 2500);
        return;
      }
      
      // Perform linear interpolation of coordinates
      const lat = start[0] + (end[0] - start[0]) * (step / stepsPerSegment);
      const lng = start[1] + (end[1] - start[1]) * (step / stepsPerSegment);
      setTruckPos([lat, lng]);
      setTruckStatus('Cruising');
      
      step++;
      if (step > stepsPerSegment) {
        step = 0;
        currentSegment = nextSegment;
      }
    };
    
    animationInterval = setInterval(animate, 45);
    return () => {
      clearInterval(animationInterval);
    };
  }, [routeData]);

  const dispatchDrone = (anomaly) => {
    let currentPos = [...center];
    setActiveDrone({ pos: currentPos, target: anomaly, status: 'Flying' });

    const steps = 40;
    const latStep = (anomaly.coords[0] - center[0]) / steps;
    const lngStep = (anomaly.coords[1] - center[1]) / steps;
    let stepCount = 0;

    const flyInterval = setInterval(() => {
      if (stepCount >= steps) {
        clearInterval(flyInterval);
        setActiveDrone({ pos: anomaly.coords, target: anomaly, status: 'Scanning' });
        
        setTimeout(() => {
           setAnomalies(prev => prev.map(a => a.id === anomaly.id ? { ...a, verified: true } : a));
           setActiveDrone(null);
        }, 3000);
      } else {
        currentPos = [currentPos[0] + latStep, currentPos[1] + lngStep];
        setActiveDrone({ pos: currentPos, target: anomaly, status: 'Flying' });
        stepCount++;
      }
    }, 50);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            AI Route Optimization
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Dijkstra's shortest path with AI traffic prediction</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {/* 2D / 3D Simulation Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setViewMode('map')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              2D Map
            </button>
            <button 
              onClick={() => setViewMode('sim')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'sim' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              3D Sim
            </button>
          </div>

          <div className="flex gap-2">
            <div className="glassmorphism px-4 py-2 rounded-lg flex items-center gap-2 border border-emerald-500/30">
              <Fuel className="h-5 w-5 text-emerald-500" />
              <span className="font-semibold text-sm">Fuel Saved: <span className="text-emerald-500 font-bold">{routeData.metrics?.fuel_saved || '0%'}</span></span>
            </div>
            <div className="glassmorphism px-4 py-2 rounded-lg flex items-center gap-2 border border-primary/30">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">Time Saved: <span className="text-primary font-bold">{routeData.metrics?.time_saved || '0 mins'}</span></span>
            </div>
          </div>
          
          {viewMode === 'map' && (
            <>
              <button 
                onClick={syncPhoneGPS}
                disabled={gpsLoading}
                className={`glassmorphism px-4 py-2 rounded-lg flex items-center gap-2 border transition-all ${userGPS ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-gray-300 dark:border-gray-700 text-gray-500 hover:text-gray-200'}`}
              >
                <Navigation className={`h-5 w-5 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span className="font-semibold text-sm">{userGPS ? 'GPS Linked' : 'Sync My GPS'}</span>
              </button>
              <button 
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`glassmorphism px-4 py-2 rounded-lg flex items-center gap-2 border transition-all ${showHeatmap ? 'border-orange-500 bg-orange-500/10 text-orange-500' : 'border-gray-300 dark:border-gray-700 text-gray-500'}`}
              >
                {showHeatmap ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                <span className="font-semibold text-sm">Pollution Heatmap</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-grow grid lg:grid-cols-4 gap-6 h-full pb-6">
        {/* Main View Container (2D Map or 3D City Simulation) */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden glassmorphism border border-gray-200 dark:border-gray-800 shadow-xl relative z-0">
          {viewMode === 'map' ? (
            <div className="relative w-full h-full">
              {/* Live Telemetry HUD Overlay */}
              <div className="absolute top-4 left-4 z-[1000] glassmorphism p-4 rounded-2xl border border-white/20 dark:border-gray-700/50 max-w-[240px] shadow-2xl backdrop-blur-md pointer-events-auto bg-white/75 dark:bg-darker/75">
                 <div className="text-[10px] font-mono text-primary font-bold tracking-widest uppercase mb-1">Telemetry HUD</div>
                 <h4 className="text-sm font-black flex items-center gap-1.5 text-gray-900 dark:text-white">
                   <Truck className="h-4 w-4 text-emerald-500 animate-bounce" /> Live Fleet Tracking
                 </h4>
                 
                 <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800/50 pb-1.5">
                       <span className="text-gray-500 dark:text-gray-400">Status:</span>
                       <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                         truckStatus === 'Collecting' 
                           ? 'bg-yellow-500/10 text-yellow-500 animate-pulse' 
                           : 'bg-emerald-500/10 text-emerald-500'
                       }`}>
                         {truckStatus === 'Collecting' ? 'COLLECTING' : 'CRUISING'}
                       </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800/50 pb-1.5">
                       <span className="text-gray-500 dark:text-gray-400">Target Node:</span>
                       <span className="font-bold text-gray-800 dark:text-gray-200 truncate max-w-[120px]">{activeDestination}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800/50 pb-1.5">
                       <span className="text-gray-500 dark:text-gray-400">CO2 / Fuel:</span>
                       <span className="font-bold text-emerald-500">{fuelSavings} Saved</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-gray-500 dark:text-gray-400">AI Pathing:</span>
                       <span className="font-bold text-primary font-mono text-[10px]">DIJKSTRA TSP</span>
                    </div>
                 </div>
              </div>

              <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                <ChangeView center={mapCenter} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                
                {/* Draw nodes */}
                {routeData.coordinates.map((pos, idx) => (
                  <Marker 
                    key={`node-${idx}`} 
                    position={pos} 
                    icon={routeData.nodes[idx] === 'Depot' ? depotIcon : (collectedBins.includes(idx) ? completedBinIcon : binIcon)}
                  >
                    <Popup>
                      <div className="text-center font-bold">
                         <div>{routeData.nodes[idx]}</div>
                         {routeData.nodes[idx] !== 'Depot' && (
                           <div className={`text-xs mt-1 ${collectedBins.includes(idx) ? 'text-emerald-500' : 'text-red-500'}`}>
                             Status: {collectedBins.includes(idx) ? '♻️ Cleared' : '🚨 Full - Pending Collection'}
                           </div>
                         )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
                
                {/* Live Truck Tracker */}
                {truckPos && (
                  <Marker position={truckPos} icon={truckIcon} zIndexOffset={1000}>
                    <Popup>
                       <div className="text-center">
                          <div className="font-bold text-primary">EcoVision Truck #42</div>
                          <div className={`text-xs font-semibold mt-1 ${truckStatus === 'Collecting' ? 'text-yellow-500 animate-pulse' : 'text-emerald-500'}`}>
                            {truckStatus === 'Collecting' ? '♻️ Collecting Waste...' : `⚡ Cruising to ${activeDestination}`}
                          </div>
                       </div>
                    </Popup>
                  </Marker>
                )}

                {/* Pollution Heatmap Layer */}
                {showHeatmap && heatmap.map((spot, idx) => (
                  <Circle
                    key={`heat-${idx}`}
                    center={[spot.lat, spot.lng]}
                    radius={200 + (spot.intensity * 300)}
                    pathOptions={{
                      fillColor: spot.intensity > 0.7 ? '#ef4444' : spot.intensity > 0.4 ? '#f97316' : '#eab308',
                      color: 'transparent',
                      fillOpacity: 0.4
                    }}
                  >
                    <Popup>
                      <div className="text-center font-bold">
                        <div className="text-orange-500">{spot.label}</div>
                        <div className="text-xs text-gray-500">Pollution Intensity: {(spot.intensity * 100).toFixed(0)}%</div>
                      </div>
                    </Popup>
                  </Circle>
                ))}

                {/* Anomalies */}
                {anomalies.map((anomaly) => (
                  <Marker key={anomaly.id} position={anomaly.coords} icon={anomalyIcon}>
                    <Popup>{anomaly.type} - {anomaly.verified ? 'Verified' : 'Unverified'}</Popup>
                  </Marker>
                ))}

                {/* Live Drone Tracker */}
                {activeDrone && (
                  <>
                    <Marker position={activeDrone.pos} icon={droneIcon} zIndexOffset={2000}>
                      <Popup>Recon Drone (Status: {activeDrone.status})</Popup>
                    </Marker>
                    {activeDrone.status === 'Scanning' && (
                      <CircleMarker 
                        center={activeDrone.pos} 
                        radius={30} 
                        pathOptions={{ color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 0.2 }} 
                        className="animate-ping"
                      />
                    )}
                  </>
                )}

                {/* Phone GPS Live Location markers */}
                {userGPS && (
                  <>
                    <CircleMarker 
                      center={userGPS} 
                      radius={12} 
                      pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.3 }} 
                    />
                    <CircleMarker 
                      center={userGPS} 
                      radius={6} 
                      pathOptions={{ color: '#ffffff', fillColor: '#3b82f6', fillOpacity: 1, weight: 2 }} 
                    >
                      <Popup>
                        <div className="text-center font-bold">
                          <span className="text-blue-500">📍 You Are Here!</span>
                          {gpsDistance && <div className="text-xs text-gray-500 mt-1">Nearest truck is {gpsDistance} km away</div>}
                        </div>
                      </Popup>
                    </CircleMarker>
                  </>
                )}

                {/* Dijkstra Path Polyline */}
                {routeData.coordinates.length > 0 && (
                  <Polyline 
                    positions={routeData.coordinates} 
                    color="#10b981" 
                    weight={6} 
                    opacity={0.8} 
                  />
                )}
              </MapContainer>

              {/* GPS Tracker Distance Banner Overlay */}
              {userGPS && gpsDistance && (
                <div className="absolute bottom-4 left-4 z-[1000] glassmorphism p-4 rounded-2xl border border-blue-500/30 bg-slate-900/90 text-white max-w-[280px] shadow-2xl flex items-center gap-3 animate-bounce">
                  <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Navigation className="h-5 w-5 text-blue-400 rotate-45" />
                  </div>
                  <div>
                    <h5 className="font-black text-xs uppercase tracking-wider text-blue-400">GPS Tracker Synced</h5>
                    <p className="text-xs font-bold text-gray-200 mt-0.5">
                      Nearest truck is <span className="text-blue-300 font-extrabold">{gpsDistance} km</span> away.
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">ETA: ~{(parseFloat(gpsDistance) * 3).toFixed(1)} mins</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <CityScene3D />
          )}
        </div>

        {/* Sidebar Info */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          <div className="p-5 glassmorphism rounded-2xl">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-secondary" />
              AI Route Metrics
            </h3>
            <div className="space-y-4">
               <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 mb-1">Algorithm</div>
                  <div className="font-bold text-primary">Dijkstra Shortest Path</div>
               </div>
               <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 mb-1">Traffic Congestion</div>
                  <div className="font-bold text-yellow-500 animate-pulse">Moderate (Dynamic)</div>
               </div>
            </div>
          </div>

          <div className="p-5 glassmorphism rounded-2xl flex-grow">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Navigation className="h-5 w-5 text-primary" />
              Current Dispatch
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-gray-500">Route Distance</span>
                <span className="font-bold">{routeData.metrics?.distance || '0 km'}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-gray-500">Critical Bins Target</span>
                <span className="font-bold text-red-500">{routeData.metrics?.bins_collected || 0}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-gray-500">Fleet Active</span>
                <span className="font-bold text-emerald-500">Truck #42</span>
              </div>
            </div>
          </div>

          {/* Drone Recon Panel */}
          <div className="p-5 glassmorphism rounded-2xl flex-grow mt-4 border border-cyan-500/20 bg-cyan-500/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <RadioReceiver className="h-20 w-20 text-cyan-500" />
             </div>
             <h3 className="font-bold flex items-center gap-2 mb-4 text-cyan-500">
               <Crosshair className="h-5 w-5" />
               Drone Reconnaissance
             </h3>
             <div className="space-y-3 relative z-10">
               {anomalies.map(anomaly => (
                 <div key={anomaly.id} className="bg-white/50 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                          <span className="text-xs font-bold bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full uppercase">{anomaly.type}</span>
                          <div className="text-sm font-semibold mt-1">{anomaly.location}</div>
                       </div>
                       {anomaly.verified ? (
                         <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">VERIFIED</span>
                       ) : (
                         <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md">UNVERIFIED</span>
                       )}
                    </div>
                    {!anomaly.verified && (
                       <button 
                         onClick={() => dispatchDrone(anomaly)}
                         disabled={activeDrone !== null}
                         className={`w-full mt-2 py-1.5 text-xs font-bold rounded-lg transition-all ${
                           activeDrone !== null 
                             ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                             : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                         }`}
                       >
                         {activeDrone?.target.id === anomaly.id ? 'DRONE DISPATCHED' : 'Dispatch Recon Drone'}
                       </button>
                    )}
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
