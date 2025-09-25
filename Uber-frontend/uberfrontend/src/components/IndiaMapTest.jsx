import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const IndiaMapTest = () => {
  // Indian cities coordinates
  const delhi = [28.6139, 77.209];
  const gurgaon = [28.5355, 77.3910];
  const noida = [28.5355, 77.3910];
  const mumbai = [19.0760, 72.8777];
  const bangalore = [12.9716, 77.5946];

  return (
    <div style={{ height: '400px', width: '100%', border: '2px solid #ccc' }}>
      <MapContainer
        center={gurgaon}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={delhi}>
          <Popup>
            <strong>Delhi</strong><br />
            Coordinates: {delhi[0]}, {delhi[1]}
          </Popup>
        </Marker>
        
        <Marker position={gurgaon}>
          <Popup>
            <strong>Gurgaon</strong><br />
            Coordinates: {gurgaon[0]}, {gurgaon[1]}
          </Popup>
        </Marker>
        
        <Marker position={noida}>
          <Popup>
            <strong>Noida</strong><br />
            Coordinates: {noida[0]}, {noida[1]}
          </Popup>
        </Marker>
      </MapContainer>
      
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        background: 'white', 
        padding: '10px', 
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <h4 style={{ margin: '0 0 5px 0' }}>Indian Cities Test</h4>
        <div>Delhi: {delhi[0]}, {delhi[1]}</div>
        <div>Gurgaon: {gurgaon[0]}, {gurgaon[1]}</div>
        <div>Noida: {noida[0]}, {noida[1]}</div>
      </div>
    </div>
  );
};

export default IndiaMapTest;
