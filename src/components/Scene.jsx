import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';

// 单个方块组件
function Block({ position }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4ade80" />
    </mesh>
  );
}

const Scene = ({ blocks, onAddBlock }) => {
  const handlePointerDown = (e) => {
    // 停止事件冒泡，防止点击方块时也触发地面点击
    e.stopPropagation();
    
    // 获取点击点的坐标
    const { x, y, z } = e.point;
    
    // 核心算法：网格吸附 (Grid Snapping)
    // 假设网格大小为 1，将坐标四舍五入到最近的整数
    // y + 0.5 是为了让方块底部刚好贴在地面上
    const snapX = Math.round(x);
    const snapZ = Math.round(z);
    const snapY = 0.5;
    
    onAddBlock(snapX, snapY, snapZ);
  };

  return (
    <Canvas shadows>
      {/* 1. 环境光与灯光 */}
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} castShadow />
      <directionalLight position={[-5, 5, 5]} intensity={1} castShadow />
      
      {/* 2. 相机控制 */}
      <PerspectiveCamera makeDefault position={[10, 10, 10]} />
      <OrbitControls 
        makeDefault 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 2.1}
        enablePan={true}
        enableZoom={true}
      />
      
      {/* 3. 网格地面 (Clickable Area) */}
      <Grid 
        infiniteGrid 
        fadeDistance={50} 
        sectionSize={5} 
        cellSize={1} 
        sectionColor="#666" 
        cellColor="#999" 
      />
      
      {/* 隐形的物理平面，用于接收点击事件 */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]} 
        onPointerDown={handlePointerDown}
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
      
      {/* 4. 渲染所有已放置的方块 */}
      {blocks.map((block) => (
        <Block key={block.id} position={block.position} />
      ))}
    </Canvas>
  );
};

export default Scene;
