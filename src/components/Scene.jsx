import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// 改进的方块模型 - 带边框和细节
function BlockModel({ type, size, color, transparent, opacity, roughness }) {
  const h = size[1];
  const w = size[0];
  const d = size[2];

  if (type === 'window') {
    return (
      <group>
        <mesh position={[0, h/2 - 0.05, 0]}>
          <boxGeometry args={[w + 0.05, 0.1, d]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
        <mesh position={[0, -h/2 + 0.05, 0]}>
          <boxGeometry args={[w + 0.05, 0.1, d]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
        <mesh position={[w/2 - 0.05, 0, 0]}>
          <boxGeometry args={[0.1, h - 0.1, d]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
        <mesh position={[-w/2 + 0.05, 0, 0]}>
          <boxGeometry args={[0.1, h - 0.1, d]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.05, h - 0.2, d + 0.01]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[w - 0.2, 0.05, d + 0.01]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[w - 0.15, h - 0.15, d + 0.01]} />
          <meshStandardMaterial color="#87CEEB" transparent={true} opacity={0.5} roughness={0.1} metalness={0.1} />
        </mesh>
      </group>
    );
  }

  if (type === 'door') {
    return (
      <group>
        <mesh position={[w/2 + 0.03, h/2, 0]}>
          <boxGeometry args={[0.06, h + 0.1, d + 0.02]} />
          <meshStandardMaterial color="#5c3d2e" roughness={0.9} />
        </mesh>
        <mesh position={[-w/2 - 0.03, h/2, 0]}>
          <boxGeometry args={[0.06, h + 0.1, d + 0.02]} />
          <meshStandardMaterial color="#5c3d2e" roughness={0.9} />
        </mesh>
        <mesh position={[0, h + 0.03, 0]}>
          <boxGeometry args={[w + 0.06, 0.06, d + 0.02]} />
          <meshStandardMaterial color="#5c3d2e" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[w - 0.02, h - 0.02, d]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
        <mesh position={[w/2 - 0.1, 0, d/2 + 0.02]}>
          <boxGeometry args={[0.05, 0.1, 0.05]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} transparent={transparent} opacity={opacity} roughness={roughness} />
      </mesh>
    </group>
  );
}

const Block = ({ block, selected, onSelect, blockTypes }) => {
  const typeInfo = blockTypes[block.type];
  return (
    <group
      position={block.position}
      rotation={block.rotation || [0, 0, 0]}
    >
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect(block.id);
        }}
      >
        <boxGeometry args={typeInfo.size} />
        <meshStandardMaterial
          color={typeInfo.color}
          transparent={typeInfo.transparent}
          opacity={typeInfo.opacity}
          emissive={selected ? '#FFD700' : '#000000'}
          emissiveIntensity={selected ? 0.3 : 0}
          roughness={typeInfo.roughness}
        />
      </mesh>
      {selected && (
        <mesh>
          <boxGeometry args={[typeInfo.size[0] * 1.02, typeInfo.size[1] * 1.02, typeInfo.size[2] * 1.02]} />
          <meshBasicMaterial color="#FFD700" wireframe transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
};

const Ground = ({ onAddBlock, ghostRef, currentRotationStep, showPreview }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    const x = Math.round(e.point.x);
    const y = 0.5;
    const z = Math.round(e.point.z);
    onAddBlock([x, y, z]);
  };

  const handlePointerMove = (e) => {
    e.stopPropagation();
    if (ghostRef.current && showPreview) {
      const x = Math.round(e.point.x);
      const y = 0.5;
      const z = Math.round(e.point.z);
      ghostRef.current.position.set(x, y, z);
      ghostRef.current.rotation.y = currentRotationStep * (Math.PI / 2);
      ghostRef.current.visible = true;
    }
  };

  const handlePointerOut = () => {
    if (ghostRef.current) {
      ghostRef.current.visible = false;
    }
  };

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
    >
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  );
};

const Scene = ({ blocks, onAddBlock, selectedId, setSelectedId, blockTypes, currentBlockType, rotation, showPreview }) => {
  const ghostRef = useRef();
  const ghostTypeInfo = currentBlockType && blockTypes ? blockTypes[currentBlockType] : { size: [1, 1, 1], color: '#ffffff' };

  useEffect(() => {
    if (ghostRef.current) {
      ghostRef.current.rotation.y = rotation * (Math.PI / 2);
    }
  }, [rotation]);

  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 50 }} onClick={() => setSelectedId(null)}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <OrbitControls makeDefault />
      <gridHelper args={[30, 30]} />

      <Ground onAddBlock={onAddBlock} ghostRef={ghostRef} currentRotationStep={rotation} showPreview={showPreview} />

      {/* 只在 showPreview=true 时渲染 Ghost Block */}
      {showPreview && (
        <mesh ref={ghostRef}>
          <boxGeometry args={ghostTypeInfo.size} />
          <meshStandardMaterial
            color={ghostTypeInfo.color}
            transparent={true}
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      )}

      {blocks.map((block) => (
        <Block
          key={block.id}
          block={block}
          selected={block.id === selectedId}
          onSelect={setSelectedId}
          blockTypes={blockTypes}
        />
      ))}
    </Canvas>
  );
};

export default Scene;
