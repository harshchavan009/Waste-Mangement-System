import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

// 3x3 Grid Intersections (Coordinates)
const INTERSECTION_COORDS = [
  [-4, 0.1, -4],
  [0, 0.1, -4],
  [4, 0.1, -4],
  [4, 0.1, 0],
  [0, 0.1, 0],
  [-4, 0.1, 0],
  [-4, 0.1, 4],
  [0, 0.1, 4],
  [4, 0.1, 4],
];

// Garbage Truck Predefined Path (Indices of intersections)
const TRUCK_PATH_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 2, 0];

// Traffic loops
const TRAFFIC_COORDS_1 = [
  [-4, 0.08, -4],
  [4, 0.08, -4],
  [4, 0.08, 4],
  [-4, 0.08, 4],
];

const TRAFFIC_COORDS_2 = [
  [0, 0.08, -4],
  [0, 0.08, 4],
  [4, 0.08, 0],
  [-4, 0.08, 0],
];

// Definition of City Districts with live IoT details
const DISTRICTS = [
  { 
    id: 'downtown', 
    name: 'Downtown Core', 
    cx: -2, 
    cz: -2, 
    waste: 84, 
    status: '🚨 Dispatching Truck', 
    color: '#ef4444', 
    complaints: ['Bin #12 overflow behind Metro station', 'Odour alert on 4th Avenue Mall'], 
    nodeSignal: '99.4%' 
  },
  { 
    id: 'industrial', 
    name: 'Industrial Zone', 
    cx: 2, 
    cz: -2, 
    waste: 58, 
    status: '⏳ Scheduled (Next 2 Hours)', 
    color: '#f59e0b', 
    complaints: ['Metal scrap heap left on sidewalk B', 'Container leak report near Lane 4'], 
    nodeSignal: '97.8%' 
  },
  { 
    id: 'residential', 
    name: 'Residential District', 
    cx: -2, 
    cz: 2, 
    waste: 24, 
    status: '✅ Collected (15m ago)', 
    color: '#10b981', 
    complaints: [], 
    nodeSignal: '98.9%' 
  },
  { 
    id: 'techpark', 
    name: 'Tech Park District', 
    cx: 2, 
    cz: 2, 
    waste: 12, 
    status: '✅ Collected (1 Hour ago)', 
    color: '#06b6d4', 
    complaints: [], 
    nodeSignal: '99.9%' 
  }
];

// District Buildings generator matching clickable districts
function Buildings({ selectedId, setSelectedId, hoveredId, setHoveredId }) {
  const buildings = useMemo(() => {
    const list = [];
    
    DISTRICTS.forEach((district) => {
      // 4 buildings per district block
      const offsets = [
        { x: -0.9, z: -0.9 },
        { x: 0.9, z: -0.9 },
        { x: -0.9, z: 0.9 },
        { x: 0.9, z: 0.9 },
      ];

      offsets.forEach((offset, oIdx) => {
        const h = Math.random() * 2.3 + 1.2;
        const w = Math.random() * 0.4 + 0.8;
        const d = Math.random() * 0.4 + 0.8;
        
        list.push({
          districtId: district.id,
          position: [district.cx + offset.x, h / 2, district.cz + offset.z],
          args: [w, h, d],
          color: '#1e293b',
          windowColor: district.color,
          hasSensor: oIdx === 0, // Top mast for IoT
        });
      });
    });

    return list;
  }, []);

  return (
    <group>
      {buildings.map((b, i) => {
        const isSelected = selectedId === b.districtId;
        const isHovered = hoveredId === b.districtId;

        return (
          <group 
            key={i} 
            position={b.position}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredId(b.districtId);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHoveredId(null);
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(b.districtId);
            }}
          >
            {/* Main Building Mesh */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={b.args} />
              <meshStandardMaterial 
                color={isSelected ? '#1e3a8a' : isHovered ? '#334155' : b.color} 
                metalness={0.7} 
                roughness={isSelected ? 0.1 : 0.3} 
              />
            </mesh>

            {/* Glowing Windows (Fake neon layers) */}
            <mesh position={[0, 0, b.args[2] / 2 + 0.01]}>
              <planeGeometry args={[b.args[0] * 0.7, b.args[1] * 0.7]} />
              <meshStandardMaterial 
                color={b.windowColor} 
                emissive={b.windowColor} 
                emissiveIntensity={isSelected ? 1.8 : isHovered ? 1.3 : 0.6} 
                transparent 
                opacity={0.35} 
                wireframe
              />
            </mesh>

            {/* IoT Sensor Mast */}
            {b.hasSensor && (
              <SensorWave position={[0, b.args[1] / 2 + 0.05, 0]} color={b.windowColor} isSelected={isSelected} />
            )}
          </group>
        );
      })}
    </group>
  );
}

