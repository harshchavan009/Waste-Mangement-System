import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Float, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function SectorBlock({ position, height, color, name, isSelected }) {
  const mesh = useRef();
  
  // Smoothly interpolate height
  useFrame(() => {
    if (mesh.current) {
      mesh.current.scale.y = THREE.MathUtils.lerp(mesh.current.scale.y, height, 0.1);
      mesh.current.position.y = mesh.current.scale.y / 2;
    }
  });

  return (
    <group position={position}>
      <mesh ref={mesh} castShadow receiveShadow>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.6} 
          roughness={0.2} 
          emissive={isSelected ? color : "#000000"}
          emissiveIntensity={isSelected ? 0.5 : 0}
        />
      </mesh>
      
      {/* Sector Label in 3D */}
      <Text
        position={[0, 0, 0.9]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color="white"
        font="https://fonts.gstatic.com/s/robotomono/v12/L0tkDFNo96pW6QWz-y-0.woff"
      >
        {name}
      </Text>
    </group>
  );
}

export default function CityWaste3D({ data, dayIndex }) {
  const [selectedId, setSelectedId] = useState(null);

  const grid = useMemo(() => {
    if (!data) return [];
    return data.map((sector, i) => {
      const x = (i % 3) * 2.5 - 2.5;
      const z = Math.floor(i / 3) * 2.5 - 2.5;
      return {
        ...sector,
        position: [x, 0, z]
      };
    });
  }, [data]);

  return (
    <div className="w-full h-full min-h-[400px] relative bg-slate-900 rounded-3xl overflow-hidden">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[8, 8, 8]} fov={40} />
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} />
        
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} castShadow intensity={2} />
        
        <group position={[0, -1, 0]}>
          {grid.map((sector) => (
            <SectorBlock 
              key={sector.id}
              position={sector.position}
              height={sector.forecast[dayIndex] || 2}
              color={sector.color}
              name={sector.name}
              isSelected={selectedId === sector.id}
            />
          ))}
          
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <gridHelper args={[20, 20, "#1e293b", "#334155"]} position={[0, 0, 0]} />
        </group>

        <ContactShadows opacity={0.4} scale={15} blur={2.4} far={10} />
        <Environment preset="night" />
      </Canvas>

      {/* 3D UI Overlay */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="text-[10px] font-mono text-primary font-black tracking-[0.4em] mb-1">CITY_VOLUMETRIC_ENGINE</div>
        <div className="text-2xl font-black text-white">WASTE_PROJECTION_v2</div>
      </div>

      <div className="absolute bottom-6 right-6 text-right">
        <div className="text-[10px] font-mono text-gray-400 mb-1 tracking-widest">TEMPORAL_SLIDER_ACTIVE</div>
        <div className="text-4xl font-black text-primary">T + {dayIndex} DAYS</div>
      </div>
    </div>
  );
}
