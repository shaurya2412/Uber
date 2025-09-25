import React, { useState, useEffect } from 'react';
import fareService from '../services/fareService';

const CoordinateDebug = () => {
  const [results, setResults] = useState({});

  const testCoordinates = async () => {
    const testLocations = [
      'Delhi, India',
      'Gurgaon, India', 
      'Noida, India',
      'Mumbai, India',
      'Bangalore, India'
    ];

    const newResults = {};
    
    for (const location of testLocations) {
      try {
        const coords = await fareService.getCoordinates(location);
        newResults[location] = {
          success: true,
          coordinates: coords,
          display: coords ? `${coords.lat}, ${coords.lng}` : 'No coordinates'
        };
      } catch (error) {
        newResults[location] = {
          success: false,
          error: error.message
        };
      }
    }
    
    setResults(newResults);
  };

  useEffect(() => {
    testCoordinates();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Coordinate Debug Tool</h1>
      <p>This tool tests coordinate fetching for Indian cities to identify why New York is showing instead.</p>
      
      <button 
        onClick={testCoordinates}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Test Coordinates
      </button>

      <div style={{ display: 'grid', gap: '10px' }}>
        {Object.entries(results).map(([location, result]) => (
          <div 
            key={location}
            style={{
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              backgroundColor: result.success ? '#f8f9fa' : '#fff5f5'
            }}
          >
            <h3 style={{ margin: '0 0 10px 0', color: result.success ? '#28a745' : '#dc3545' }}>
              {location} {result.success ? '✅' : '❌'}
            </h3>
            
            {result.success ? (
              <div>
                <p><strong>Coordinates:</strong> {result.display}</p>
                {result.coordinates && (
                  <div>
                    <p><strong>Latitude:</strong> {result.coordinates.lat}</p>
                    <p><strong>Longitude:</strong> {result.coordinates.lng}</p>
                    <p><strong>Expected Range:</strong> Lat: 8-37°N, Lng: 68-97°E (India)</p>
                    <p style={{ 
                      color: result.coordinates.lat > 37 || result.coordinates.lat < 8 || 
                             result.coordinates.lng > 97 || result.coordinates.lng < 68 ? 'red' : 'green'
                    }}>
                      <strong>Status:</strong> {
                        result.coordinates.lat > 37 || result.coordinates.lat < 8 || 
                        result.coordinates.lng > 97 || result.coordinates.lng < 68 ? 
                        '❌ Outside India' : '✅ Within India'
                      }
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: 'red' }}><strong>Error:</strong> {result.error}</p>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
        <h3>Expected Indian Coordinates:</h3>
        <ul>
          <li><strong>Delhi:</strong> 28.6139°N, 77.2090°E</li>
          <li><strong>Gurgaon:</strong> 28.5355°N, 77.3910°E</li>
          <li><strong>Noida:</strong> 28.5355°N, 77.3910°E</li>
          <li><strong>Mumbai:</strong> 19.0760°N, 72.8777°E</li>
          <li><strong>Bangalore:</strong> 12.9716°N, 77.5946°E</li>
        </ul>
        <p><strong>India Bounding Box:</strong> 8°N to 37°N, 68°E to 97°E</p>
      </div>
    </div>
  );
};

export default CoordinateDebug;
