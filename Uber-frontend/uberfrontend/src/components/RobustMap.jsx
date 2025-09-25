import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import FallbackMap from './FallbackMap';
import routeService from '../services/routeService';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const RobustMap = ({ 
  center = [28.5355, 77.3910], // Default to Gurgaon, India
  zoom = 13, 
  userLocation, 
  driverLocation,
  pickupLocation,
  destinationLocation,
  showRoute = false,
  rideStatus = 'idle',
  height = '400px'
}) => {
  
  // Force center to India if no valid coordinates provided
  const mapCenter = center && center[0] && center[1] ? center : [28.5355, 77.3910];
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [routePoints, setRoutePoints] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    // Set a timeout to show fallback if map doesn't load
    const timer = setTimeout(() => {
      if (!mapLoaded) {
        setMapError(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [mapLoaded]);

  // Generate route points when pickup and destination are available
  useEffect(() => {
    const calculateRoute = async () => {
      if (pickupLocation && destinationLocation) {
        setRouteLoading(true);
        try {
          const routeResult = await routeService.calculateRoute(pickupLocation, destinationLocation);
          setRoutePoints(routeResult.coordinates);
          setRouteInfo(routeResult);
        } catch (error) {
          console.error('Route calculation failed:', error);
          // Fallback to straight line
          const points = [pickupLocation, destinationLocation];
          setRoutePoints(points);
          setRouteInfo({
            success: false,
            coordinates: points,
            distance: calculateDistance(pickupLocation, destinationLocation),
            duration: calculateDistance(pickupLocation, destinationLocation) * 2
          });
        } finally {
          setRouteLoading(false);
        }
      } else {
        setRoutePoints([]);
        setRouteInfo(null);
      }
    };

    calculateRoute();
  }, [pickupLocation, destinationLocation]);

  // Helper function to calculate straight-line distance
  const calculateDistance = (coord1, coord2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(coord2[0] - coord1[0]);
    const dLon = deg2rad(coord2[1] - coord1[1]);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(coord1[0])) * Math.cos(deg2rad(coord2[0])) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const deg2rad = (deg) => deg * (Math.PI/180);

  // Get route color based on ride status
  const getRouteColor = () => {
    switch (rideStatus) {
      case 'searching': return '#f59e0b'; // amber
      case 'accepted': return '#10b981'; // green
      case 'in_progress': return '#3b82f6'; // blue
      case 'completed': return '#6b7280'; // gray
      default: return '#ef4444'; // red
    }
  };

  // Create custom pickup icon with directional pointer
  const createPickupIcon = () => {
    return L.divIcon({
      html: `
        <div style="
          position: relative;
          width: 40px;
          height: 40px;
          background: #f59e0b;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
        ">
          📍
          <div style="
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 12px solid #f59e0b;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          "></div>
        </div>
      `,
      className: 'custom-pickup-icon',
      iconSize: [40, 52],
      iconAnchor: [20, 52],
      popupAnchor: [0, -52]
    });
  };

  // Create custom destination icon with directional pointer
  const createDestinationIcon = () => {
    return L.divIcon({
      html: `
        <div style="
          position: relative;
          width: 40px;
          height: 40px;
          background: #ef4444;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
        ">
          🎯
          <div style="
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 12px solid #ef4444;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          "></div>
        </div>
      `,
      className: 'custom-destination-icon',
      iconSize: [40, 52],
      iconAnchor: [20, 52],
      popupAnchor: [0, -52]
    });
  };

  // Generate directional arrows along the route
  const generateDirectionArrows = (routePoints) => {
    if (routePoints.length < 2) return [];
    
    const arrows = [];
    const numArrows = Math.min(5, Math.floor(routePoints.length / 2)); // Max 5 arrows
    
    for (let i = 0; i < numArrows; i++) {
      const segmentIndex = Math.floor((i + 1) * routePoints.length / (numArrows + 1));
      
      if (segmentIndex < routePoints.length - 1) {
        const current = routePoints[segmentIndex];
        const next = routePoints[segmentIndex + 1];
        
        // Calculate bearing (direction)
        const bearing = calculateBearing(current, next);
        
        arrows.push({
          position: current,
          bearing: bearing
        });
      }
    }
    
    return arrows;
  };

  // Calculate bearing between two points
  const calculateBearing = (from, to) => {
    const lat1 = deg2rad(from[0]);
    const lat2 = deg2rad(to[0]);
    const deltaLng = deg2rad(to[1] - from[1]);

    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

    let bearing = Math.atan2(y, x);
    bearing = (bearing * 180 / Math.PI + 360) % 360;
    
    return bearing;
  };

  // Create arrow icon pointing in specific direction
  const createArrowIcon = (bearing) => {
    return L.divIcon({
      html: `
        <div style="
          width: 20px;
          height: 20px;
          background: ${getRouteColor()};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(${bearing}deg);
          position: relative;
        ">
          <div style="
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-bottom: 8px solid white;
            margin-bottom: 2px;
          "></div>
        </div>
      `,
      className: 'custom-arrow-icon',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10]
    });
  };

  if (mapError) {
    return <FallbackMap center={center} height={height} />;
  }

  return (
    <div style={{ height, width: '100%', position: 'relative' }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        whenCreated={() => setMapLoaded(true)}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{
            load: () => setMapLoaded(true),
            error: () => setMapError(true)
          }}
        />
        
        {/* Route Line */}
        {showRoute && routePoints.length > 1 && (
          <Polyline
            positions={routePoints}
            color={getRouteColor()}
            weight={4}
            opacity={0.8}
            dashArray={routeLoading ? "5, 5" : "0"}
          />
        )}

        {/* Directional Arrows along the route */}
        {showRoute && routePoints.length > 1 && !routeLoading && (
          <>
            {generateDirectionArrows(routePoints).map((arrow, index) => (
              <Marker key={index} position={arrow.position} icon={createArrowIcon(arrow.bearing)}>
                <Popup>
                  <div style={{ color: 'black', textAlign: 'center', fontSize: '12px' }}>
                    <strong>Direction</strong><br />
                    <small>Bearing: {Math.round(arrow.bearing)}°</small>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}
        
        {/* Pickup Location Marker with Direction Pointer */}
        {pickupLocation && (
          <Marker position={pickupLocation} icon={createPickupIcon()}>
            <Popup>
              <div style={{ color: 'black', textAlign: 'center' }}>
                <strong>📍 Pickup Location</strong>
                <br />
                <small>Your driver will arrive here</small>
                <br />
                <small style={{ color: '#f59e0b' }}>START</small>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Destination Location Marker with Direction Pointer */}
        {destinationLocation && (
          <Marker position={destinationLocation} icon={createDestinationIcon()}>
            <Popup>
              <div style={{ color: 'black', textAlign: 'center' }}>
                <strong>🎯 Destination</strong>
                <br />
                <small>Your final destination</small>
                <br />
                <small style={{ color: '#ef4444' }}>END</small>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* User Location Marker */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>
              <div style={{ color: 'black', textAlign: 'center' }}>
                <strong>👤 Your Location</strong>
                <br />
                <small>Current position</small>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Driver Location Marker */}
        {driverLocation && (
          <Marker position={driverLocation}>
            <Popup>
              <div style={{ color: 'black', textAlign: 'center' }}>
                <strong>🚗 Driver Location</strong>
                <br />
                <small>Your driver is here</small>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      {!mapLoaded && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(240, 240, 240, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🗺️</div>
            <p style={{ margin: 0, color: '#666' }}>Loading map...</p>
          </div>
        </div>
      )}

      {/* Debug Info Overlay */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'white',
        padding: '8px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
        fontSize: '10px',
        color: '#666'
      }}>
        <div><strong>Map Center:</strong> {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}</div>
        <div><strong>Zoom:</strong> {zoom}</div>
        <div><strong>Country:</strong> {mapCenter[0] > 8 && mapCenter[0] < 37 && mapCenter[1] > 68 && mapCenter[1] < 97 ? '🇮🇳 India' : '🌍 Other'}</div>
      </div>

      {/* Route Information Overlay */}
      {showRoute && routeInfo && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'white',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000,
          minWidth: '250px',
          maxWidth: '300px'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333' }}>
            Route Information
          </h4>
          {routeLoading ? (
            <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
              Calculating route...
            </p>
          ) : (
            <div style={{ fontSize: '12px', color: '#666' }}>
              <div style={{ marginBottom: '4px' }}>
                <strong>Distance:</strong> {routeInfo.distance?.toFixed(1)} km
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>Duration:</strong> {routeInfo.duration?.toFixed(0)} min
              </div>
              <div style={{ marginBottom: '8px', fontSize: '10px', color: '#999' }}>
                {routeInfo.success ? 'Real route' : 'Straight line'}
              </div>
              
              {/* Direction Indicator */}
              {pickupLocation && destinationLocation && (
                <div style={{ marginBottom: '8px', fontSize: '10px' }}>
                  <strong>Direction:</strong> 
                  <span style={{ 
                    color: '#f59e0b', 
                    fontWeight: 'bold' 
                  }}> 📍 START</span>
                  <span style={{ color: '#666' }}> → </span>
                  <span style={{ 
                    color: '#ef4444', 
                    fontWeight: 'bold' 
                  }}>🎯 END</span>
                </div>
              )}
              
              {/* Selected Coordinates Display */}
              <div style={{ 
                borderTop: '1px solid #eee', 
                paddingTop: '8px',
                marginTop: '8px'
              }}>
                <h5 style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#333' }}>
                  Selected Coordinates
                </h5>
                
                {pickupLocation && (
                  <div style={{ marginBottom: '4px' }}>
                    <strong style={{ color: '#f59e0b' }}>📍 Pickup:</strong>
                    <div style={{ fontSize: '10px', color: '#666', marginLeft: '10px' }}>
                      Lat: {pickupLocation[0].toFixed(6)}
                    </div>
                    <div style={{ fontSize: '10px', color: '#666', marginLeft: '10px' }}>
                      Lng: {pickupLocation[1].toFixed(6)}
                    </div>
                  </div>
                )}
                
                {destinationLocation && (
                  <div>
                    <strong style={{ color: '#ef4444' }}>🎯 Destination:</strong>
                    <div style={{ fontSize: '10px', color: '#666', marginLeft: '10px' }}>
                      Lat: {destinationLocation[0].toFixed(6)}
                    </div>
                    <div style={{ fontSize: '10px', color: '#666', marginLeft: '10px' }}>
                      Lng: {destinationLocation[1].toFixed(6)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RobustMap;
