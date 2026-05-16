import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
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
