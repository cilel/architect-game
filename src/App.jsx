import React, { useState } from 'react';
import Scene from './components/Scene';

function App() {
  const [blocks, setBlocks] = useState([]);

  // 处理点击地面放置方块的逻辑
  const addBlock = (x, y, z) => {
    const newBlock = { 
      id: Date.now(), 
      position: [x, y, z] 
    };
    setBlocks([...blocks, newBlock]);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* UI 层 */}
      <div style={{ 
        position: 'absolute', 
        top: 20, 
        left: 20, 
        zIndex: 10, 
        padding: '15px', 
        background: 'rgba(255,255,255,0.9)', 
        borderRadius: '8px', 
        fontFamily: 'sans-serif',
        pointerEvents: 'none',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>🏗️ Archilab Phase 1</h2>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#555', lineHeight: '1.8' }}>
          <li>🖱️ 左键点击地面：放置方块</li>
          <li>🔄 右键/按住：旋转视角</li>
          <li>🔍 滚轮：缩放</li>
        </ul>
        <p style={{ margin: '10px 0 0 0', color: '#333', fontWeight: 'bold' }}>
          当前建筑组件数: {blocks.length}
        </p>
      </div>

      {/* 3D 场景层 */}
      <Scene blocks={blocks} onAddBlock={addBlock} />
    </div>
  );
}

export default App;
