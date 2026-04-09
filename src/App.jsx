import React, { useState, useEffect } from 'react';
import Scene from './components/Scene';

const blockTypes = {
  floor: { size: [1, 0.1, 1], color: '#deb887', name: '木地板' },
  wall: { size: [1, 1, 0.2], color: '#f5f5dc', name: '墙体' },
  window: { size: [1, 1, 0.2], color: '#ffffff', name: '窗户' },
  door: { size: [1, 1, 0.2], color: '#ffffff', name: '木门' },
  ceiling: { size: [1, 0.1, 1], color: '#f8f9fa', name: '天花板' }
};

function App() {
  const [blocks, setBlocks] = useState([]);
  const [currentBlockType, setCurrentBlockType] = useState('floor');
  const [rotationStep, setRotationStep] = useState(0);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'r') {
        setRotationStep((prev) => (prev + 1) % 4);
      }
      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedId !== null) {
        setBlocks((prev) => prev.filter(b => b.id !== selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);

  const addBlock = (blockData) => {
    const newBlock = {
      id: Date.now(),
      ...blockData
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        padding: '15px',
        background: '#2c3e50',
        color: 'white',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <h3 style={{ margin: 0, marginRight: '15px' }}>Architect</h3>
        {Object.keys(blockTypes).map(type => (
          <button
            key={type}
            onClick={() => setCurrentBlockType(type)}
            style={{
              background: currentBlockType === type ? '#3498db' : '#34495e',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {blockTypes[type].name}
          </button>
        ))}
        <span style={{
          marginLeft: 'auto',
          fontSize: '13px',
          color: '#bdc3c7'
        }}>
          <strong>左键:</strong> 放置 | <strong>右键:</strong> 选中 | <strong>R键:</strong> 旋转 ({rotationStep * 90}°) | <strong>退格键:</strong> 删除
        </span>
      </div>
      <div style={{ flex: 1 }}>
        <Scene
          blocks={blocks}
          onAddBlock={addBlock}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          blockTypes={blockTypes}
          currentBlockType={currentBlockType}
          rotationStep={rotationStep}
        />
      </div>
    </div>
  );
}

export default App;
