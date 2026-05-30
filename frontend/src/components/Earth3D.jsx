import { useState, useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Globe, Shield, RefreshCw, Radio, Database, Flame, CheckCircle, Zap } from 'lucide-react';

const GLOBE_RADIUS = 2;

// Real-world Hotspots mapped onto 3D Coordinates
const HOTSPOTS = [
  { id: 'ny', name: 'New York', lat: 40.7128, lon: -74.0060, density: 8.4, status: 'Warning', color: '#f97316', desc: 'High commercial plastic density' },
  { id: 'mumbai', name: 'Mumbai', lat: 19.0760, lon: 72.8777, density: 14.2, status: 'Critical', color: '#ef4444', desc: 'Critical industrial waste load' },
  { id: 'london', name: 'London', lat: 51.5074, lon: -0.1278, density: 4.1, status: 'Good', color: '#10b981', desc: '94% automated sorting rate' },
  { id: 'tokyo', name: 'Tokyo', lat: 35.6762, lon: 139.6503, density: 11.8, status: 'Critical', color: '#ef4444', desc: 'High electronic waste stream' },
  { id: 'sydney', name: 'Sydney', lat: -33.8688, lon: 151.2093, density: 2.8, status: 'Good', color: '#10b981', desc: 'Zero-waste ocean sanctuary' },
  { id: 'saopaulo', name: 'São Paulo', lat: -23.5505, lon: -46.6333, density: 9.5, status: 'Warning', color: '#f97316', desc: 'Rapid organic waste accumulation' },
  { id: 'cairo', name: 'Cairo', lat: 30.0444, lon: 31.2357, density: 11.2, status: 'Critical', color: '#ef4444', desc: 'High plastic contamination rate' },
  { id: 'joburg', name: 'Johannesburg', lat: -26.2041, lon: 28.0473, density: 6.8, status: 'Warning', color: '#f97316', desc: 'Moderate metals collection lag' }
];

// Helper to convert Lat/Long to 3D Cartesian coordinates on a Sphere
function latLongToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));

  return new THREE.Vector3(x, y, z);
}

// 3D Connecting Bezier Arcs (IoT Streams)
function BezierArc({ startCoord, endCoord, activeLayer }) {
  const points = useMemo(() => {
    const startVec = latLongToVector3(startCoord.lat, startCoord.lon, GLOBE_RADIUS);
    const endVec = latLongToVector3(endCoord.lat, endCoord.lon, GLOBE_RADIUS);
    
    // Extrude midpoint outward to create volumetric arc height
    const midVec = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
    const dist = startVec.distanceTo(endVec);
    midVec.normalize().multiplyScalar(GLOBE_RADIUS + dist * 0.45);

    const curve = new THREE.QuadraticBezierCurve3(startVec, midVec, endVec);
    return curve.getPoints(32);
  }, [startCoord, endCoord]);

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  
  // Set glow color based on current layer
  const color = activeLayer === 'pollution' ? '#ef4444' : (activeLayer === 'recycling' ? '#10b981' : '#06b6d4');

  return (
    <line geometry={geometry}>
      <lineBasicMaterial 
        attach="material" 
        color={color} 
        transparent 
        opacity={activeLayer === 'iot' ? 0.6 : 0.25} 
        linewidth={activeLayer === 'iot' ? 2 : 1}
      />
    </line>
  );
}

