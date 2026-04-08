import React, { useState, useEffect, useCallback } from 'react';
import Scene from './components/Scene';
import Palette from './components/Palette';
import { useHistory } from './state/history';

// 预定义方块属性字典
// size: [width, height, depth] - 不同类型有不同尺寸
export const BLOCK_TYPES = {
  wall: {
    id: 'wall',
    name: '墙体',
    color: '#808080',
    size: [1, 1, 1],      // 立方体
    transparent: false,
    opacity: 1,
    roughness: 0.8
  },
  window: {
    id: 'window',
    name: '窗户',
    color: '#87CEEB',
    size: [1.0, 0.8, 0.1], // 扁平宽玻璃
    transparent: true,
    opacity: 0.6,
    roughness: 0.1         // 玻璃光滑
  },
  door: {
    id: 'door',
    name: '门',
    color: '#8B4513',
    size: [0.3, 1.0, 0.1], // 竖长门板
    transparent: false,
    opacity: 1,
    roughness: 0.9
  },
};

function App() {
  const { current: blocks, push: setBlocks, undo, redo } = useHistory([]);
  const [activeType, setActiveType] = useState('wall');
  const [selectedId, setSelectedId] = useState(null);

  // 全局键盘事件监听
  const handleKeyDown = useCallback((e) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifierKey = isMac ? e.metaKey : e.ctrlKey;

    if (modifierKey && e.key.toLowerCase() === 'z') {
      if (e.shiftKey) redo(); // 支持 Ctrl+Shift+Z 重做
      else undo();
    } else if (modifierKey && e.key.toLowerCase() === 'y') {
      redo(); // 支持 Ctrl+Y 重做
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedId) {
        // 删除方块，并将新状态推入历史记录
        setBlocks(blocks.filter(b => b.id !== selectedId));
        setSelectedId(null);
      }
    }
  }, [blocks, selectedId, setBlocks, undo, redo]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleAddBlock = (position) => {
    // 检查是否在同一位置已经有方块
    const isOccupied = blocks.some(
      b => b.position[0] === position[0] &&
           b.position[1] === position[1] &&
           b.position[2] === position[2]
    );
    if (isOccupied) return;

    // 根据方块类型计算Y偏移，使方块底部落在地面上
    const typeInfo = BLOCK_TYPES[activeType];
    const height = typeInfo.size[1];
    const yOffset = height / 2; // 几何体中心Y坐标

    const newBlock = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      position: [position[0], yOffset, position[2]], // 使用调整后的Y坐标
      type: activeType
    };
    // 将新方块数组推入历史记录
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
      />
    </div>
  );
}

export default App;
