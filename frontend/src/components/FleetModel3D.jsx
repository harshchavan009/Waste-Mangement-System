import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Truck({ color = "#10b981", overheating = false }) {
  const truckRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (truckRef.current) {
      truckRef.current.position.y = Math.sin(t) * 0.05;
    }
  });

  return (
    <group ref={truckRef}>
      {/* Chassis */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[4, 1, 2]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Cabin */}
      <mesh position={[1.5, 1.2, 0]}>
        <boxGeometry args={[1, 1.2, 1.8]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Windshield */}
      <mesh position={[2, 1.3, 0]}>
        <boxGeometry args={[0.1, 0.8, 1.6]} />
        <meshStandardMaterial color="#0ea5e9" transparent opacity={0.6} metalness={1} />
      </mesh>

      {/* Waste Container */}
      <mesh position={[-0.8, 1.3, 0]}>
        <boxGeometry args={[2.2, 1.5, 1.9]} />
        <meshStandardMaterial 
          color={overheating ? "#ef4444" : color} 
          emissive={overheating ? "#ff0000" : "#000000"}
          emissiveIntensity={overheating ? 0.5 : 0}
        />
      </mesh>

      {/* Wheels */}
      {[[-1.2, 0, 1], [1.2, 0, 1], [-1.2, 0, -1], [1.2, 0, -1]].map((pos, i) => (
        <mesh key={i} position={pos} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.4, 32]} />
          <meshStandardMaterial color="#0f172a" roughness={1} />
        </mesh>
      ))}

      {/* Headlights */}
      <mesh position={[2, 0.8, 0.7]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} />
      </mesh>
      <mesh position={[2, 0.8, -0.7]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

function Drone({ overheating = false, lowBattery = false }) {
  const group = useRef();
  const propsRef = useRef([]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const speed = lowBattery ? 5 : 25;
    propsRef.current.forEach((prop, i) => {
      if (prop) prop.rotation.y += speed;
    });
    if (group.current) {
       group.current.position.y = Math.sin(t * 2) * 0.2;
    }
  });

  return (
    <group ref={group}>
      {/* Body */}
      <mesh>
        <boxGeometry args={[1, 0.3, 1]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Center Core */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} />
        <meshStandardMaterial 
          color={overheating ? "#ef4444" : "#06b6d4"} 
          emissive={overheating ? "#ff0000" : "#06b6d4"}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Arms */}
      {[ [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1] ].map((pos, i) => (
        <group key={i}>
          <mesh position={[pos[0]/2, 0, pos[2]/2]} rotation={[0, Math.atan2(pos[0], pos[2]), 0]}>
            <boxGeometry args={[0.1, 0.1, 1.4]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={pos}>
            <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          {/* Propellers */}
          <mesh 
            ref={el => propsRef.current[i] = el}
            position={[pos[0], 0.15, pos[2]]}
          >
            <boxGeometry args={[0.8, 0.02, 0.05]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function FleetModel3D({ type = "truck", telemetry = {} }) {
  const isOverheating = telemetry.engine_temp > 210 || telemetry.battery_temp > 45;
  const isLowBattery = telemetry.fuel_level < 15 || telemetry.battery_level < 15;

  return (
    <div className="w-full h-full min-h-[300px] relative">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
        <OrbitControls enableZoom={true} enablePan={false} autoRotate={!isOverheating} autoRotateSpeed={0.5} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          {type === "truck" ? (
            <Truck color={telemetry.color} overheating={isOverheating} />
          ) : (
            <Drone overheating={isOverheating} lowBattery={isLowBattery} />
          )}
        </Float>

        <gridHelper args={[20, 20, "#334155", "#1e293b"]} position={[0, -0.5, 0]} />
        <Environment preset="city" />
      </Canvas>

      {/* 3D Label */}
      <div className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur-md rounded border border-white/10 pointer-events-none">
        <div className="text-[10px] text-gray-400 font-mono">3D_DYNAMIC_TWIN</div>
        <div className="text-xs font-black text-white">{type.toUpperCase()}_v1.0.4</div>
      </div>
    </div>
  );
}