function SensorWave({ position, color, isSelected }) {
  const ringRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ringRef.current) {
      const scale = 1 + (t * 2.2 % 3);
      ringRef.current.scale.set(scale, scale, 1);
      ringRef.current.material.opacity = 1 - (t * 2.2 % 3) / 3;
    }
  });

  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Sensor Mast */}
      <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} />
      </mesh>
      
      {/* Pulsing IoT Node */}
      <mesh position={[0, 0, 0.25]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 4 : 2} />
      </mesh>

      {/* Expanding Telemetry Wave */}
      <mesh ref={ringRef} position={[0, 0, 0.25]}>
        <ringGeometry args={[0.1, 0.15, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function FloatingMarkers({ selectedId, setSelectedId, setHoveredId }) {
  return (
    <group>
      {DISTRICTS.map((district) => (
        <Html 
          key={district.id} 
          position={[district.cx, 3.3, district.cz]} 
          center 
          distanceFactor={9}
        >
          <div 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(district.id);
            }}
            onMouseEnter={() => setHoveredId(district.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`w-7 h-7 flex items-center justify-center rounded-full border shadow-2xl transition-all duration-300 transform hover:scale-125 cursor-pointer pointer-events-auto ${
              district.waste >= 80 ? 'bg-red-500/90 text-white animate-bounce border-red-400' :
              district.waste >= 50 ? 'bg-amber-500/90 text-white border-amber-400' :
              'bg-emerald-500/90 text-white border-emerald-400'
            } ${selectedId === district.id ? 'ring-4 ring-cyan-400 scale-110' : ''}`}
          >
            <span className="text-[11px] font-black font-mono">
              {district.waste >= 80 ? '⚠️' : district.waste >= 50 ? '📊' : '✓'}
            </span>
          </div>
        </Html>
      ))}
    </group>
  );
}

function SmartBins() {
  const bins = useMemo(() => [
    { pos: [-3.8, 0.15, -2], color: '#ef4444' },
    { pos: [-2, 0.15, -3.8], color: '#f59e0b' },
    { pos: [3.8, 0.15, -2], color: '#10b981' },
    { pos: [2, 0.15, 3.8], color: '#ef4444' },
    { pos: [-3.8, 0.15, 2], color: '#10b981' },
    { pos: [2, 0.15, -3.8], color: '#f59e0b' },
  ], []);

  return (
    <group>
      {bins.map((bin, i) => (
        <group key={i} position={bin.pos}>
          {/* Smart Bin Cylindrical Geometry */}
          <mesh castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.3, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Glowing Status Indicator */}
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.04, 16]} />
            <meshStandardMaterial color={bin.color} emissive={bin.color} emissiveIntensity={3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function RouteLine() {
  const points = useMemo(() => {
    return TRUCK_PATH_INDICES.map(idx => {
      const c = INTERSECTION_COORDS[idx];
      return new THREE.Vector3(c[0], c[1] + 0.02, c[2]);
    });
  }, []);

  return (
    <Line points={points} color="#10b981" lineWidth={3} />
  );
}

function Traffic() {
  const car1Ref = useRef();
  const car2Ref = useRef();

  const trafficPath1 = useMemo(() => TRAFFIC_COORDS_1.map(c => new THREE.Vector3(...c)), []);
  const trafficPath2 = useMemo(() => TRAFFIC_COORDS_2.map(c => new THREE.Vector3(...c)), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Car 1 (Outer Ring loop)
    if (car1Ref.current) {
      const speed = 0.8;
      const totalDist = trafficPath1.length;
      const progress = (t * speed) % totalDist;
      const currentIdx = Math.floor(progress);
      const nextIdx = (currentIdx + 1) % totalDist;
      const frac = progress - currentIdx;
      
      const pos = new THREE.Vector3().lerpVectors(trafficPath1[currentIdx], trafficPath1[nextIdx], frac);
      car1Ref.current.position.copy(pos);
      
      // Face movement direction
      const dir = new THREE.Vector3().subVectors(trafficPath1[nextIdx], trafficPath1[currentIdx]).normalize();
      car1Ref.current.rotation.y = Math.atan2(dir.x, dir.z);
    }

    // Car 2 (Crossroad loop)
    if (car2Ref.current) {
      const speed = 1.2;
      const totalDist = trafficPath2.length;
      const progress = (t * speed) % totalDist;
      const currentIdx = Math.floor(progress);
      const nextIdx = (currentIdx + 1) % totalDist;
      const frac = progress - currentIdx;
      
      const pos = new THREE.Vector3().lerpVectors(trafficPath2[currentIdx], trafficPath2[nextIdx], frac);
      car2Ref.current.position.copy(pos);
      
      const dir = new THREE.Vector3().subVectors(trafficPath2[nextIdx], trafficPath2[currentIdx]).normalize();
      car2Ref.current.rotation.y = Math.atan2(dir.x, dir.z);
    }
  });

  return (
    <group>
      {/* Car 1 */}
      <mesh ref={car1Ref} castShadow>
        <boxGeometry args={[0.2, 0.12, 0.35]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1.5} />
      </mesh>
      
      {/* Car 2 */}
      <mesh ref={car2Ref} castShadow>
        <boxGeometry args={[0.2, 0.12, 0.35]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

function GarbageTruck() {
  const truckRef = useRef();

  const truckPath = useMemo(() => TRUCK_PATH_INDICES.map(idx => new THREE.Vector3(...INTERSECTION_COORDS[idx])), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const speed = 0.4; // steady collection pace
    const totalDist = truckPath.length;
    const progress = (t * speed) % totalDist;
    const currentIdx = Math.floor(progress);
    const nextIdx = (currentIdx + 1) % totalDist;
    const frac = progress - currentIdx;
    
    if (truckRef.current) {
      const pos = new THREE.Vector3().lerpVectors(truckPath[currentIdx], truckPath[nextIdx], frac);
      truckRef.current.position.copy(pos);
      
      // Face movement direction
      const dir = new THREE.Vector3().subVectors(truckPath[nextIdx], truckPath[currentIdx]).normalize();
      if (dir.lengthSq() > 0.001) {
        truckRef.current.rotation.y = Math.atan2(dir.x, dir.z);
      }
    }
  });

  return (
    <group ref={truckRef}>
      {/* Chassis */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[0.26, 0.12, 0.5]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.18, 0.15]} castShadow>
        <boxGeometry args={[0.22, 0.14, 0.18]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Green Container */}
      <mesh position={[0, 0.2, -0.12]} castShadow>
        <boxGeometry args={[0.24, 0.18, 0.28]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
      </mesh>
      {/* Beacon Light */}
      <mesh position={[0, 0.26, 0.15]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={3} />
      </mesh>
    </group>
  );
}

function CityInfrastructure() {
  return (
    <group>
      {/* Dark Floor / Ground Grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.9} />
      </mesh>

      {/* Grid Lines */}
      <gridHelper args={[20, 20, "#1e293b", "#0f172a"]} position={[0, 0, 0]} />

      {/* Main Roads Grid Layout (visual planes) */}
      {/* Horizontal Roads */}
      {[-4, 0, 4].map((z) => (
        <mesh key={`hroad-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, z]} receiveShadow>
          <planeGeometry args={[18, 0.8]} />
          <meshStandardMaterial color="#111827" roughness={0.8} />
        </mesh>
      ))}
      
      {/* Vertical Roads */}
      {[-4, 0, 4].map((x) => (
        <mesh key={`vroad-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, 0]} receiveShadow>
          <planeGeometry args={[0.8, 18]} />
          <meshStandardMaterial color="#111827" roughness={0.8} />
        </mesh>
      ))}

      {/* Road Centerlines */}
      {[-4, 0, 4].map((z) => (
        <gridHelper key={`hroad-line-${z}`} args={[18, 18, "#f59e0b", "#f59e0b"]} position={[0, 0.02, z]} />
      ))}
    </group>
  );
}

export default function CityScene3D() {
  const [selectedId, setSelectedId] = useState('downtown');
  const [hoveredId, setHoveredId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const selectedDistrict = useMemo(() => {
    return DISTRICTS.find(d => d.id === selectedId) || DISTRICTS[0];
  }, [selectedId]);

  const handleAction = (action) => {
    setToastMessage(`SUCCESS: Triggered "${action}" for ${selectedDistrict.name}!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="w-full h-full min-h-[500px] relative bg-slate-950 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl flex flex-col md:flex-row">
      
      {/* Toast Alert Indicator */}
      {toastMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-emerald-500/90 text-white font-mono text-[11px] font-black px-4 py-2 rounded-full shadow-2xl border border-emerald-400 z-50 animate-bounce tracking-wide">
          {toastMessage}
        </div>
      )}

      {/* 3D WebGL Canvas Viewport */}
      <div className="flex-1 h-[350px] md:h-[500px] relative">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[9, 9, 9]} fov={38} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            maxPolarAngle={Math.PI / 2.1} 
            minDistance={3}
            maxDistance={14}
          />

          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 15, 10]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize-width={1024} 
            shadow-mapSize-height={1024} 
            shadow-bias={-0.001}
          />
          <pointLight position={[-10, 5, -10]} intensity={0.5} color="#0ea5e9" />

          <group position={[0, -0.5, 0]}>
            <CityInfrastructure />
            <Buildings 
              selectedId={selectedId} 
              setSelectedId={setSelectedId} 
              hoveredId={hoveredId} 
              setHoveredId={setHoveredId} 
            />
            <FloatingMarkers 
              selectedId={selectedId} 
              setSelectedId={setSelectedId} 
              setHoveredId={setHoveredId} 
            />
            <SmartBins />
            <RouteLine />
            <Traffic />
            <GarbageTruck />
          </group>

          <ContactShadows opacity={0.6} scale={15} blur={1.5} far={10} position={[0, -0.51, 0]} />
          <Environment preset="city" />
        </Canvas>

        {/* Live Diagnostics Header Indicator */}
        <div className="absolute top-6 left-6 pointer-events-none">
          <div className="text-[10px] font-mono text-cyan-400 font-black tracking-[0.3em] mb-1">CITY_TELEMETRY_3D</div>
          <div className="text-2xl font-black text-white">INTERACTIVE MAP</div>
          <div className="mt-2 text-xs text-gray-400 bg-black/60 px-3 py-1 rounded-md backdrop-blur border border-gray-800 inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Orbit Controls Enabled
          </div>
        </div>
      </div>

      {/* Premium HTML Interactive Diagnostics Panel */}
      <div className="w-full md:w-80 bg-slate-900/90 backdrop-blur-xl border-t md:border-t-0 md:border-l border-gray-800 p-6 flex flex-col justify-between z-10">
        <div>
          {/* Header */}
          <div className="border-b border-gray-800 pb-4 mb-4">
            <span className="text-[10px] font-mono text-primary font-black uppercase tracking-wider">Active Sector</span>
            <h3 className="text-xl font-extrabold text-white mt-1">{selectedDistrict.name}</h3>
            <span className="text-[11px] text-gray-400 font-mono">IoT Master Node: {selectedDistrict.nodeSignal} Signal</span>
          </div>

          {/* Interactive Metric 1: Waste Levels */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400 font-bold uppercase">Sector Waste Level</span>
              <span className={`text-xs font-mono font-black ${
                selectedDistrict.waste >= 80 ? 'text-red-400' :
                selectedDistrict.waste >= 50 ? 'text-amber-400' : 'text-emerald-400'
              }`}>{selectedDistrict.waste}% CAPACITY</span>
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  selectedDistrict.waste >= 80 ? 'bg-red-500' :
                  selectedDistrict.waste >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${selectedDistrict.waste}%` }}
              />
            </div>
          </div>

          {/* Interactive Metric 2: Collection Status */}
          <div className="mb-5 p-3.5 bg-slate-950/80 rounded-xl border border-gray-800">
            <span className="text-[10px] font-mono text-cyan-400 font-black uppercase tracking-wider block mb-1">Collection Status</span>
            <span className="text-sm text-white font-extrabold">{selectedDistrict.status}</span>
          </div>

          {/* Interactive Metric 3: Active Citizen Complaints */}
          <div className="mb-5">
            <span className="text-xs text-gray-400 font-bold uppercase block mb-2">Active Complaints</span>
            {selectedDistrict.complaints.length === 0 ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <span>✓</span> Zero active sector complaints.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedDistrict.complaints.map((comp, cIdx) => (
                  <div 
                    key={cIdx}
                    className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold flex items-start gap-2 shadow-sm"
                  >
                    <span className="mt-0.5">⚠️</span>
                    <span className="leading-relaxed">{comp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Sector Quick Actions */}
        <div className="border-t border-gray-800 pt-4 flex flex-col gap-2.5">
          <button 
            onClick={() => handleAction('FLEET_DISPATCH')}
            className="w-full py-3 bg-primary text-white rounded-full font-bold text-xs hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 tracking-wider uppercase"
          >
            Dispatch Collection Truck
          </button>
          
          <button 
            onClick={() => handleAction('IOT_NODE_RESET')}
            className="w-full py-3 bg-slate-800 text-gray-300 rounded-full font-bold text-xs hover:bg-slate-700 transition-all border border-gray-700 tracking-wider uppercase"
          >
            Reset IoT Telemetry Nodes
          </button>
        </div>

      </div>

    </div>
  );
}
