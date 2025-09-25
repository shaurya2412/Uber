import React from 'react';
import RobustMap from './RobustMap';

const IndiaPointersTest = () => {
  // Indian cities coordinates
  const delhi = [28.6139, 77.2090];
  const gurgaon = [28.5355, 77.3910];
  const noida = [28.5355, 77.3910];
  const mumbai = [19.0760, 72.8777];
  const bangalore = [12.9716, 77.5946];

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        🇮🇳 India Map with Directional Pointers Test
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Delhi to Gurgaon Route */}
        <div>
          <h3 style={{ marginBottom: '10px', color: '#333' }}>
            Delhi → Gurgaon Route
          </h3>
          <div style={{ height: '400px', border: '2px solid #ccc', borderRadius: '8px' }}>
            <RobustMap
              center={delhi}
              zoom={10}
              pickupLocation={delhi}
              destinationLocation={gurgaon}
              showRoute={true}
              rideStatus="searching"
              height="400px"
            />
          </div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            <strong>Pickup:</strong> Delhi ({delhi[0]}, {delhi[1]})<br/>
            <strong>Destination:</strong> Gurgaon ({gurgaon[0]}, {gurgaon[1]})
          </div>
        </div>

        {/* Mumbai to Bangalore Route */}
        <div>
          <h3 style={{ marginBottom: '10px', color: '#333' }}>
            Mumbai → Bangalore Route
          </h3>
          <div style={{ height: '400px', border: '2px solid #ccc', borderRadius: '8px' }}>
            <RobustMap
              center={mumbai}
              zoom={6}
              pickupLocation={mumbai}
              destinationLocation={bangalore}
              showRoute={true}
              rideStatus="accepted"
              height="400px"
            />
          </div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            <strong>Pickup:</strong> Mumbai ({mumbai[0]}, {mumbai[1]})<br/>
            <strong>Destination:</strong> Bangalore ({bangalore[0]}, {bangalore[1]})
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '15px', color: '#333' }}>Expected Features:</h3>
        <ul style={{ color: '#666', lineHeight: '1.6' }}>
          <li>🟠 <strong>Orange pickup marker</strong> with downward pointer</li>
          <li>🔴 <strong>Red destination marker</strong> with downward pointer</li>
          <li>➡️ <strong>Directional arrows</strong> along the route showing travel direction</li>
          <li>📍 <strong>Route information panel</strong> with coordinates and distance</li>
          <li>🗺️ <strong>Indian map tiles</strong> showing Indian cities and roads</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>Debug Information:</h4>
        <div style={{ fontSize: '12px', color: '#856404' }}>
          <div><strong>Delhi Coordinates:</strong> 28.6139°N, 77.2090°E</div>
          <div><strong>Gurgaon Coordinates:</strong> 28.5355°N, 77.3910°E</div>
          <div><strong>Mumbai Coordinates:</strong> 19.0760°N, 72.8777°E</div>
          <div><strong>Bangalore Coordinates:</strong> 12.9716°N, 77.5946°E</div>
          <div style={{ marginTop: '5px' }}>
            <strong>Map should show:</strong> Indian subcontinent with proper road networks
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndiaPointersTest;
