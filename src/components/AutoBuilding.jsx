/**
 * 户型图转3D建筑 - React 前端组件
 * 
 * 功能：
 * 1. 上传户型图图片
 * 2. 调用后端 API 解析图片
 * 3. 在 R3F 场景中渲染参数化 3D 建筑元素
 */

import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';

/**
 * 参数化墙体组件
 * 使用 position/scale/rotation 拉伸渲染
 */
function ParametricElement({ element }) {
  const meshRef = useRef();
  
  const { position, scale, rotation } = element;
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      <boxGeometry args={scale} />
      {element.type === 'window' ? (
        <meshPhysicalMaterial
          color="#88ccff"
          transmission={0.9}
          transparent
          roughness={0.05}
          ior={1.5}
          thickness={0.1}
        />
      ) : element.type === 'door' ? (
        <meshStandardMaterial
          color="#8B4513"
          roughness={0.9}
          metalness={0.1}
        />
      ) : (
        <meshStandardMaterial
          color="#E0E0E0"
          roughness={0.8}
          metalness={0.1}
        />
      )}
    </mesh>
  );
}

/**
 * 加载动画
 */
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{
        background: 'rgba(255,255,255,0.9)',
        padding: '20px 30px',
        borderRadius: '10px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
          🔄 解析户型图中...
        </div>
        <div style={{
          width: '200px',
          height: '6px',
          background: '#eee',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: '#4CAF50',
            transition: 'width 0.3s'
          }} />
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
          {progress.toFixed(0)}%
        </div>
      </div>
    </Html>
  );
}

/**
 * 3D 场景组件
 */
function Scene({ elements, onElementClick }) {
  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={0.4} />
      
      {/* 定向光（太阳） */}
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      
      {/* 环境反射（用于玻璃材质） */}
      <Environment preset="city" />
      
      {/* 地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#f0f4f8" roughness={1} />
      </mesh>
      
      {/* 网格 */}
      <Grid
        infiniteGrid
        fadeDistance={40}
        sectionColor="#999"
        cellColor="#ddd"
      />
      
      {/* 渲染所有元素 */}
      {elements.map((elem) => (
        <ParametricElement
          key={elem.id}
          element={elem}
          onClick={() => onElementClick(elem)}
        />
      ))}
      
      {/* 控制器 */}
      <OrbitControls makeDefault />
    </>
  );
}

/**
 * 主组件
 */
