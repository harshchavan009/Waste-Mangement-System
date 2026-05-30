import { useState, useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Line, Center } from '@react-three/drei';
import * as THREE from 'three';
import { Play, Pause, FastForward, RotateCcw, AlertTriangle, Cpu, TrendingUp, HelpCircle, HardHat, Award } from 'lucide-react';

// Predefined waste categories and characteristics
const MATERIAL_TYPES = [
  { id: 'plastic', name: 'PET Plastic', color: '#0ea5e9', binColor: '#0284c7', emissive: '#0ea5e9', shape: 'cylinder', binX: -3 },
  { id: 'metal', name: 'Aluminium Can', color: '#f59e0b', binColor: '#d97706', emissive: '#f59e0b', shape: 'box', binX: 0 },
  { id: 'organic', name: 'Organic Waste', color: '#10b981', binColor: '#059669', emissive: '#10b981', shape: 'sphere', binX: 3 }
];

// Conveyor dimensions
const BELT_LENGTH = 16;
const BELT_Y = 0.5;

// Robotic Arm Component
function RoboticArm({ targetItem, onGrabSuccess }) {
  const baseRef = useRef();
  const upperArmRef = useRef();
  const forearmRef = useRef();
  const clawRef = useRef();

  // Kinematic parameters
  const basePos = [0, BELT_Y + 0.5, -2]; // Rotates at base
  const armLength1 = 1.8;
  const armLength2 = 1.5;

  const [state, setState] = useState('Idle'); // Idle, Reaching, Grabbing, Sorting, Returning
  const grabTimeRef = useRef(0);
  const targetPosRef = useRef(new THREE.Vector3());
  const grabPosRef = useRef(new THREE.Vector3());

  useFrame((clockState) => {
    const t = clockState.clock.getElapsedTime();

    if (!baseRef.current || !upperArmRef.current || !forearmRef.current) return;

    let target = new THREE.Vector3(0, BELT_Y + 1.2, -2.5); // Default idle rest position

    if (targetItem) {
      if (state === 'Idle') {
        setState('Reaching');
      }
      
      // Update target coordinate dynamically based on moving item position
      if (state === 'Reaching' || state === 'Grabbing') {
        target.copy(targetItem.position);
        target.y += 0.2; // Hover slightly above item center
      }
    }

    // State machine for Sorting Arm
    if (state === 'Reaching' && targetItem) {
      // Smoothly interpolate joints to target
      targetPosRef.current.lerp(target, 0.2);
      
      // Check if claw is close enough to grab
      const dist = targetPosRef.current.distanceTo(target);
      if (dist < 0.2) {
        setState('Grabbing');
        grabTimeRef.current = t;
      }
    } else if (state === 'Grabbing') {
      // Hold grip position for 0.2s
      targetPosRef.current.copy(target);
      if (t - grabTimeRef.current > 0.2) {
        setState('Sorting');
        grabTimeRef.current = t;
        onGrabSuccess(); // Trigger item attached state
      }
    } else if (state === 'Sorting' && targetItem) {
      // Swing toward correct category bin
      const binX = targetItem.meta.binX;
      const binTarget = new THREE.Vector3(binX, BELT_Y + 1.8, -1.8);
      targetPosRef.current.lerp(binTarget, 0.15);

      const dist = targetPosRef.current.distanceTo(binTarget);
      if (dist < 0.25) {
        setState('Returning');
        grabTimeRef.current = t;
      }
    } else if (state === 'Returning') {
      // Return back to Rest base position
      const restTarget = new THREE.Vector3(0, BELT_Y + 1.2, -2.5);
      targetPosRef.current.lerp(restTarget, 0.15);

      const dist = targetPosRef.current.distanceTo(restTarget);
      if (dist < 0.2) {
        setState('Idle');
      }
    } else {
      // Rest / Idle Position
      const restTarget = new THREE.Vector3(0, BELT_Y + 1.2, -2.5);
      targetPosRef.current.lerp(restTarget, 0.05);
    }

    // Kinematic Joint Rotation Solver (FABRIK approximation)
    const localTarget = targetPosRef.current.clone().sub(new THREE.Vector3(...basePos));
    
    // Rotate base toward target
    const angleBase = Math.atan2(localTarget.x, localTarget.z);
    baseRef.current.rotation.y = angleBase;

    // Pitch shoulder & elbow toward target height/distance
    const distance2D = Math.sqrt(localTarget.x * localTarget.x + localTarget.z * localTarget.z);
    const height = localTarget.y;

    // Simple geometric trig for joints
    const d = Math.sqrt(distance2D * distance2D + height * height);
    if (d > 0.1) {
      const cosElbow = (d * d - armLength1 * armLength1 - armLength2 * armLength2) / (2 * armLength1 * armLength2);
      const angleElbow = Math.acos(Math.max(-1, Math.min(1, cosElbow)));
      
      const angleShoulder = Math.atan2(height, distance2D) - 
        Math.atan2(armLength2 * Math.sin(angleElbow), armLength1 + armLength2 * Math.cos(angleElbow));

      upperArmRef.current.rotation.x = -angleShoulder + Math.PI / 2;
      forearmRef.current.rotation.x = angleElbow;
    }
  });

  return (
    <group position={basePos}>
      {/* Structural Base */}
      <mesh castShadow>
        <cylinderGeometry args={[0.6, 0.8, 0.4, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Rotating Shoulder Base */}
      <group ref={baseRef}>
        <mesh castShadow position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.4, 16]} />
          <meshStandardMaterial color="#f43f5e" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Upper Arm Segment */}
        <group ref={upperArmRef} position={[0, 0.5, 0]}>
          <mesh castShadow position={[0, armLength1 / 2, 0]}>
            <cylinderGeometry args={[0.18, 0.18, armLength1, 16]} />
            <meshStandardMaterial color="#3b82f6" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh castShadow position={[0, armLength1, 0]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color="#f43f5e" />
          </mesh>

          {/* Forearm Segment */}
          <group ref={forearmRef} position={[0, armLength1, 0]}>
            <mesh castShadow position={[0, armLength2 / 2, 0]}>
              <cylinderGeometry args={[0.12, 0.12, armLength2, 16]} />
              <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
            </mesh>

            {/* Claw / End Effector */}
            <group ref={clawRef} position={[0, armLength2, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[0.18, 16, 16]} />
                <meshStandardMaterial color="#f43f5e" />
              </mesh>
              {/* Animated sorting beam/glowing claw tip */}
              <pointLight color="#f43f5e" intensity={1} distance={2} />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

// Volumetric Laser Scanner Arch
function ScannerArch() {
  const laserRef = useRef();

  useFrame((state) => {
    // Pulsate laser opacity for scanning visual effect
    const t = state.clock.getElapsedTime();
    if (laserRef.current) {
      laserRef.current.material.opacity = 0.2 + Math.abs(Math.sin(t * 8)) * 0.15;
    }
  });

  return (
    <group position={[1.5, BELT_Y + 1.2, 0]}>
      {/* Arch frame */}
      <mesh castShadow>
        <torusGeometry args={[1.5, 0.1, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      
      {/* Left and Right Arch Mounts */}
      <mesh position={[-1.5, -0.6, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 1.2, 16]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[1.5, -0.6, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 1.2, 16]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Pulsing AI Laser Scan Line */}
      <mesh ref={laserRef} position={[0, -0.6, 0]}>
        <boxGeometry args={[2.8, 1.2, 0.08]} />
        <meshBasicMaterial 
          color="#06b6d4" 
          transparent 
          opacity={0.3} 
          blending={THREE.AdditiveBlending} 
          side={THREE.DoubleSide} 
        />
      </mesh>
    </group>
  );
}

// Dynamic Conveyor Belt & Rollers
function ConveyorBelt({ beltSpeed }) {
  const rollersRef = useRef([]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Rotate rollers procedurally to match belt speed
    rollersRef.current.forEach((roller, idx) => {
      if (roller) {
        roller.rotation.z = -t * beltSpeed * 3;
      }
    });
  });

  const rollers = useMemo(() => {
    const arr = [];
    for (let x = -BELT_LENGTH / 2; x <= BELT_LENGTH / 2; x += 1.6) {
      arr.push(x);
    }
    return arr;
  }, []);

  return (
    <group>
      {/* Structural Support frame */}
      <mesh receiveShadow castShadow position={[0, BELT_Y - 0.2, 0]}>
        <boxGeometry args={[BELT_LENGTH + 0.5, 0.3, 1.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Moving belt surface */}
      <mesh receiveShadow position={[0, BELT_Y, 0]}>
        <boxGeometry args={[BELT_LENGTH, 0.04, 1.0]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      {/* Rotating Cylindrical Rollers */}
      {rollers.map((x, idx) => (
        <mesh 
          key={idx} 
          ref={el => rollersRef.current[idx] = el} 
          position={[x, BELT_Y - 0.15, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.12, 0.12, 1.1, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// Main Interactive Scene Reconciler
function FactoryScene({ beltSpeed, factoryState, setStats, overrideTrigger }) {
  const { camera } = useThree();
  const [wasteItems, setWasteItems] = useState([]);
  const [targetArmItem, setTargetArmItem] = useState(null);
  
  // Track conveyor state internally
  const itemsRef = useRef([]);
  const nextIdRef = useRef(1);

  // Set rest/isometric viewpoint initially
  useEffect(() => {
    camera.position.set(4, 5, 6);
  }, [camera]);

  // Spawn new waste items on conveyor procedurally
  useEffect(() => {
    if (factoryState !== 'Running') return;

    const spawnInterval = setInterval(() => {
      // Cap maximum items on belt to avoid WebGL lag
      if (itemsRef.current.length >= 8) return;

      const randomMeta = MATERIAL_TYPES[Math.floor(Math.random() * MATERIAL_TYPES.length)];
      const newItem = {
        id: nextIdRef.current++,
        position: new THREE.Vector3(-BELT_LENGTH / 2, BELT_Y + 0.25, 0),
        meta: randomMeta,
        state: 'Moving', // Moving, Scanning, Grabbed, Sorted, Failed
        scanTick: 0,
        scale: 1.0
      };

      itemsRef.current.push(newItem);
      setWasteItems([...itemsRef.current]);
    }, 2800 / beltSpeed);

    return () => clearInterval(spawnInterval);
  }, [beltSpeed, factoryState]);

  // Process manual click sort override
  useEffect(() => {
    if (!overrideTrigger) return;
    const targetItem = itemsRef.current.find(item => item.id === overrideTrigger && item.state === 'Moving');
    if (targetItem) {
      targetItem.state = 'Scanned';
      setTargetArmItem(targetItem);
    }
  }, [overrideTrigger]);

  useFrame((state, delta) => {
    if (factoryState !== 'Running') return;

    const items = itemsRef.current;
    let itemsChanged = false;

    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];

      if (item.state === 'Moving') {
        // Slide along conveyor belt
        item.position.x += beltSpeed * delta;
        itemsChanged = true;

        // Scanner threshold check: Arch is at X = 1.5
        if (item.position.x >= 1.3 && item.position.x <= 1.7) {
          item.state = 'Scanning';
          item.scanTick = state.clock.getElapsedTime();
        }
      } else if (item.state === 'Scanning') {
        item.position.x += beltSpeed * delta;
        itemsChanged = true;

        // Finish Scanning laser overlap
        if (state.clock.getElapsedTime() - item.scanTick > 0.4) {
          item.state = 'Scanned';
          // Assign this scanned item to Robot Sorting Arm queue
          if (!targetArmItem) {
            setTargetArmItem(item);
          }
        }
      } else if (item.state === 'Scanned') {
        // If sorting arm is busy, scanned items continue moving down belt
        item.position.x += beltSpeed * delta;
        itemsChanged = true;

        // If passes base sorting range (X = 3.5), it escapes sorting and goes to landfill!
        if (item.position.x > 3.8) {
          item.state = 'Escaped';
          if (targetArmItem?.id === item.id) {
            setTargetArmItem(null);
          }
          setStats(prev => ({
            ...prev,
            missed: prev.missed + 1,
            landfillWeight: prev.landfillWeight + 0.15
          }));
        }
      } else if (item.state === 'Grabbed') {
        // Arm locks the position, let the arm handle coordinates
        itemsChanged = true;
      } else if (item.state === 'Sorted') {
        // Scale down to simulate falling into correct recycling bin
        item.scale = THREE.MathUtils.lerp(item.scale, 0, 0.15);
        itemsChanged = true;
        if (item.scale < 0.05) {
          items.splice(i, 1);
        }
      } else if (item.state === 'Escaped') {
        // Scale down at belt end to drop into landfill bin
        item.scale = THREE.MathUtils.lerp(item.scale, 0, 0.15);
        itemsChanged = true;
        if (item.scale < 0.05) {
          items.splice(i, 1);
        }
      }
    }

    if (itemsChanged) {
      setWasteItems([...items]);
    }
  });

  const handleGrabbed = () => {
    if (targetArmItem) {
      targetArmItem.state = 'Grabbed';
    }
  };

  const handleSorted = () => {
    if (targetArmItem) {
      targetArmItem.state = 'Sorted';
      
      // Update factory dashboard statistics
      setStats(prev => {
        const isPlastic = targetArmItem.meta.id === 'plastic';
        const isMetal = targetArmItem.meta.id === 'metal';
        const isOrganic = targetArmItem.meta.id === 'organic';

        return {
          ...prev,
          sortedCount: prev.sortedCount + 1,
          plasticWeight: prev.plasticWeight + (isPlastic ? 0.18 : 0),
          metalWeight: prev.metalWeight + (isMetal ? 0.22 : 0),
          organicWeight: prev.organicWeight + (isOrganic ? 0.45 : 0)
        };
      });

      setTargetArmItem(null);
    }
  };

  // Follow grabbed items coordinate tracking dynamically
  useFrame(() => {
    if (targetArmItem && targetArmItem.state === 'Grabbed') {
      const armClawTarget = new THREE.Vector3(0, BELT_Y + 1.8, -1.8);
      // Grab coordinates approximate base/elbow arm height
      targetArmItem.position.lerp(armClawTarget, 0.18);
      
      // Check distance threshold to drop in sorted bin
      const dist = targetArmItem.position.distanceTo(armClawTarget);
      if (dist < 0.3) {
        handleSorted();
      }
    }
  });

  return (
    <group>
      {/* Background Grids */}
      <gridHelper args={[24, 24, '#1e293b', '#0f172a']} position={[0, -0.01, 0]} />

      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[8, 12, 5]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-4, 4, -4]} intensity={0.5} color="#06b6d4" />

      {/* Static Sorting Bins */}
      {MATERIAL_TYPES.map((bin) => (
        <group key={bin.id} position={[bin.binX, BELT_Y - 0.2, -1.6]}>
          {/* Bin Container */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.5, 1.0, 1.2]} />
            <meshStandardMaterial color={bin.binColor} roughness={0.4} metalness={0.2} />
          </mesh>
          {/* Bin rim */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1.6, 0.05, 1.3]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          {/* Virtual Floating Glow Label */}
          <pointLight color={bin.color} intensity={0.6} distance={2.5} />
        </group>
      ))}

      {/* Landfill Escape Bin at Conveyor End */}
      <group position={[BELT_LENGTH / 2 + 0.4, BELT_Y - 0.2, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.2, 1.0, 1.2]} />
          <meshStandardMaterial color="#475569" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.3, 0.05, 1.3]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* Conveyor Tracks */}
      <ConveyorBelt beltSpeed={beltSpeed} />

      {/* Holographic AI Scanner Arch */}
      <ScannerArch />

      {/* Kinematic Sorting Arm */}
      <RoboticArm targetItem={targetArmItem} onGrabSuccess={handleGrabbed} />

      {/* Render Dynamic Moving Waste Materials */}
      {wasteItems.map((item) => (
        <group key={item.id} position={item.position.toArray()} scale={item.scale}>
          {item.meta.shape === 'cylinder' && (
            <mesh castShadow>
              <cylinderGeometry args={[0.2, 0.2, 0.45, 16]} />
              <meshStandardMaterial color={item.meta.color} emissive={item.meta.emissive} emissiveIntensity={0.2} roughness={0.1} />
            </mesh>
          )}
          {item.meta.shape === 'box' && (
            <mesh castShadow>
              <boxGeometry args={[0.35, 0.35, 0.35]} />
              <meshStandardMaterial color={item.meta.color} emissive={item.meta.emissive} emissiveIntensity={0.2} roughness={0.3} />
            </mesh>
          )}
          {item.meta.shape === 'sphere' && (
            <mesh castShadow>
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshStandardMaterial color={item.meta.color} emissive={item.meta.emissive} emissiveIntensity={0.2} roughness={0.5} />
            </mesh>
          )}

          {/* Scanner Overlay HUD */}
          {item.state === 'Scanning' && (
            <group position={[0, 0.6, 0]}>
              <mesh>
                <planeGeometry args={[0.9, 0.25]} />
                <meshBasicMaterial color="#06b6d4" transparent opacity={0.6} side={THREE.DoubleSide} />
              </mesh>
              <pointLight color="#06b6d4" intensity={2} distance={1.2} />
            </group>
          )}
        </group>
      ))}

      <ContactShadows position={[0, -0.01, 0]} opacity={0.5} scale={20} blur={2.4} far={4.5} />
    </group>
  );
}

// Full Container Component
export default function RecyclingFactory({ onClose }) {
  const [beltSpeed, setBeltSpeed] = useState(1.4); // 0.8 to 3.0
  const [factoryState, setFactoryState] = useState('Running'); // Running, Paused
  const [manualOverrideId, setManualOverrideId] = useState(null);

  // Statistics State
  const [stats, setStats] = useState({
    sortedCount: 0,
    missed: 0,
    plasticWeight: 0,
    metalWeight: 0,
    organicWeight: 0,
    landfillWeight: 0
  });

  // Presentation Trigger Jam Functionality
  const [hasJam, setHasJam] = useState(false);
  const triggerJam = () => {
    setHasJam(true);
    setFactoryState('Paused');
    setTimeout(() => {
      setHasJam(false);
      setFactoryState('Running');
    }, 4000);
  };

  const throughput = useMemo(() => {
    if (factoryState !== 'Running') return 0;
    return (stats.sortedCount * 0.45 * beltSpeed).toFixed(2);
  }, [stats.sortedCount, beltSpeed, factoryState]);

  const co2Savings = useMemo(() => {
    const savings = (stats.plasticWeight * 1.5) + (stats.metalWeight * 9.0) + (stats.organicWeight * 0.5);
    return savings.toFixed(2);
  }, [stats]);

  const recyclingRate = useMemo(() => {
    const total = stats.sortedCount + stats.missed;
    if (total === 0) return '100%';
    return `${((stats.sortedCount / total) * 100).toFixed(1)}%`;
  }, [stats]);

  return (
    <div className="fixed inset-0 z-50 bg-[#070b19] flex flex-col font-sans text-gray-100 overflow-hidden">
      {/* Premium Header */}
      <header className="px-6 py-4 bg-[#0c122c]/80 backdrop-blur-md border-b border-gray-800 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Cpu className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              AI Recycling Factory Simulator
            </h1>
            <p className="text-xs text-gray-400">Presentation Mode: Volumetric Laser Sorting & Kinematic Robotics</p>
          </div>
        </div>

        {/* Global Alarm Status */}
        {hasJam && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-1.5 rounded-lg flex items-center gap-2 text-xs font-black animate-pulse">
            <AlertTriangle className="h-4 w-4" />
            CONVEYOR LINE JAM DETECTED - AUTO SHUTDOWN RUNNING
          </div>
        )}

        <button 
          onClick={onClose}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition text-xs"
        >
          Exit Simulation
        </button>
      </header>

      {/* Main Grid Viewport */}
      <div className="flex-grow grid lg:grid-cols-4 relative h-full">
        {/* Left Hand Telemetry and Controls Panel */}
        <div className="lg:col-span-1 bg-[#0c122c]/90 border-r border-gray-800 p-6 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-5rem)]">
          {/* Presentation Controls Section */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <h3 className="text-sm font-black flex items-center gap-2 mb-3 text-cyan-400">
              <Cpu className="h-4 w-4" />
              CONVEYOR CONTROLS
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-2 justify-between">
                <button 
                  onClick={() => setFactoryState(factoryState === 'Running' ? 'Paused' : 'Running')}
                  className={`flex-grow py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    factoryState === 'Running' 
                      ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  {factoryState === 'Running' ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5" />}
                  {factoryState === 'Running' ? 'PAUSE FACTORY' : 'START RUNNING'}
                </button>
              </div>

              {/* Speed Controller slider */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-bold">
                  <span className="text-gray-400">Conveyor Speed</span>
                  <span className="text-cyan-400 font-mono">{beltSpeed.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.8" 
                  max="3.0" 
                  step="0.2"
                  value={beltSpeed} 
                  onChange={(e) => setBeltSpeed(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 bg-gray-700 h-1 rounded-lg cursor-pointer"
                />
              </div>

              {/* Demo presentation triggers */}
              <div className="pt-2 border-t border-gray-800 space-y-2">
                <button 
                  onClick={triggerJam}
                  disabled={hasJam}
                  className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Simulate Jam Alert
                </button>
                <button 
                  onClick={() => setStats({ sortedCount: 0, missed: 0, plasticWeight: 0, metalWeight: 0, organicWeight: 0, landfillWeight: 0 })}
                  className="w-full py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Stats
                </button>
              </div>
            </div>
          </div>

          {/* AI Sorting Efficiency Metrics */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex-grow flex flex-col gap-4">
            <h3 className="text-sm font-black flex items-center gap-2 text-emerald-400 border-b border-gray-800 pb-2">
              <TrendingUp className="h-4 w-4" />
              AI EFFICIENCY
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-800/40 pb-2">
                <span className="text-xs text-gray-400">Total Sorted:</span>
                <span className="text-lg font-black text-white font-mono">{stats.sortedCount} <span className="text-xs text-gray-500">items</span></span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800/40 pb-2">
                <span className="text-xs text-gray-400">Recycling Rate:</span>
                <span className="text-lg font-black text-emerald-400 font-mono">{recyclingRate}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800/40 pb-2">
                <span className="text-xs text-gray-400">CO2 Savings:</span>
                <span className="text-lg font-black text-cyan-400 font-mono">{co2Savings} <span className="text-xs text-gray-500">kg</span></span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800/40 pb-2">
                <span className="text-xs text-gray-400">Production Rate:</span>
                <span className="text-sm font-black text-white font-mono">{throughput} <span className="text-xs text-gray-500">tons/hr</span></span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Missed / Landfill:</span>
                <span className="text-sm font-black text-red-400 font-mono">{stats.missed} <span className="text-xs text-gray-500">items</span></span>
              </div>
            </div>

            {/* Solid Waste Category Breakdowns */}
            <div className="mt-4 pt-4 border-t border-gray-800 space-y-2.5">
               <div className="text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1">Sorted Weight Breakdowns</div>
               <div className="flex justify-between text-xs">
                  <span className="text-[#0ea5e9] font-bold">Plastic:</span>
                  <span className="font-mono text-gray-300 font-semibold">{stats.plasticWeight.toFixed(2)} kg</span>
               </div>
               <div className="flex justify-between text-xs">
                  <span className="text-[#f59e0b] font-bold">Metal / Can:</span>
                  <span className="font-mono text-gray-300 font-semibold">{stats.metalWeight.toFixed(2)} kg</span>
               </div>
               <div className="flex justify-between text-xs">
                  <span className="text-[#10b981] font-bold">Organic:</span>
                  <span className="font-mono text-gray-300 font-semibold">{stats.organicWeight.toFixed(2)} kg</span>
               </div>
               <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-bold">Landfill:</span>
                  <span className="font-mono text-gray-300 font-semibold">{stats.landfillWeight.toFixed(2)} kg</span>
               </div>
            </div>
          </div>
        </div>

        {/* Central 3D Canvas Viewport */}
        <div className="lg:col-span-3 h-full relative flex flex-col">
          {/* Floating Instruction Tips */}
          <div className="absolute top-4 left-4 z-10 glassmorphism p-4 rounded-2xl border border-white/10 max-w-[280px] pointer-events-none">
             <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1">
               <HardHat className="h-4.5 w-4.5 animate-bounce" /> Presentation Sandbox
             </div>
             <p className="text-xs text-gray-300 leading-relaxed font-medium">
               Drag to rotate base angle. Scroll to zoom. Hover over items passing through the <span className="text-cyan-400 font-black">AI Laser scanner arch</span> to watch autonomous multi-axis robotic sorting in real time!
             </p>
          </div>

          <div className="flex-grow w-full h-[50vh] lg:h-full bg-[#080d24]">
            <Canvas shadows>
              <PerspectiveCamera makeDefault position={[4, 5, 6]} fov={42} />
              
              <Suspense fallback={null}>
                <FactoryScene 
                  beltSpeed={beltSpeed} 
                  factoryState={factoryState} 
                  setStats={setStats}
                  overrideTrigger={manualOverrideId}
                />
              </Suspense>

              <OrbitControls 
                enablePan={true}
                enableZoom={true}
                maxPolarAngle={Math.PI / 2 - 0.05} // prevent going under the structural floor
                minDistance={3.5}
                maxDistance={12}
              />
              {/* Neutral High Tech Workspace */}
              <color attach="background" args={['#080d24']} />
            </Canvas>
          </div>

          {/* Color Code Legend Chutes */}
          <div className="px-6 py-4 bg-[#0c122c]/85 border-t border-gray-800 flex flex-wrap gap-6 justify-center items-center">
             <div className="flex items-center gap-2.5 text-xs font-black">
                <div className="w-3.5 h-3.5 rounded bg-[#0ea5e9] shadow-[0_0_8px_#0ea5e9]"></div>
                Plastic Category Chute
             </div>
             <div className="flex items-center gap-2.5 text-xs font-black">
                <div className="w-3.5 h-3.5 rounded bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]"></div>
                Aluminium Metal Chute
             </div>
             <div className="flex items-center gap-2.5 text-xs font-black">
                <div className="w-3.5 h-3.5 rounded bg-[#10b981] shadow-[0_0_8px_#10b981]"></div>
                Organic Category Chute
             </div>
             <div className="flex items-center gap-2.5 text-xs font-black">
                <div className="w-3.5 h-3.5 rounded bg-[#475569]"></div>
                Landfill Unsorted Escape
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
