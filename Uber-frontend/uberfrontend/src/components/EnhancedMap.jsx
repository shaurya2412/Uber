import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons not showing up
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for different markers
const userIcon = L.divIcon({
  html: '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
  className: 'custom-div-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const driverIcon = L.divIcon({
  html: '<div style="background-color: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
  className: 'custom-div-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const pickupIcon = L.divIcon({
  html: '<div style="background-color: #f59e0b; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
  className: 'custom-div-icon',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const destinationIcon = L.divIcon({
  html: '<div style="background-color: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
  className: 'custom-div-icon',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const EnhancedMap = ({ 
  center, 
  zoom, 
  userLocation, 
  driverLocation, 
  pickupLocation, 
  destinationLocation,
  showRoute = false,
  rideStatus = 'idle',
  onLocationUpdate
}) => {
  const [userPos, setUserPos] = useState(userLocation);
  const [driverPos, setDriverPos] = useState(driverLocation);
  const [route, setRoute] = useState([]);
  const mapRef = useRef(null);

  // Update positions when props change
  useEffect(() => {
    setUserPos(userLocation);
  }, [userLocation]);

  useEffect(() => {
    setDriverPos(driverLocation);
  }, [driverLocation]);

  // Generate route if pickup and destination are provided
  useEffect(() => {
    if (pickupLocation && destinationLocation) {
      // Simple straight line route for demo
      // In a real app, you'd use a routing service like OSRM or Google Directions API
      const routePoints = [
        [pickupLocation[0], pickupLocation[1]],
        [destinationLocation[0], destinationLocation[1]]
      ];
      setRoute(routePoints);
    }
  }, [pickupLocation, destinationLocation]);

  // Auto-center map when locations change
  useEffect(() => {
    if (mapRef.current && (userPos || driverPos)) {
      const map = mapRef.current;
      const bounds = [];
      
      if (userPos) bounds.push(userPos);
      if (driverPos) bounds.push(driverPos);
      if (pickupLocation) bounds.push(pickupLocation);
      if (destinationLocation) bounds.push(destinationLocation);
      
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [userPos, driverPos, pickupLocation, destinationLocation]);

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = [position.coords.latitude, position.coords.longitude];
          setUserPos(newPos);
          if (onLocationUpdate) {
            onLocationUpdate(newPos);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Get user location on component mount
  useEffect(() => {
    if (!userPos) {
      getUserLocation();
    }
  }, []);

  const getStatusColor = () => {
    switch (rideStatus) {
      case 'searching': return '#f59e0b';
      case 'accepted': return '#10b981';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div className="relative w-full h-full">
      <style jsx>{`
        .leaflet-container {
          height: 100%;
          width: 100%;
          z-index: 1;
        }
        .custom-div-icon {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ 
          height: '100%', 
          width: '100%',
          minHeight: '300px',
          zIndex: 1
        }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route line */}
        {showRoute && route.length > 1 && (
          <Polyline
            positions={route}
            color={getStatusColor()}
            weight={4}
            opacity={0.7}
          />
        )}

        {/* Pickup location */}
        {pickupLocation && (
          <Marker position={pickupLocation} icon={pickupIcon}>
            <Popup>
              <div className="text-center">
                <strong>📍 Pickup Location</strong>
                <br />
                <small>Your driver will arrive here</small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination location */}
        {destinationLocation && (
          <Marker position={destinationLocation} icon={destinationIcon}>
            <Popup>
              <div className="text-center">
                <strong>🎯 Destination</strong>
                <br />
                <small>Your final destination</small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* User location */}
        {userPos && (
          <Marker position={userPos} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <strong>👤 Your Location</strong>
                <br />
                <small>Current position</small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Driver location */}
        {driverPos && (
          <Marker position={driverPos} icon={driverIcon}>
            <Popup>
              <div className="text-center">
                <strong>🚗 Driver Location</strong>
                <br />
                <small>Your driver is here</small>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Map controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={getUserLocation}
          className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          title="Get current location"
        >
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        
        {rideStatus !== 'idle' && (
          <div className="bg-white p-2 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: getStatusColor() }}
              ></div>
              <span className="text-sm font-medium capitalize">
                {rideStatus.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedMap;
