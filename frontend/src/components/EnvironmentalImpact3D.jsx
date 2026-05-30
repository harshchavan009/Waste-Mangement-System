import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Leaf, AlertTriangle, ShieldCheck, Sun, CloudRain } from 'lucide-react';

// Single low-poly modular Tree with procedural growth
function GrowableTree({ position, growth }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    // Elegant swaying animation in the wind
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.z = Math.sin(t + position[0]) * 0.03 * growth;
    groupRef.current.rotation.x = Math.cos(t + position[2]) * 0.02 * growth;
  });

  // Calculate dynamic scale based on growth (0.1 seedlings to 1.25 lush trees)
  const baseScale = 0.15 + (growth * 1.1);

  return (
    <group ref={groupRef} position={position} scale={[baseScale, baseScale, baseScale]}>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.14, 1.0, 8]} />
        <meshStandardMaterial color="#5c3818" roughness={0.9} />
      </mesh>
      {/* Foliage - Layer 1 */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <coneGeometry args={[0.45, 0.9, 6]} />
        <meshStandardMaterial color="#10b981" roughness={0.65} flatShading />
      </mesh>
      {/* Foliage - Layer 2 */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <coneGeometry args={[0.35, 0.7, 6]} />
        <meshStandardMaterial color="#34d399" roughness={0.65} flatShading />
      </mesh>
      {/* Foliage - Layer 3 */}
      <mesh position={[0, 2.0, 0]} castShadow>
        <coneGeometry args={[0.22, 0.5, 6]} />
        <meshStandardMaterial color="#6ee7b7" roughness={0.65} flatShading />
      </mesh>
    </group>
  );
}

// Low-poly modular Factory building with smokestacks
function Factory({ pollution }) {
  return (
    <group position={[-2.5, 0, -2.5]}>
      {/* Main warehouse block */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 1.2, 1.5]} />
        <meshStandardMaterial color="#4b5563" roughness={0.8} />
      </mesh>
      {/* Triangular roof */}
      <mesh position={[0, 1.4, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[1.1, 1.1, 1.52]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.7} />
      </mesh>
      {/* Smokestack 1 */}
      <mesh position={[-0.4, 1.5, 0.4]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 1.6, 8]} />
        <meshStandardMaterial color="#374151" roughness={0.9} />
      </mesh>
      {/* Smokestack 2 */}
      <mesh position={[0.4, 1.5, -0.4]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 1.6, 8]} />
        <meshStandardMaterial color="#374151" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Procedural Volumetric Smog/Pollution Particle Cloud
function SmogParticles({ pollution }) {
  const count = 35;
  const particles = useMemo(() => {
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push({
        speedY: Math.random() * 0.02 + 0.015,
        speedX: (Math.random() - 0.5) * 0.01,
        speedZ: (Math.random() - 0.5) * 0.01,
        seed: Math.random() * 100,
        // Start scattered at different heights
        offsetY: Math.random() * 3.5,
      });
    }
    return list;
  }, []);

  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      // Float upward and cycle
      child.position.y += p.speedY;
      child.position.x += Math.sin(time + p.seed) * 0.005 + p.speedX;
      child.position.z += Math.cos(time + p.seed) * 0.005 + p.speedZ;

      // Wrap-around boundary
      if (child.position.y > 4.5) {
        child.position.y = 1.6;
        child.position.x = -2.5 + (Math.random() - 0.5) * 0.4;
        child.position.z = -2.5 + (Math.random() - 0.5) * 0.4;
      }

      // Pulse size gently
      const scale = 0.35 + Math.sin(time * 2 + p.seed) * 0.08;
      child.scale.set(scale, scale, scale);
    });
  });

  return (
    <group ref={groupRef} visible={pollution > 0.05}>
      {particles.map((_, i) => (
        <mesh key={i} position={[-2.5, 1.6, -2.5]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial 
            color="#475569" 
            transparent 
            opacity={pollution * 0.65} 
            roughness={0.9}
            metalness={0.0}
          />
        </mesh>
      ))}
    </group>
  );
}

