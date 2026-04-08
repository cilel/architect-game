import React from 'react';

const Palette = ({ activeType, setActiveType, blockTypes }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 20,
      left: 20,
      zIndex: 10,
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '10px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      gap: '10px'
    }}>
      {Object.values(blockTypes).map(type => (
        <button
          key={type.id}
          onClick={() => setActiveType(type.id)}
          style={{
            width: '50px',
            height: '50px',
            backgroundColor: type.color,
            border: activeType === type.id ? '3px solid #222' : '2px solid transparent',
            borderRadius: '6px',
            cursor: 'pointer',
            opacity: type.transparent ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: type.id === 'window' ? '#000' : '#fff',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
          title={type.name}
        >
          {type.name}
        </button>
      ))}
    </div>
  );
};

export default Palette;
