import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

// 动态包围盒吸附算法
const calculatePlacement = (e, currentBlockType, typeInfo, rotationStep) => {
  const normalMatrix = new THREE.Matrix3().getNormalMatrix(e.object.matrixWorld);
  const worldNormal = e.face.normal.clone().applyMatrix3(normalMatrix).normalize().round();

  // 核心：当前方块由于旋转产生的真实长宽高
  const isRotated = rotationStep % 2 !== 0;
  const curSize = isRotated ? [typeInfo.size[2], typeInfo.size[1], typeInfo.size[0]] : [...typeInfo.size];

  let pos = [0, 0, 0];
  let rot = [0, rotationStep * (Math.PI / 2), 0];

  // 更高精度的网格对齐 (0.1单位，允许墙体贴边)
  const snap = (val) => Math.round(val * 10) / 10;

  if (e.object.name === 'ground') {
    pos = [snap(e.point.x), curSize[1] / 2, snap(e.point.z)];
  } else {
    const targetPos = e.object.userData.position;
    const targetType = e.object.userData.type;
    const targetSizeRaw = e.object.userData.size || [1, 1, 1];
    const targetRot = e.object.userData.rotation || [0, 0, 0];

    // 目标方块的真实长宽高
    const tRotStep = Math.round(targetRot[1] / (Math.PI / 2));
    const tIsRot = tRotStep % 2 !== 0;
    const tSize = tIsRot ? [targetSizeRaw[2], targetSizeRaw[1], targetSizeRaw[0]] : [...targetSizeRaw];

    const isPanel = (type) => ['wall', 'window', 'door'].some(k => type.includes(k));

    const curIsPanel = isPanel(currentBlockType);
    const targetIsPanel = isPanel(targetType);

    // 垂直堆叠 (比如地板上建墙、墙上盖天花板)
    if (Math.abs(worldNormal.y) === 1) {
      pos[1] = targetPos[1] + worldNormal.y * (tSize[1] / 2 + curSize[1] / 2);
      pos[0] = snap(e.point.x);
      pos[2] = snap(e.point.z);
    }
    // 横向拼接
    else {
      // 面板互联：墙连墙、墙连窗等，启用自动对齐轴向逻辑
      if (curIsPanel && targetIsPanel) {
        if (Math.abs(worldNormal.x) === 1) {
          rot = [0, 0, 0]; // 强行对齐 X 轴
          const fSize = [...typeInfo.size];
          pos[0] = targetPos[0] + worldNormal.x * (tSize[0] / 2 + fSize[0] / 2);
          pos[1] = targetPos[1];
          pos[2] = snap(e.point.z); // 允许在 Z 轴滑动形成完美直角
        } else {
          rot = [0, Math.PI / 2, 0]; // 强行对齐 Z 轴
          const fSize = [typeInfo.size[2], typeInfo.size[1], typeInfo.size[0]];
          pos[0] = snap(e.point.x);
          pos[1] = targetPos[1];
          pos[2] = targetPos[2] + worldNormal.z * (tSize[2] / 2 + fSize[2] / 2);
        }
      }
      // 常规侧面吸附
      else {
        pos[0] = targetPos[0] + worldNormal.x * (tSize[0] / 2 + curSize[0] / 2);
        pos[1] = targetPos[1] + worldNormal.y * (tSize[1] / 2 + curSize[1] / 2);
        pos[2] = targetPos[2] + worldNormal.z * (tSize[2] / 2 + curSize[2] / 2);
        if (Math.abs(worldNormal.x) > 0.5) pos[2] = snap(e.point.z);
        if (Math.abs(worldNormal.z) > 0.5) pos[0] = snap(e.point.x);
      }
    }
  }

  return { position: pos, rotation: rot };
};

