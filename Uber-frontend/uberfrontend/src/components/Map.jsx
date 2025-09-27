import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline, // <-- Added Polyline
  useMap,   // <-- Added useMap for FitBounds
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet's CSS

// Fix for default marker icons not showing up
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// --- Custom Icons for better distinction ---
// You can keep the default icon fix but defining custom ones is better for start/end points
const pickupIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Fallback/Driver Icon (using default if needed)
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// --- Helper Component to Fit Bounds ---
const FitBounds = ({ userLocation, driverLocation }) => {
  const map = useMap();
  useEffect(() => {
    if (userLocation && driverLocation) {
      // Fit map to show both markers with some padding
      map.fitBounds([userLocation, driverLocation], { padding: [50, 50] });
    } else if (userLocation) {
      // Just center on the user/pickup if no destination is set
      map.setView(userLocation, 13);
    }
  }, [map, userLocation, driverLocation]);
  return null;
};

const OSMMap = ({ center, zoom, userLocation, driverLocation }) => {
  // Create a path array for the polyline
  const path = userLocation && driverLocation ? [userLocation, driverLocation] : [];
  console.log(userLocation);
  console.log(driverLocation);

  return (
    <MapContainer
      // center is only used if no user/driver location is present initially
      center={center} 
      zoom={zoom}
      scrollWheelZoom={true} // Enabled scroll zoom for better user experience
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Auto-fit map to the route */}
      <FitBounds userLocation={userLocation} driverLocation={driverLocation} />
      {/* Pickup/User Location Marker (Start Point) */}
      {userLocation && (
        <Marker position={userLocation} icon={pickupIcon}>
          <Popup>📍 Your Pickup Location</Popup>
        </Marker>
      )}

      {/* Destination/Driver Location Marker (End Point) */}
      {driverLocation && (
        <Marker position={driverLocation} icon={destinationIcon}>
          <Popup>🏁 Final Destination</Popup>
        </Marker>
      )}

      {/* Polyline: draws the straight line route between the two points */}
      {path.length > 0 && (
        <Polyline positions={path} color="blue" weight={5} opacity={0.7} />
      )}
    </MapContainer>
  );
};

export default OSMMap;