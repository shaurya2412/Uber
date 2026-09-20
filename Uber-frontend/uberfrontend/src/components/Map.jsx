import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { routeService } from '../services/routeService';

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

// Moving driver car icon
const carIcon = new L.DivIcon({
  html: `<div style="font-size: 26px; line-height: 1; transform: translate(-13px, -13px); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));">🚖</div>`,
  className: 'moving-car-icon',
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

// Component to fit bounds
const FitBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    const validPoints = (points || []).filter(p => p && p[0] && p[1]);
    if (validPoints.length > 1) {
      map.fitBounds(validPoints, { padding: [50, 50] });
    } else if (validPoints.length === 1) {
      map.setView(validPoints[0], 14);
    }
  }, [map, JSON.stringify(points)]);
  return null;
};

// Feature 11: Animated Moving Driver Marker
const MovingDriverMarker = ({ position }) => {
  const [animatedPos, setAnimatedPos] = useState(position);

  useEffect(() => {
    if (!position || !position[0] || !position[1]) return;
    
    // Smooth interpolation to new coordinate
    let startTime = null;
    const duration = 1200; // ms
    const prevPos = animatedPos || position;

    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const lat = prevPos[0] + (position[0] - prevPos[0]) * progress;
      const lng = prevPos[1] + (position[1] - prevPos[1]) * progress;
      setAnimatedPos([lat, lng]);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [position?.[0], position?.[1]]);

  if (!animatedPos) return null;
  return (
    <Marker position={animatedPos} icon={carIcon}>
      <Popup>🚖 Driver Current Location</Popup>
    </Marker>
  );
};

const OSMMap = ({ center, zoom, userLocation, driverLocation, destinationLocation, rideStatus }) => {
  const [roadRoute, setRoadRoute] = useState([]);
  const [phase1Route, setPhase1Route] = useState([]);
  const driverPickupGeometry = phase1Route; // Dual-phase driverPickupGeometry and roadRoute


  // Feature 12: Route drawing on map (Driver to Pickup, then Pickup to Destination)
  useEffect(() => {
    let isCancelled = false;

    async function loadRoutes() {
      const isEnRoute = rideStatus === 'accepted' || rideStatus === 'driver_en_route';
      const isInRide = rideStatus === 'in_ride' || rideStatus === 'in_progress';

      // Phase 1: Driver to Pickup (if driver location exists)
      if (driverLocation && userLocation && isEnRoute) {
        const res = await routeService.calculateRoute(driverLocation, userLocation);
        if (!isCancelled && res.success) {
          setPhase1Route(res.coordinates);
        }
      } else {
        setPhase1Route([]);
      }

      // Phase 2 or default: Pickup to Destination
      const dest = destinationLocation || (driverLocation && !isEnRoute ? driverLocation : null);
      if (userLocation && dest) {
        const res = await routeService.calculateRoute(userLocation, dest);
        if (!isCancelled && res.success) {
          setRoadRoute(res.coordinates);
        } else if (!isCancelled) {
          setRoadRoute([userLocation, dest]);
        }
      }
    }

    loadRoutes();
    return () => { isCancelled = true; };
  }, [
    userLocation?.[0], userLocation?.[1],
    driverLocation?.[0], driverLocation?.[1],
    destinationLocation?.[0], destinationLocation?.[1],
    rideStatus
  ]);

  const mapCenter = userLocation || center || [28.6139, 77.209];
  const allPoints = [userLocation, driverLocation, destinationLocation].filter(Boolean);

  return (
    <MapContainer
      center={mapCenter} 
      zoom={zoom || 13}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds points={allPoints} />

      {/* Pickup Location Marker */}
      {userLocation && (
        <Marker position={userLocation} icon={pickupIcon}>
          <Popup>📍 Pickup Location</Popup>
        </Marker>
      )}

      {/* Destination Location Marker */}
      {(destinationLocation || (driverLocation && (rideStatus === 'in_ride' || rideStatus === 'completed'))) && (
        <Marker position={destinationLocation || driverLocation} icon={destinationIcon}>
          <Popup>🏁 Destination</Popup>
        </Marker>
      )}

      {/* Animated Moving Driver Marker */}
      {driverLocation && (
        <MovingDriverMarker position={driverLocation} />
      )}

      {/* Phase 1 Route: Driver to Pickup (Teal line) */}
      {phase1Route.length > 0 && (
        <Polyline positions={phase1Route} color="#0D9488" weight={5} opacity={0.85} dashArray="8, 6" />
      )}

      {/* Phase 2 Route: Pickup to Destination (Blue road line) */}
      {roadRoute.length > 0 && (
        <Polyline positions={roadRoute} color="#2563EB" weight={5} opacity={0.8} />
      )}
    </MapContainer>
  );
};

export default OSMMap;