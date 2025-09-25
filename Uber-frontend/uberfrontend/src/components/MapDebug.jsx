import React, { useState, useEffect } from 'react';

const MapDebug = () => {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const checkDependencies = () => {
      const info = {
        leaflet: typeof window !== 'undefined' && window.L,
        reactLeaflet: typeof window !== 'undefined' && window.L && window.L.Map,
        container: document.querySelector('.leaflet-container'),
        tiles: document.querySelectorAll('.leaflet-tile').length,
        errors: []
      };

      // Check for common issues
      try {
        if (!window.L) {
          info.errors.push('Leaflet not loaded');
        }
        if (!window.L?.Map) {
          info.errors.push('Leaflet Map not available');
        }
        if (info.container && info.container.style.height === '0px') {
          info.errors.push('Container height is 0px');
        }
        if (info.tiles === 0) {
          info.errors.push('No map tiles loaded');
        }
      } catch (error) {
        info.errors.push(`Error: ${error.message}`);
      }

      setDebugInfo(info);
    };

    checkDependencies();
    
    // Check again after a delay
    setTimeout(checkDependencies, 2000);
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>Map Debug Info</h4>
      
      <div><strong>Leaflet:</strong> {debugInfo.leaflet ? '✅' : '❌'}</div>
      <div><strong>React Leaflet:</strong> {debugInfo.reactLeaflet ? '✅' : '❌'}</div>
      <div><strong>Container:</strong> {debugInfo.container ? '✅' : '❌'}</div>
      <div><strong>Tiles Loaded:</strong> {debugInfo.tiles || 0}</div>
      
      {debugInfo.errors?.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <strong>Errors:</strong>
          <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
            {debugInfo.errors.map((error, i) => (
              <li key={i} style={{ color: 'red' }}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div style={{ marginTop: '10px', fontSize: '10px', color: '#666' }}>
        <div>Screen: {window.innerWidth}x{window.innerHeight}</div>
        <div>User Agent: {navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other'}</div>
        <div style={{ marginTop: '5px', borderTop: '1px solid #ddd', paddingTop: '5px' }}>
          <strong>Coordinates Debug:</strong>
          <div>Center: {JSON.stringify(debugInfo.center || 'Not set')}</div>
          <div>Pickup: {JSON.stringify(debugInfo.pickup || 'Not set')}</div>
          <div>Destination: {JSON.stringify(debugInfo.destination || 'Not set')}</div>
        </div>
      </div>
    </div>
  );
};

export default MapDebug;
