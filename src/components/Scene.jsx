import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// 单个方块组件
const Block = ({ block, selected, onSelect, blockTypes }) => {
  const typeInfo = blockTypes[block.type];
  return (
    <mesh
      position={block.position}
      onClick={(e) => {
        e.stopPropagation(); // 阻止事件冒泡到地面
        onSelect(block.id);
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={typeInfo.color}
        transparent={typeInfo.transparent}
        opacity={typeInfo.opacity}
        emissive={selected ? '#555555' : '#000000'} // 选中时高亮发光
        roughness={typeInfo.id === 'window' ? 0.1 : 0.8} // 玻璃更光滑
      />
    </mesh>
  );
};

// 交互地面组件
const Ground = ({ onAddBlock }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    // 吸附到网格 (方块大小 1x1x1，Y轴偏移0.5使其立于网格之上)
    const x = Math.round(e.point.x);
    const y = 0.5;
    const z = Math.round(e.point.z);
    onAddBlock([x, y, z]);
  };
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onClick={handleClick}
    >
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial visible={false} /> {/* 透明拦截层，专门用于捕捉点击 */}
    </mesh>
  );
};

const Scene = ({ blocks, onAddBlock, selectedId, setSelectedId, blockTypes }) => {
  return (
    <Canvas
      camera={{ position: [5, 5, 5], fov: 50 }}
      onClick={() => setSelectedId(null)} // 点击空白处取消选中
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <OrbitControls makeDefault />
      <gridHelper args={[30, 30]} />
      <Ground onAddBlock={onAddBlock} />
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
