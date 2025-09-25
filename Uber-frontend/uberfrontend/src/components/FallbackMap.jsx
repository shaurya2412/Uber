import React from 'react';

const FallbackMap = ({ center = [28.6139, 77.209], height = '400px' }) => {
  return (
    <div 
      style={{ 
        height, 
        width: '100%', 
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed #ccc',
        borderRadius: '8px'
      }}
    >
      <div style={{ textAlign: 'center', color: '#666' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Map Loading...</h3>
        <p style={{ margin: '0', fontSize: '14px' }}>
          Center: {center[0].toFixed(4)}, {center[1].toFixed(4)}
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#999' }}>
          If this persists, check your internet connection
        </p>
      </div>
    </div>
  );
};

export default FallbackMap;