// Main Interactive Visualizer Canvas Wrapper
export default function EnvironmentalImpact3D() {
  const [recyclingRate, setRecyclingRate] = useState(60); // 10% (barren) to 100% (paradise)

  // Memoize tree coordinates coordinates so they remain stationary during growth
  const treePositions = useMemo(() => [
    [1.8, 0, 1.5],
    [0.8, 0, 2.2],
    [2.3, 0, 0.4],
    [-0.5, 0, 1.8],
    [0.2, 0, 0.8],
    [2.0, 0, 2.3],
    [1.1, 0, -0.6],
    [-1.8, 0, 1.2],
    [-0.9, 0, 2.4],
    [0.5, 0, -1.8],
    [2.4, 0, -1.4],
    [1.5, 0, -2.1]
  ], []);

  // Compute pollution intensity (inverse of recycling rate)
  const pollution = Math.max(0, (100 - recyclingRate) / 90); // 0 (clean) to 1.0 (heavy pollution)
  const growth = Math.min(1.0, recyclingRate / 100); // 0.1 to 1.0 growth scaling

  // Dynamic sky haze color: brown haze at low recycling, vivid sky blue at high
  const skyColor = useMemo(() => {
    const r = Math.round(10 + (224 * growth)); // vivid cyan/emerald shift
    const g = Math.round(15 + (242 * growth));
    const b = Math.round(20 + (254 * growth));
    return `rgb(${r}, ${g}, ${b})`;
  }, [growth]);

  // Dynamic terrain turf grass color: dry greyish brown at low, rich emerald at high
  const terrainColor = useMemo(() => {
    const dry = [120, 110, 90]; // barren soil
    const lush = [16, 185, 129]; // emerald grass
    const r = Math.round(dry[0] + (lush[0] - dry[0]) * growth);
    const g = Math.round(dry[1] + (lush[1] - dry[1]) * growth);
    const b = Math.round(dry[2] + (lush[2] - dry[2]) * growth);
    return `rgb(${r}, ${g}, ${b})`;
  }, [growth]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
      
      {/* 1. Left controls panel */}
      <div className="flex flex-col justify-between w-full lg:w-1/3 gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 mb-3 border border-emerald-500/20">
            <Leaf className="h-3.5 w-3.5 animate-pulse" />
            3D Eco Simulator
          </span>
          <h2 className="text-2xl font-black tracking-tight mb-2">3D Environmental Impact</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Slide the interactive widget to watch how scaling recycling rates instantly reclaims the local landscape.
          </p>
        </div>

        {/* Dynamic Diagnostics */}
        <div className="space-y-4">
          {/* Recycling efficiency widget */}
          <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500">RECYCLING RATE</span>
              <span className="text-lg font-black text-emerald-500">{recyclingRate}%</span>
            </div>
            <input 
              type="range"
              min="10"
              max="100"
              value={recyclingRate}
              onChange={(e) => setRecyclingRate(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-2">
              <span>10% CRITICAL</span>
              <span>100% PARADISE</span>
            </div>
          </div>

          {/* Environmental telemetry nodes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
              <span className="text-[10px] font-bold text-gray-400 block mb-1">SMOG LAYER</span>
              <span className={`text-sm font-black flex items-center gap-1.5 ${pollution > 0.6 ? 'text-red-500' : pollution > 0.25 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                {pollution > 0.6 ? <AlertTriangle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                {(pollution * 100).toFixed(0)}% Smog
              </span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
              <span className="text-[10px] font-bold text-gray-400 block mb-1">BIOMASS CANOPY</span>
              <span className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
                <Leaf className="h-4 w-4" />
                {(growth * 100).toFixed(0)}% Growth
              </span>
            </div>
          </div>
        </div>

        {/* Narrative indicator depending on level */}
        <div className="p-4 bg-gray-50 dark:bg-emerald-950/20 rounded-2xl border border-gray-100 dark:border-emerald-500/20 text-xs text-gray-600 dark:text-gray-400">
          {recyclingRate < 35 && (
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
              <p><span className="font-bold text-red-400">Dystopian Alert:</span> Acid smog clouds cover the sky. Heavy factory exhausts exhaust soil minerals. Plant trees immediately by collecting and recycling bins!</p>
            </div>
          )}
          {recyclingRate >= 35 && recyclingRate < 75 && (
            <div className="flex gap-2">
              <CloudRain className="h-5 w-5 text-cyan-400 shrink-0" />
              <p><span className="font-bold text-cyan-400">Industrial Transition:</span> Air quality indexes are stabilizing. Tree saplings are rooting. Optimize waste collection pipelines to scale canopy growth.</p>
            </div>
          )}
          {recyclingRate >= 75 && (
            <div className="flex gap-2">
              <Sun className="h-5 w-5 text-emerald-400 shrink-0" />
              <p><span className="font-bold text-emerald-400">Ecological Equilibrium:</span> Fully clean, zero-exhaust carbon-neutral paradise. Lush forest floor successfully restored. Exceptional ecological performance.</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Right Canvas Simulation */}
      <div className="flex-1 h-[420px] lg:h-[480px] bg-slate-900 rounded-2xl overflow-hidden relative border border-gray-800">
        
        {/* Dynamic environmental backlighting backdrop overlay inside the React layout */}
        <div 
          className="absolute inset-0 transition-colors duration-1000 opacity-20 pointer-events-none"
          style={{ backgroundColor: skyColor }}
        />

        <Canvas camera={{ position: [0, 4, 6], fov: 45 }} shadowMap>
          <color attach="background" args={['#0f172a']} />
          <ambientLight intensity={0.35 + (growth * 0.45)} />
          <directionalLight 
            position={[4, 7, 5]} 
            intensity={1.0 + (growth * 1.0)} 
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.001}
          />
          {/* Dynamic Sunlight Flare Shaft for high ecological health */}
          <pointLight 
            position={[-4, 5, -4]} 
            intensity={growth * 1.5} 
            color="#34d399" 
          />

          {/* Grassy Ground Terrain */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial 
              color={terrainColor} 
              roughness={0.9} 
            />
          </mesh>

          {/* 3. Render Factory component */}
          <Factory pollution={pollution} />

          {/* 4. Emit Volumetric Exhaust Smokestacks particles */}
          <SmogParticles pollution={pollution} />

          {/* 5. Render multiple Growable Trees coordinates */}
          {treePositions.map((pos, idx) => (
            <GrowableTree 
              key={idx} 
              position={pos} 
              growth={growth} 
            />
          ))}

          {/* Soft Shadow effects */}
          <ContactShadows 
            position={[0, -0.02, 0]} 
            opacity={0.65} 
            scale={12} 
            blur={1.8} 
            far={10} 
          />

          <OrbitControls 
            enableDamping 
            dampingFactor={0.05} 
            maxPolarAngle={Math.PI / 2 - 0.05}
            minDistance={4}
            maxDistance={9}
          />
        </Canvas>

        {/* Interactive Floating Status Pin overlay */}
        <div className="absolute top-4 right-4 bg-slate-950/70 border border-gray-800 backdrop-blur-md rounded-xl p-3 font-mono text-[9px] text-white flex flex-col gap-1 pointer-events-none">
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-bold text-gray-400">BIOME_INF_LAYER: ACTIVE</span>
          </div>
          <div>FOREST HEIGHT: {(growth * 100).toFixed(0)}%</div>
          <div>CO2 ABSORPTION: {(growth * 3.5).toFixed(1)} T/YR</div>
        </div>
      </div>

    </div>
  );
}
