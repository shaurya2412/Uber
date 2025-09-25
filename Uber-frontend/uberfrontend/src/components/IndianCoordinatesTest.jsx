import React, { useState } from 'react';
import RobustMap from './RobustMap';

const IndianCoordinatesTest = () => {
  const [pickup, setPickup] = useState('Delhi, India');
  const [destination, setDestination] = useState('Gurgaon, India');
  const [showRoute, setShowRoute] = useState(false);

  // Force Indian coordinates
  const indianCoords = {
    'Delhi, India': [28.6139, 77.2090],
    'Gurgaon, India': [28.5355, 77.3910],
    'Noida, India': [28.5355, 77.3910],
    'Mumbai, India': [19.0760, 72.8777],
    'Bangalore, India': [12.9716, 77.5946]
  };

  const pickupCoords = indianCoords[pickup] || [28.6139, 77.2090];
  const destCoords = indianCoords[destination] || [28.5355, 77.3910];

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        🇮🇳 Indian Coordinates Test with Pointers
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        {/* Controls */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>Test Controls</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Pickup Location:
            </label>
            <select 
              value={pickup} 
              onChange={(e) => setPickup(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="Delhi, India">Delhi, India</option>
              <option value="Gurgaon, India">Gurgaon, India</option>
              <option value="Noida, India">Noida, India</option>
              <option value="Mumbai, India">Mumbai, India</option>
              <option value="Bangalore, India">Bangalore, India</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Destination Location:
            </label>
            <select 
              value={destination} 
              onChange={(e) => setDestination(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="Delhi, India">Delhi, India</option>
              <option value="Gurgaon, India">Gurgaon, India</option>
              <option value="Noida, India">Noida, India</option>
              <option value="Mumbai, India">Mumbai, India</option>
              <option value="Bangalore, India">Bangalore, India</option>
            </select>
          </div>

          <button
            onClick={() => setShowRoute(!showRoute)}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: showRoute ? '#ef4444' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {showRoute ? 'Hide Route' : 'Show Route with Pointers'}
          </button>

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Coordinates:</h4>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <div><strong>Pickup:</strong> {pickupCoords[0]}, {pickupCoords[1]}</div>
              <div><strong>Destination:</strong> {destCoords[0]}, {destCoords[1]}</div>
            </div>
          </div>

          <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#0066cc' }}>Expected Features:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#0066cc' }}>
              <li>🟠 Orange pickup marker with pointer</li>
              <li>🔴 Red destination marker with pointer</li>
              <li>➡️ Directional arrows along route</li>
              <li>📍 Route information panel</li>
              <li>🗺️ Indian map tiles</li>
            </ul>
          </div>
        </div>

        {/* Map */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>
            Map View: {pickup} → {destination}
          </h3>
          <div style={{ height: '500px', border: '2px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            <RobustMap
              center={pickupCoords}
              zoom={10}
              pickupLocation={pickupCoords}
              destinationLocation={destCoords}
              showRoute={showRoute}
              rideStatus="searching"
              height="500px"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndianCoordinatesTest;
