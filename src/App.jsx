import React, { useState, useEffect, useCallback } from 'react';
import Scene from './components/Scene';
import Palette from './components/Palette';
import { useHistory } from './state/history';

export const BLOCK_TYPES = {
  wall: {
    id: 'wall',
    name: '墙体',
    color: '#808080',
    size: [1, 1, 1],
    transparent: false,
    opacity: 1,
    roughness: 0.8
  },
  window: {
    id: 'window',
    name: '窗户',
    color: '#87CEEB',
    size: [1.0, 0.8, 0.1],
    transparent: true,
    opacity: 0.6,
    roughness: 0.1
  },
  door: {
    id: 'door',
    name: '门',
    color: '#8B4513',
    size: [0.3, 1.0, 0.1],
    transparent: false,
    opacity: 1,
    roughness: 0.9
  },
};

function App() {
  const { current: blocks, push: setBlocks, undo, redo } = useHistory([]);
  const [activeType, setActiveType] = useState('wall');
  const [selectedId, setSelectedId] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [showPreview, setShowPreview] = useState(true); // 控制 Ghost Block 显示

  const handleKeyDown = useCallback((e) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifierKey = isMac ? e.metaKey : e.ctrlKey;

    if (modifierKey && e.key.toLowerCase() === 'z') {
      if (e.shiftKey) redo();
      else undo();
    } else if (modifierKey && e.key.toLowerCase() === 'y') {
      redo();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedId) {
        setBlocks(blocks.filter(b => b.id !== selectedId));
        setSelectedId(null);
      }
    } else if (e.key.toLowerCase() === 'r') {
      setRotation(prev => (prev + 1) % 4);
    } else if (e.key === 'Escape') {
      // Esc 键切换预览显示/隐藏
      setShowPreview(prev => !prev);
    }
  }, [blocks, selectedId, setBlocks, undo, redo]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleAddBlock = (position) => {
    const isOccupied = blocks.some(
      b => b.position[0] === position[0] &&
           b.position[1] === position[1] &&
           b.position[2] === position[2]
    );
    if (isOccupied) return;

    const typeInfo = BLOCK_TYPES[activeType];
    const height = typeInfo.size[1];
    const yOffset = height / 2;

    const newBlock = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      position: [position[0], yOffset, position[2]],
      type: activeType,
      rotation: [0, rotation * (Math.PI / 2), 0]
    };
    setBlocks([...blocks, newBlock]);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Palette
        activeType={activeType}
        setActiveType={setActiveType}
        blockTypes={BLOCK_TYPES}
      />
      <Scene
        blocks={blocks}
        onAddBlock={handleAddBlock}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        blockTypes={BLOCK_TYPES}
        currentBlockType={activeType}
        rotation={rotation}
        showPreview={showPreview}
      />
    </div>
  );
}

export default App;
