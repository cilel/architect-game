# Bug Report: architect-game Scene Component

## Error

```
Error: The above error occurred in the <Scene> component:
at Scene (http://localhost:5175/src/components/Scene.jsx:151:3)
at div
at App (http://localhost:5175/src/App.jsx:50:57)
```

## Current Working Code

### src/components/Scene.jsx

```jsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

const Block = ({ block, selected, onSelect, blockTypes }) => {
  const typeInfo = blockTypes[block.type];
  const size = typeInfo.size;
  return (
    <mesh
      position={block.position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(block.id);
      }}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={typeInfo.color}
        transparent={typeInfo.transparent}
        opacity={typeInfo.opacity}
        emissive={selected ? '#555555' : '#000000'}
        roughness={typeInfo.roughness}
      />
    </mesh>
  );
};

const Ground = ({ onAddBlock }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    const x = Math.round(e.point.x);
    const y = 0.5;
    const z = Math.round(e.point.z);
    onAddBlock([x, y, z]);
  };
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} onClick={handleClick}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  );
};

const Scene = ({ blocks, onAddBlock, selectedId, setSelectedId, blockTypes }) => {
  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 50 }} onClick={() => setSelectedId(null)}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <OrbitControls makeDefault />
      <gridHelper args={[30, 30]} />
      <Ground onAddBlock={onAddBlock} />
      {blocks.map((block) => (
        <Block key={block.id} block={block} selected={block.id === selectedId} onSelect={setSelectedId} blockTypes={blockTypes} />
      ))}
    </Canvas>
  );
};

export default Scene;
```

### src/App.jsx (BLOCK_TYPES)

```jsx
export const BLOCK_TYPES = {
  wall:   { id: 'wall',   name: '墙体', color: '#808080', size: [1, 1, 1],     transparent: false, opacity: 1, roughness: 0.8 },
  window: { id: 'window', name: '窗户', color: '#87CEEB', size: [1.0, 0.8, 0.1], transparent: true, opacity: 0.6, roughness: 0.1 },
  door:   { id: 'door',   name: '门',   color: '#8B4513', size: [0.3, 1.0, 0.1], transparent: false, opacity: 1, roughness: 0.9 },
};
```

## Features We Want

1. **Ghost Block**: Show semi-transparent preview where block will be placed
2. **R key rotation**: Press R to rotate block 90° before placing
3. **Better window material**: Glass-like with transmission/roughness
4. **Selected highlight**: Golden edges on selected block

Please provide step-by-step, ONE feature at a time.