// Volumetric Heatmap Spikes & Pulsing Rings
function HeatmapNodes({ activeLayer, selectedNode, setSelectedNode }) {
  const groupRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Slow global rotation aligned with core globe
      groupRef.current.rotation.y = t * 0.04;
    }
  });

  const nodes = useMemo(() => {
    return HOTSPOTS.map(h => {
      const surfacePos = latLongToVector3(h.lat, h.lon, GLOBE_RADIUS + 0.01);
      // Spikes point outward radially from center
      const normal = surfacePos.clone().normalize();
      
      // Calculate rotation matrix so spikes align straight out from Earth's center
      const up = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);

      return {
        ...h,
        position: surfacePos,
        quaternion: quaternion,
        normal: normal
      };
    });
  }, []);

  return (
    <group ref={groupRef}>
      {nodes.map((node) => {
        // Dynamic size/color mapping based on active Layer
        let height = 0.1;
        let color = '#06b6d4'; // default IoT blue

        if (activeLayer === 'pollution') {
          // Polluted nodes stand tall and neon red/orange
          height = node.density * 0.08;
          color = node.status === 'Critical' ? '#ef4444' : (node.status === 'Warning' ? '#f97316' : '#10b981');
        } else if (activeLayer === 'recycling') {
          // Clean/Green nodes stand tall and green
          height = node.status === 'Good' ? 0.9 : 0.25;
          color = node.status === 'Good' ? '#10b981' : '#475569';
        } else {
          // IoT Grid node heights
          height = 0.35;
          color = '#06b6d4';
        }

        const isSelected = selectedNode?.id === node.id;
        const finalHeight = isSelected ? height * 1.4 : height;

        return (
          <group 
            key={node.id} 
            position={node.position.toArray()} 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNode(node);
            }}
          >
            {/* Volumetric Neon Spike */}
            <group quaternion={node.quaternion}>
              <mesh position={[0, finalHeight / 2, 0]} castShadow>
                <cylinderGeometry args={[0.02, 0.04, finalHeight, 12]} />
                <meshBasicMaterial 
                  color={color} 
                  transparent 
                  opacity={0.85} 
                />
              </mesh>
              {/* Floating Glowing Top Pointer */}
              <mesh position={[0, finalHeight, 0]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshBasicMaterial color={color} />
              </mesh>
            </group>

            {/* Glowing Surface Heatwave Radiation rings */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <ringGeometry args={[0.06, isSelected ? 0.22 : 0.14, 16]} />
              <meshBasicMaterial 
                color={color} 
                transparent 
                opacity={isSelected ? 0.6 : 0.25} 
                side={THREE.DoubleSide} 
              />
            </mesh>
            <pointLight color={color} intensity={isSelected ? 2 : 0.8} distance={1.5} />
          </group>
        );
      })}
    </group>
  );
}

// Tech Globe Shell & Textures
function GlobeModel({ activeLayer }) {
  const globeRef = useRef();
  const wireframeRef = useRef();
  const earthMap = useTexture('/earth-dark.jpg');

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (globeRef.current) {
      globeRef.current.rotation.y = t * 0.04;
    }
    if (wireframeRef.current) {
      // Counter-rotate wireframe layer for a cool parallax volumetric tech feel
      wireframeRef.current.rotation.y = -t * 0.015;
    }
  });

  return (
    <group>
      {/* Volumetric Atmosphere glow layer */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS + 0.16, 64, 64]} />
        <meshBasicMaterial 
          color={activeLayer === 'pollution' ? '#f97316' : (activeLayer === 'recycling' ? '#10b981' : '#0ea5e9')} 
          transparent 
          opacity={0.06} 
          side={THREE.BackSide} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Core Tech Globe */}
      <mesh ref={globeRef} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial 
          map={earthMap}
          color="#cbd5e1"
          metalness={0.65} 
          roughness={0.45} 
        />
        
        {/* Holographic Wireframe shell overlay */}
        <mesh ref={wireframeRef}>
          <sphereGeometry args={[GLOBE_RADIUS + 0.012, 40, 40]} />
          <meshBasicMaterial 
            color={activeLayer === 'pollution' ? '#ef4444' : '#334155'} 
            wireframe 
            transparent 
            opacity={activeLayer === 'pollution' ? 0.08 : 0.12} 
          />
        </mesh>
      </mesh>
    </group>
  );
}

