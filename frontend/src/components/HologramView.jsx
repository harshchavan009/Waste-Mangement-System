import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, Stars, MeshDistortMaterial, Trail, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function MatrixRing({ radius, color, speed }) {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.z = state.clock.getElapsedTime() * speed;
  });

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh ref={ref}>
        <ringGeometry args={[radius, radius + 0.05, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function ParticleExplosion({ count, color, active }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 2;
      p[i * 3 + 1] = (Math.random() - 0.5) * 2;
      p[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return p;
  }, [count]);

  const ref = useRef();
  useFrame((state) => {
    if (active && ref.current) {
      const time = state.clock.getElapsedTime();
      for (let i = 0; i < count; i++) {
        ref.current.geometry.attributes.position.array[i * 3 + 1] += Math.sin(time + i) * 0.01;
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={ref} positions={points} stride={3}>
      <PointMaterial transparent color={color} size={0.05} sizeAttenuation={true} depthWrite={false} blending={THREE.AdditiveBlending} />
    </Points>
  );
}

function HologramObject({ type, disassembled }) {
  const ref = useRef();
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  const getGeometry = () => {
    switch(type?.toLowerCase()) {
      case 'plastic': return <cylinderGeometry args={[0.5, 0.5, 1.5, 32]} />;
      case 'metal': return <cylinderGeometry args={[0.6, 0.6, 1.2, 32]} />;
      case 'paper': return <boxGeometry args={[1, 1.4, 0.1]} />;
      case 'glass': return <cylinderGeometry args={[0.4, 0.6, 1.8, 32]} />;
      default: return <sphereGeometry args={[0.8, 32, 32]} />;
    }
  };

  return (
    <group ref={ref}>
      {disassembled ? (
        <group>
            {/* Top Part (Cap/Label) */}
            <motion.group animate={{ y: 1.5 }} transition={{ duration: 1 }}>
                 <mesh position={[0, 0.8, 0]}>
                    <cylinderGeometry args={[0.2, 0.2, 0.2, 32]} />
                    <meshStandardMaterial color="#3b82f6" wireframe />
                 </mesh>
            </motion.group>
            {/* Main Body */}
            <mesh position={[0, 0, 0]}>
                {getGeometry()}
                <MeshDistortMaterial 
                  color="#10b981" 
                  speed={2} 
                  distort={0.4} 
                  wireframe 
                  transparent 
                  opacity={0.5}
                />
            </mesh>
        </group>
      ) : (
        <mesh>
          {getGeometry()}
          <MeshDistortMaterial 
            color="#10b981" 
            speed={2} 
            distort={0.4} 
            wireframe 
            transparent 
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}

export default function HologramView({ type, onClose }) {
  const [disassembled, setDisassembled] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center">
      <div className="w-full h-full relative">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <OrbitControls enablePan={false} />
          
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={2} color="#10b981" />
          
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <HologramObject type={type} disassembled={disassembled} />
          </Float>

          <MatrixRing radius={2.5} color="#10b981" speed={0.5} />
          <MatrixRing radius={2.2} color="#3b82f6" speed={-0.3} />
          
          {disassembled && <ParticleExplosion count={200} color="#3b82f6" active={true} />}
        </Canvas>

        {/* HUD UI */}
        <div className="absolute top-10 left-10 pointer-events-none">
          <div className="text-[10px] font-mono text-primary font-black animate-pulse mb-1 tracking-[0.5em]">HOLOGRAM_INITIATED</div>
          <div className="text-4xl font-black text-white italic">OBJECT_ID: {type?.toUpperCase()}</div>
          <div className="mt-4 flex gap-4">
             <div className="px-3 py-1 bg-primary/20 border border-primary/50 text-[10px] font-bold text-primary rounded-full">SCAN_COMPLETE</div>
             <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-[10px] font-bold text-blue-400 rounded-full">STRUCTURAL_ANALYSIS</div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-6">
           <button 
             onClick={() => setDisassembled(!disassembled)}
             className={`px-8 py-3 rounded-full font-black text-xs transition-all border-2 ${disassembled ? 'bg-primary border-primary text-white shadow-lg shadow-primary/50' : 'border-white/20 text-white hover:bg-white/10'}`}
           >
             {disassembled ? 'REASSEMBLE COMPONENTS' : 'DISASSEMBLE MOLECULAR STRUCTURE'}
           </button>
           <button 
             onClick={onClose}
             className="px-8 py-3 rounded-full font-black text-xs bg-red-500 text-white shadow-lg shadow-red-500/50 hover:scale-105 transition-all"
           >
             EXIT HOLOGRAM
           </button>
        </div>

        {/* Matrix Rain Decoration */}
        <div className="absolute top-0 bottom-0 right-10 w-32 pointer-events-none overflow-hidden opacity-20">
           <div className="text-[8px] font-mono text-primary animate-vertical-scroll whitespace-pre">
              {Array(100).fill(0).map(() => Math.random().toString(36).substring(2, 10)).join('\n')}
           </div>
        </div>
      </div>
    </div>
  );
}
