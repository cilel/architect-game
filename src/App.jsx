import React, { useState, useEffect, useCallback, useRef } from 'react';
import Scene from './components/Scene';
import Palette from './components/Palette';
import AutoBuilding from './components/AutoBuilding';
import { useHistory } from './state/history';

export default function App() {
  const { state: blocks, set: setBlocks, undo, redo } = useHistory([]);
  const [activeType, setActiveType] = useState('wall');
  const [selectedId, setSelectedId] = useState(null);
  const [activeRotation, setActiveRotation] = useState(0);
  const [activeTab, setActiveTab] = useState('build');
  
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  const handleAddBlock = useCallback((position) => {
    const newBlock = {
      id: Math.random().toString(36).substring(2, 9),
      position,
      type: activeType,
      rotation: activeRotation,
    };
    setBlocks([...blocksRef.current, newBlock]);
    setSelectedId(newBlock.id);
  }, [activeType, activeRotation, setBlocks]);

  const handleDelete = useCallback(() => {
    if (selectedId) {
      setBlocks(blocksRef.current.filter(b => b.id !== selectedId));
      setSelectedId(null);
    }
  }, [selectedId, setBlocks]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDelete();
      }
      if (e.key === 'Escape') {
        setSelectedId(null);
      }
      if (e.key.toLowerCase() === 'r') {
        setActiveRotation(prev => prev + Math.PI / 2);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDelete, undo, redo]);

  const handleAppClick = (e) => {
    if (e.target.tagName !== 'CANVAS') {
      setSelectedId(null);
    }
  };

  const handleImportElements = (elements) => {
    const importedBlocks = elements.map(elem => ({
      id: elem.id,
      position: elem.position,
      type: elem.type === 'wall' ? 'wall' : elem.type === 'window' ? 'window' : 'door',
      rotation: elem.rotation ? elem.rotation[1] : 0,
    }));
    setBlocks(importedBlocks);
    setActiveTab('build');
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', backgroundColor: '#f0f4f8' }} onClick={handleAppClick}>
      {/* Tab 切换 */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex',
        background: 'white',
        borderRadius: '25px',
        padding: '4px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        gap: '4px'
      }}>
        <button
          onClick={() => setActiveTab('build')}
          style={{
            padding: '8px 20px',
            borderRadius: '20px',
            border: 'none',
            background: activeTab === 'build' ? '#4CAF50' : 'transparent',
            color: activeTab === 'build' ? 'white' : '#666',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
        >
          🎮 手动搭建
        </button>
        <button
          onClick={() => setActiveTab('import')}
          style={{
            padding: '8px 20px',
            borderRadius: '20px',
            border: 'none',
            background: activeTab === 'import' ? '#4CAF50' : 'transparent',
            color: activeTab === 'import' ? 'white' : '#666',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
        >
          📐 户型图导入
        </button>
      </div>

      {/* 手动搭建模式 */}
      {activeTab === 'build' && (
        <>
          <Palette activeType={activeType} onSelect={setActiveType} />
          <Scene
            blocks={blocks}
            onAddBlock={handleAddBlock}
            selectedId={selectedId}
            onSelectBlock={setSelectedId}
            activeType={activeType}
            activeRotation={activeRotation}
          />
          <div style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            pointerEvents: 'none',
            background: 'rgba(255,255,255,0.85)',
            padding: '15px',
            borderRadius: '8px',
            color: '#333',
            fontSize: '13px',
            lineHeight: '1.6',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <strong>操作指南：</strong><br/>
            🖱️ 左键地面：放置首层方块<br/>
            🖱️ <b>Shift + 左键</b>：在现有方块上堆叠<br/>
            🎯 左键方块：选中<br/>
            🔄 <b>按 R 键</b>：旋转即将放置的方块<br/>
            🗑️ <b>Delete</b>：删除选中方块<br/>
            ⏪ <b>Ctrl + Z / Y</b>：撤销与重做
          </div>
        </>
      )}

      {/* 户型图导入模式 */}
      {activeTab === 'import' && (
        <AutoBuilding onImport={handleImportElements} />
      )}
    </div>
  );
}
