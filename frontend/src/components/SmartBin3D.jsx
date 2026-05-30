import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedDustbin({ isLidOpen, setIsLidOpen, fillLevel, activeItemType, dropActive, setDropActive }) {
  const lidGroupRef = useRef();
  const scannerRef = useRef();
  const wasteRef = useRef();
  const fillBarRef = useRef();
  const innerGlowRef = useRef();
  const floatingWasteRef = useRef();

  const scanMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#10b981',
    emissive: '#10b981',
    emissiveIntensity: 2,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide
  }), []);

  const wasteMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: activeItemType === 'hazardous' ? '#ef4444' : '#10b981',
    roughness: 0.5,
    metalness: 0.8,
  }), [activeItemType]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 1. Interactive Lid Rotation Spring
    const targetLidAngle = isLidOpen ? -Math.PI / 1.7 : 0;
    if (lidGroupRef.current) {
      lidGroupRef.current.rotation.x = THREE.MathUtils.lerp(lidGroupRef.current.rotation.x, targetLidAngle, 0.15);
    }

    // 2. Continuous bobbing for active scanner
    if (scannerRef.current) {
      if (dropActive) {
        scannerRef.current.visible = true;
        scannerRef.current.position.y = 3.0 + Math.sin(t * 10) * 0.3;
        scannerRef.current.scale.setScalar(1 + Math.sin(t * 20) * 0.05);
      } else {
        scannerRef.current.visible = false;
      }
    }

    // 3. Falling waste physics simulation
    if (floatingWasteRef.current) {
      if (dropActive) {
        floatingWasteRef.current.visible = true;
        // Simulates drop sequence
        if (floatingWasteRef.current.position.y > 0.5) {
          floatingWasteRef.current.position.y -= 0.12;
          floatingWasteRef.current.rotation.y += 0.08;
          floatingWasteRef.current.rotation.x += 0.05;
          floatingWasteRef.current.scale.setScalar(THREE.MathUtils.lerp(floatingWasteRef.current.scale.x, 0.3, 0.1));
        } else {
          // Finished dropping
          setDropActive(false);
          floatingWasteRef.current.visible = false;
          floatingWasteRef.current.position.y = 3.6;
          floatingWasteRef.current.scale.setScalar(1);
        }
      } else {
        floatingWasteRef.current.visible = false;
      }
    }

    // 4. Fill Bar & Volumetric Waste level matching
    if (fillBarRef.current) {
      fillBarRef.current.scale.y = THREE.MathUtils.lerp(fillBarRef.current.scale.y, Math.max(0.01, fillLevel), 0.1);
      fillBarRef.current.position.y = fillBarRef.current.scale.y / 2 - 1.25;
      
      const fillMat = fillBarRef.current.material;
      if (fillLevel > 0.8) {
        fillMat.color.set('#ef4444');
        fillMat.emissive.set('#ef4444');
      } else if (fillLevel > 0.5) {
        fillMat.color.set('#f59e0b');
        fillMat.emissive.set('#f59e0b');
      } else {
        fillMat.color.set('#10b981');
        fillMat.emissive.set('#10b981');
      }
    }

    // Dynamic interior lighting level
    if (innerGlowRef.current) {
      innerGlowRef.current.intensity = isLidOpen ? 2.5 : 0.5;
    }
  });

  return (
    <group position={[0, -0.2, 0]}>
      {/* 1. Translucent High-Tech Smart Glass Bin Body */}
      <mesh 
        position={[0, 0, 0]} 
        castShadow 
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          setIsLidOpen(!isLidOpen);
        }}
      >
        <cylinderGeometry args={[1.2, 1.0, 2.5, 32]} />
        <meshStandardMaterial 
          color="#0f172a" 
          transparent 
          opacity={0.35} 
          metalness={0.9} 
          roughness={0.05} 
          envMapIntensity={2}
        />
      </mesh>

      {/* Internal volumetric rising fill block */}
      <mesh position={[0, (fillLevel * 2.3) / 2 - 1.25, 0]}>
        <cylinderGeometry args={[1.15 * fillLevel, 0.95, Math.max(0.05, fillLevel * 2.3), 32]} />
        <meshStandardMaterial 
          color={fillLevel > 0.8 ? '#ef4444' : fillLevel > 0.5 ? '#f59e0b' : '#10b981'} 
          transparent 
          opacity={0.7} 
          roughness={0.3} 
          emissive={fillLevel > 0.8 ? '#ef4444' : fillLevel > 0.5 ? '#f59e0b' : '#10b981'}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Outer neon reinforcement structural brackets */}
      <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.25, 1.25, 0.1, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
      </mesh>
      
      <mesh position={[0, -1.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.05, 1.05, 0.1, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Emissive high-tech rim */}
      <mesh position={[0, 1.28, 0]}>
        <torusGeometry args={[1.21, 0.02, 16, 64]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1} />
      </mesh>

      {/* Interactive Floating / Falling Waste Object */}
      <mesh ref={floatingWasteRef} position={[0, 3.6, 0]} castShadow>
        <dodecahedronGeometry args={[0.35, 1]} />
        <primitive object={wasteMaterial} />
      </mesh>

      {/* Holographic scanning plane grid */}
      <group ref={scannerRef} position={[0, 3.0, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8, 0.04, 16, 64]} />
          <primitive object={scanMaterial} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.8, 32]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.3} transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Internal Emissive Glow */}
      <pointLight ref={innerGlowRef} position={[0, 0.8, 0]} intensity={0.5} distance={4} color={fillLevel > 0.8 ? '#ef4444' : '#10b981'} />

      {/* Volumetric Fill indicator strip on bin wall */}
      <mesh position={[0, 0, 1.22]}>
        <boxGeometry args={[0.2, 1.8, 0.05]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      <mesh ref={fillBarRef} position={[0, 0, 1.25]}>
        <boxGeometry args={[0.12, 1.8, 0.03]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2} />
      </mesh>

      {/* Interactive Hinged Lid Assembly */}
      <group position={[0, 1.3, -1.15]} ref={lidGroupRef}>
        <mesh 
          position={[0, 0, 1.15]} 
          castShadow 
          receiveShadow
          onClick={(e) => {
            e.stopPropagation();
            setIsLidOpen(!isLidOpen);
          }}
        >
          <cylinderGeometry args={[1.22, 1.22, 0.15, 32]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.09, 1.15]}>
          <torusGeometry args={[0.7, 0.02, 16, 64]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1.5} />
        </mesh>
      </group>
    </group>
  );
}