export default function Earth3D() {
  const [activeLayer, setActiveLayer] = useState('pollution'); // pollution, recycling, iot
  const [selectedNode, setSelectedNode] = useState(HOTSPOTS[1]); // Default Mumbai

  // Map IoT active streams to connect hotspots
  const iotConnections = useMemo(() => {
    return [
      { start: HOTSPOTS[0], end: HOTSPOTS[2] }, // NY -> London
      { start: HOTSPOTS[1], end: HOTSPOTS[3] }, // Mumbai -> Tokyo
      { start: HOTSPOTS[2], end: HOTSPOTS[6] }, // London -> Cairo
      { start: HOTSPOTS[3], end: HOTSPOTS[4] }, // Tokyo -> Sydney
      { start: HOTSPOTS[5], end: HOTSPOTS[0] }, // São Paulo -> NY
      { start: HOTSPOTS[7], end: HOTSPOTS[1] }  // Joburg -> Mumbai
    ];
  }, []);

  return (
    <div className="grid lg:grid-cols-4 gap-6 p-6 glassmorphism rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden bg-[#070b19]/80 min-h-[480px]">
      {/* Interactive Controls Left Panel */}
      <div className="lg:col-span-1 flex flex-col gap-5 z-10">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-widest uppercase mb-1 flex items-center gap-1.5">
            <Zap className="h-4.5 w-4.5 text-cyan-400 animate-pulse" /> Planetary Dashboard
          </span>
          <h2 className="text-xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            AI Heatmap Globe
          </h2>
          <p className="text-xs text-gray-400 mt-1">Global waste density and automated sorting footprint monitoring</p>
        </div>

        {/* View Layer Selector Buttons */}
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveLayer('pollution')}
            className={`px-4 py-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 transition border ${
              activeLayer === 'pollution' 
                ? 'bg-red-500/10 border-red-500/50 text-red-400 shadow-lg shadow-red-500/5' 
                : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Flame className="h-4.5 w-4.5 text-red-500" />
            Highly Polluted Zones
          </button>
          <button 
            onClick={() => setActiveLayer('recycling')}
            className={`px-4 py-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 transition border ${
              activeLayer === 'recycling' 
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/5' 
                : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
            Recycling Carbon Sinks
          </button>
          <button 
            onClick={() => setActiveLayer('iot')}
            className={`px-4 py-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 transition border ${
              activeLayer === 'iot' 
                ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-lg shadow-cyan-500/5' 
                : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Radio className="h-4.5 w-4.5 text-cyan-400" />
            IoT Telemetry Grid
          </button>
        </div>

        {/* Dynamic Telemetry Console Overlay */}
        {selectedNode && (
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-3 mt-auto shadow-inner backdrop-blur-md">
            <div className="flex justify-between items-start">
               <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                 <Globe className="h-4.5 w-4.5 text-cyan-400 animate-spin" /> {selectedNode.name}
               </h3>
               <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                 selectedNode.status === 'Critical' ? 'bg-red-500/10 text-red-500' :
                 (selectedNode.status === 'Warning' ? 'bg-orange-500/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500')
               }`}>
                 {selectedNode.status.toUpperCase()}
               </span>
            </div>
            
            <p className="text-xs text-gray-400 leading-relaxed font-semibold">{selectedNode.desc}</p>
            
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-800 text-xs">
              <div>
                <div className="text-gray-500 text-[10px] uppercase font-bold">Waste Index</div>
                <div className="font-bold text-lg font-mono text-white mt-0.5">{selectedNode.density.toFixed(1)} <span className="text-[10px] text-gray-500">t/km²</span></div>
              </div>
              <div>
                <div className="text-gray-500 text-[10px] uppercase font-bold">Grid Coords</div>
                <div className="font-semibold text-gray-300 mt-1 font-mono">{selectedNode.lat.toFixed(1)}°N, {selectedNode.lon.toFixed(1)}°E</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Volumetric 3D Interactive Canvas Viewport */}
      <div className="lg:col-span-3 h-[420px] lg:h-full relative rounded-2xl overflow-hidden bg-[#050917]/60 border border-white/5 cursor-grab active:cursor-grabbing shadow-inner">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 0, 6.8]} fov={45} />
          
          <ambientLight intensity={0.35} />
          <directionalLight position={[6, 8, 5]} intensity={1.5} castShadow />
          <pointLight position={[-6, -4, -6]} intensity={0.4} color="#06b6d4" />
          
          <Suspense fallback={null}>
            <group rotation={[0.2, 0, 0]}>
              {/* Dynamic Core Globe */}
              <GlobeModel activeLayer={activeLayer} />

              {/* Spikes and rings aligned with real coordinates */}
              <HeatmapNodes 
                activeLayer={activeLayer} 
                selectedNode={selectedNode} 
                setSelectedNode={setSelectedNode} 
              />

              {/* Render dynamic Bezier connection arcs */}
              {iotConnections.map((conn, idx) => (
                <BezierArc 
                  key={idx} 
                  startCoord={conn.start} 
                  endCoord={conn.end} 
                  activeLayer={activeLayer} 
                />
              ))}
            </group>
          </Suspense>

          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            autoRotate 
            autoRotateSpeed={0.4} 
          />
          <Environment preset="city" />
        </Canvas>

        {/* Canvas Bottom-Right Legend */}
        <div className="absolute bottom-4 right-4 z-10 bg-black/40 backdrop-blur-md p-3.5 rounded-xl border border-white/10 pointer-events-none text-[10px] font-bold space-y-1.5">
           <div className="text-gray-400 uppercase tracking-widest text-[8px] mb-1 font-mono">Legend</div>
           <div className="flex items-center gap-2 text-white">
              <div className="w-2.5 h-2.5 rounded bg-red-500 shadow-[0_0_8px_#ef4444]"></div> Critical Pollution (Hotspot)
           </div>
           <div className="flex items-center gap-2 text-white">
              <div className="w-2.5 h-2.5 rounded bg-orange-500 shadow-[0_0_8px_#f97316]"></div> Moderate Industrial Accumulation
           </div>
           <div className="flex items-center gap-2 text-white">
              <div className="w-2.5 h-2.5 rounded bg-emerald-500 shadow-[0_0_8px_#10b981]"></div> Clean Eco-Recycling Hubs
           </div>
        </div>
      </div>
    </div>
  );
}