export default function AutoBuilding() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('demo'); // 'api' | 'demo'
  const fileInputRef = useRef(null);
  
  // 处理图片上传
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  };
  
  // 调用后端 API 解析
  const parseWithAPI = async () => {
    if (!image) {
      setError('请先选择户型图');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', image);
      
      const response = await fetch('http://localhost:8000/api/parse-floorplan', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || '解析失败');
      }
      
      setElements(data.elements || []);
      
    } catch (err) {
      console.error('API Error:', err);
      setError(`API 调用失败: ${err.message}。请确保后端服务已启动。`);
    } finally {
      setLoading(false);
    }
  };
  
  // 演示模式 - 生成示例数据
  const generateDemoData = () => {
    const demoElements = [
      // 外墙
      { id: 'wall_0', type: 'wall', position: [0, 1.5, 0], scale: [12, 3, 0.2], rotation: [0, 0, 0] },
      { id: 'wall_1', type: 'wall', position: [0, 1.5, 5], scale: [12, 3, 0.2], rotation: [0, 0, 0] },
      { id: 'wall_2', type: 'wall', position: [-5, 1.5, 2.5], scale: [0.2, 3, 5], rotation: [0, 0, 0] },
      { id: 'wall_3', type: 'wall', position: [5, 1.5, 2.5], scale: [0.2, 3, 5], rotation: [0, 0, 0] },
      
      // 内墙
      { id: 'wall_4', type: 'wall', position: [-2, 1.5, 0], scale: [0.2, 3, 5], rotation: [0, 0, 0] },
      { id: 'wall_5', type: 'wall', position: [2, 1.5, 2.5], scale: [0.2, 3, 5], rotation: [0, 0, 0] },
      
      // 门
      { id: 'door_0', type: 'door', position: [-2, 1, 2.5], scale: [1, 2.1, 0.1], rotation: [0, 0, 0] },
      { id: 'door_1', type: 'door', position: [0, 1, 5], scale: [1, 2.1, 0.1], rotation: [0, 0, 0] },
      
      // 窗
      { id: 'window_0', type: 'window', position: [3, 1.5, 5], scale: [1.5, 1.2, 0.1], rotation: [0, 0, 0] },
      { id: 'window_1', type: 'window', position: [-3, 1.5, 5], scale: [1.5, 1.2, 0.1], rotation: [0, 0, 0] },
      { id: 'window_2', type: 'window', position: [5, 1.5, 1], scale: [0.1, 1.2, 1.5], rotation: [0, 0, 0] },
    ];
    
    setElements(demoElements);
    setPreview('demo');
  };
  
  // 导出 JSON
  const exportJSON = () => {
    const data = {
      version: '2.0',
      elements: elements
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'floorplan.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // 清除所有
  const clearAll = () => {
    setImage(null);
    setPreview(null);
    setElements([]);
    setError(null);
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 顶部工具栏 */}
      <div style={{
        padding: '12px 20px',
        background: 'white',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>🏠 户型图转3D</span>
        
        {/* 图片上传 */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={buttonStyle}
        >
          📁 上传户型图
        </button>
        
        {/* API 解析 */}
        <button
          onClick={parseWithAPI}
          disabled={!image || loading}
          style={{
            ...buttonStyle,
            opacity: (!image || loading) ? 0.5 : 1
          }}
        >
          {loading ? '🔄 解析中...' : '🔍 API 解析'}
        </button>
        
        {/* 演示模式 */}
        <button
          onClick={generateDemoData}
          style={buttonStyle}
        >
          📐 演示数据
        </button>
        
        {/* 导出 */}
        <button
          onClick={exportJSON}
          disabled={elements.length === 0}
          style={{
            ...buttonStyle,
            opacity: elements.length === 0 ? 0.5 : 1
          }}
        >
          💾 导出 JSON
        </button>
        
        {/* 清除 */}
        <button
          onClick={clearAll}
          style={{ ...buttonStyle, color: '#666' }}
        >
          🗑️ 清除
        </button>
        
        {/* 状态显示 */}
        <span style={{ marginLeft: 'auto', color: '#666', fontSize: '13px' }}>
          {elements.length > 0 && `✅ ${elements.length} 个元素`}
        </span>
      </div>
      
      {/* 错误提示 */}
      {error && (
        <div style={{
          padding: '10px 20px',
          background: '#fff3f3',
          color: '#d32f2f',
          fontSize: '13px'
        }}>
          ⚠️ {error}
        </div>
      )}
      
      {/* 主内容区 */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* 左侧预览 */}
        {preview && (
          <div style={{
            width: '300px',
            padding: '15px',
            background: 'white',
            borderRight: '1px solid #eee',
            overflow: 'auto'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>📷 原图预览</div>
            <img
              src={preview === 'demo' ? 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23f0f0f0" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">演示模式</text></svg>' : preview}
              alt="户型图预览"
              style={{
                width: '100%',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            />
            
            {/* 元素列表 */}
            {elements.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                  📦 元素列表
                </div>
                <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                  {elements.map((elem) => (
                    <div
                      key={elem.id}
                      style={{
                        padding: '6px 8px',
                        marginBottom: '4px',
                        background: elem.type === 'wall' ? '#f5f5f5' :
                                   elem.type === 'door' ? '#fff3e0' : '#e3f2fd',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    >
                      <span style={{ fontWeight: 'bold' }}>{elem.id}</span>
                      <span style={{ color: '#666' }}> ({elem.type})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 3D 画布 */}
        <div style={{ flex: 1, background: '#f0f4f8' }}>
          {elements.length > 0 ? (
            <Canvas
              shadows
              camera={{ position: [15, 12, 15], fov: 45 }}
            >
              <Suspense fallback={<Loader />}>
                <Scene
                  elements={elements}
                  onElementClick={(elem) => console.log('Clicked:', elem)}
                />
              </Suspense>
            </Canvas>
          ) : (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏠</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                户型图转3D建筑
              </div>
              <div style={{ fontSize: '14px' }}>
                上传户型图或点击「演示数据」开始
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 按钮样式
const buttonStyle = {
  padding: '8px 16px',
  background: 'white',
  border: '1px solid #ddd',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  transition: 'all 0.2s'
};