export default function SmartBin3D() {
  const [isLidOpen, setIsLidOpen] = useState(false);
  const [fillLevel, setFillLevel] = useState(0.35); // 35% starting fill
  const [activeItemType, setActiveItemType] = useState('recyclable');
  const [dropActive, setDropActive] = useState(false);

  const handleAddWaste = (type) => {
    if (dropActive) return;
    setActiveItemType(type);
    setIsLidOpen(true);

    // Sequence mechanical operations
    setTimeout(() => {
      setDropActive(true);
      // Wait for it to hit target, then fill
      setTimeout(() => {
        setFillLevel(prev => Math.min(1.0, prev + 0.15));
      }, 700);
    }, 400);
  };

  const handleReset = () => {
    setFillLevel(0.01);
    setIsLidOpen(false);
  };

  return (
    <div className="w-full relative bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col md:flex-row h-[600px] md:h-[500px]">
      
      {/* 3D Canvas Viewport */}
      <div className="flex-1 h-[320px] md:h-full relative">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[3.5, 3.5, 5]} fov={45} />
          <OrbitControls enableZoom={true} enablePan={false} maxPolarAngle={Math.PI / 2.1} />
          
          <ambientLight intensity={0.4} />
          <spotLight position={[5, 10, 5]} angle={0.4} penumbra={1} castShadow intensity={2} />
          <pointLight position={[-5, 5, -5]} intensity={0.8} color="#3b82f6" />
          
          <AnimatedDustbin 
            isLidOpen={isLidOpen} 
            setIsLidOpen={setIsLidOpen} 
            fillLevel={fillLevel}
            activeItemType={activeItemType}
            dropActive={dropActive}
            setDropActive={setDropActive}
          />

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.45, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>

          <ContactShadows opacity={0.6} scale={6} blur={2.5} far={10} position={[0, -1.44, 0]} />
          <Environment preset="city" />
        </Canvas>

        {/* HUD Info Label overlay */}
        <div className="absolute top-6 left-6 pointer-events-none">
          <div className="text-[10px] font-mono text-primary font-black tracking-[0.3em] mb-1">INTERACTIVE_3D_MODEL</div>
          <div className="text-xl font-black text-white">SMART RECON BIN</div>
          <div className="mt-2 text-[10px] text-gray-400 bg-black/60 px-3 py-1 rounded-full border border-gray-800/80 inline-block font-mono">
            {isLidOpen ? '🔓 LID_OPENED' : '🔒 LID_LOCKED'}
          </div>
        </div>

        {/* Floating Instruction */}
        <div className="absolute bottom-4 left-6 pointer-events-none">
          <p className="text-[10px] text-gray-500 font-mono">👉 Swipe screen to rotate | Pinch to zoom</p>
        </div>
      </div>

      {/* Side Touch Panel Controls */}
      <div className="w-full md:w-80 bg-slate-900 border-t md:border-t-0 md:border-l border-gray-800 p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">Volumetric Fill</span>
            <span className={`text-xl font-black font-mono ${
              fillLevel > 0.8 ? 'text-red-500 animate-pulse' : fillLevel > 0.5 ? 'text-yellow-500' : 'text-primary'
            }`}>
              {Math.round(fillLevel * 100)}%
            </span>
          </div>

          {/* Glowing Fill Bar Gauge */}
          <div className="w-full h-3 bg-gray-950 rounded-full overflow-hidden border border-gray-800 mb-6 relative">
            <div 
              className={`h-full transition-all duration-500 ${
                fillLevel > 0.8 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 
                fillLevel > 0.5 ? 'bg-yellow-500 shadow-[0_0_10px_#f59e0b]' : 
                'bg-primary shadow-[0_0_10px_#10b981]'
              }`}
              style={{ width: `${fillLevel * 100}%` }}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2 font-mono">Interactive Actions</h3>
            
            {/* Action buttons */}
            <button 
              onClick={() => setIsLidOpen(!isLidOpen)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-3 px-4 rounded-xl border border-gray-700 transition flex justify-between items-center"
            >
              <span>Toggle Lid Assembly</span>
              <span className="text-[10px] font-mono bg-gray-950 px-2.5 py-0.5 rounded text-gray-400">
                {isLidOpen ? 'CLOSE' : 'OPEN'}
              </span>
            </button>

            <button 
              onClick={() => handleAddWaste('recyclable')}
              disabled={dropActive || fillLevel >= 0.95}
              className="w-full bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-bold py-3 px-4 rounded-xl border border-emerald-900/50 transition flex justify-between items-center disabled:opacity-50"
            >
              <span>Drop Recyclable Can</span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                +15%
              </span>
            </button>

            <button 
              onClick={() => handleAddWaste('hazardous')}
              disabled={dropActive || fillLevel >= 0.95}
              className="w-full bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold py-3 px-4 rounded-xl border border-red-900/50 transition flex justify-between items-center disabled:opacity-50"
            >
              <span>Drop Hazardous Can</span>
              <span className="text-[10px] font-mono bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                +15%
              </span>
            </button>
          </div>
        </div>

        <button 
          onClick={handleReset}
          className="w-full bg-gray-950 hover:bg-red-900/30 text-gray-400 hover:text-red-400 text-xs font-bold py-3 px-4 rounded-xl border border-gray-800 hover:border-red-900/50 transition mt-6 font-mono"
        >
          ♻️ RESET BIN FILL LEVEL
        </button>
      </div>

    </div>
  );
}