// 高级 3D 模型渲染器
const BlockModel = ({ type, size, color, selected, isGhost }) => {
  const typeLower = type ? type.toString().toLowerCase() : '';
  const [w, h, d] = size || [1, 1, 1];
  const emissiveColor = selected && !isGhost ? '#888888' : '#000000';
  const opacity = isGhost ? 0.4 : 1;

  const BaseMat = ({ col }) => (
    <meshStandardMaterial
      color={col || color}
      emissive={emissiveColor}
      transparent={isGhost}
      opacity={opacity}
      depthWrite={!isGhost}
    />
  );

  if (typeLower.includes('window')) {
    const t = 0.08; // 窗框厚度
    return (
      <group>
        <mesh position={[0, h/2 - t/2, 0]}>
          <boxGeometry args={[w, t, d+0.04]} />
          <BaseMat/>
        </mesh>
        <mesh position={[0, -h/2 + t/2, 0]}>
          <boxGeometry args={[w, t, d+0.04]} />
          <BaseMat/>
        </mesh>
        <mesh position={[-w/2 + t/2, 0, 0]}>
          <boxGeometry args={[t, h - t*2, d+0.04]} />
          <BaseMat/>
        </mesh>
        <mesh position={[w/2 - t/2, 0, 0]}>
          <boxGeometry args={[t, h - t*2, d+0.04]} />
          <BaseMat/>
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[w - t*2, h - t*2, d * 0.2]} />
          {isGhost ? (
            <meshStandardMaterial color="#aaddff" transparent opacity={0.3} depthWrite={false} />
          ) : (
            <MeshTransmissionMaterial backside samples={4} thickness={0.1} transmission={0.95} roughness={0.05} color="#c2e2ff" />
          )}
        </mesh>
      </group>
    );
  }

  if (typeLower.includes('door')) {
    const t = 0.1;
    return (
      <group>
        <mesh position={[0, h/2 - t/2, 0]}>
          <boxGeometry args={[w, t, d+0.02]} />
          <BaseMat/>
        </mesh>
        <mesh position={[-w/2 + t/2, -t/2, 0]}>
          <boxGeometry args={[t, h - t, d+0.02]} />
          <BaseMat/>
        </mesh>
        <mesh position={[w/2 - t/2, -t/2, 0]}>
          <boxGeometry args={[t, h - t, d+0.02]} />
          <BaseMat/>
        </mesh>
        <mesh position={[0, -t/2, 0]}>
          <boxGeometry args={[w - t*2, h - t, d * 0.4]} />
          <BaseMat col="#8b5a2b" />
        </mesh>
        {/* 金色门把手 */}
        <mesh position={[w/2 - t*2, 0, d*0.35]}>
          <sphereGeometry args={[0.04]} />
          <BaseMat col="#ffd700" />
        </mesh>
        <mesh position={[w/2 - t*2, 0, -d*0.35]}>
          <sphereGeometry args={[0.04]} />
          <BaseMat col="#ffd700" />
        </mesh>
      </group>
    );
  }

  if (typeLower.includes('wall')) {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[w, h, d]} />
          <BaseMat/>
        </mesh>
        {/* 底部踢脚线 */}
        <mesh position={[0, -h/2 + 0.05, 0]}>
          <boxGeometry args={[w + 0.01, 0.1, d + 0.02]} />
          <BaseMat col="#dcdcdc"/>
        </mesh>
      </group>
    );
  }

  // 默认 (地板、天花板)
  return (
    <mesh>
      <boxGeometry args={[...size]} />
      <BaseMat/>
    </mesh>
  );
};

const Scene = ({ blocks, onAddBlock, selectedId, setSelectedId, blockTypes, currentBlockType, rotationStep }) => {
  const ghostRef = useRef();
  const ghostTypeInfo = currentBlockType && blockTypes ? blockTypes[currentBlockType] : { size: [1, 1, 1], color: '#ffffff' };

  const handlePointerMove = (e) => {
    e.stopPropagation();
    if (!ghostRef.current) return;
    const { position, rotation } = calculatePlacement(e, currentBlockType, ghostTypeInfo, rotationStep);
    ghostRef.current.position.set(...position);
    ghostRef.current.rotation.set(...rotation);
    ghostRef.current.visible = true;
  };

  const handleClick = (e) => {
    e.stopPropagation();
    const { position, rotation } = calculatePlacement(e, currentBlockType, ghostTypeInfo, rotationStep);
    onAddBlock({ type: currentBlockType, position, rotation });
  };

  return (
    <Canvas
      camera={{ position: [5, 5, 5], fov: 50 }}
      onPointerMissed={() => setSelectedId(null)}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <OrbitControls makeDefault />
      <gridHelper args={[30, 30, '#cccccc', '#eeeeee']} />

      {/* 地面 */}
      <mesh
        name="ground"
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerOut={() => ghostRef.current && (ghostRef.current.visible = false)}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* 已放置的方块 */}
      {blocks.map((block) => {
        const typeInfo = blockTypes[block.type];
        return (
          <group key={block.id} position={block.position} rotation={block.rotation}>
            <BlockModel
              type={block.type}
              size={typeInfo.size}
              color={typeInfo.color}
              selected={block.id === selectedId}
              isGhost={false}
            />
            <mesh
              userData={{ size: typeInfo.size, position: block.position, type: block.type, rotation: block.rotation }}
              onClick={handleClick}
              onContextMenu={(e) => {
                e.stopPropagation();
                setSelectedId(block.id);
              }}
              onPointerMove={handlePointerMove}
              onPointerOut={() => ghostRef.current && (ghostRef.current.visible = false)}
            >
              <boxGeometry args={typeInfo.size} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          </group>
        );
      })}

      {/* Ghost 预览层 */}
      <group ref={ghostRef} visible={false} raycast={() => null}>
        <BlockModel
          type={currentBlockType}
          size={ghostTypeInfo.size}
          color={ghostTypeInfo.color}
          isGhost={true}
        />
      </group>
    </Canvas>
  );
};

export default Scene;
