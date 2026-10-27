import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { routeService } from '../services/routeService';

// 100% Free, No-API-Key Map Tile Providers (Zero Watermarks)
const MAP_STYLES = {
  street: {
    label: 'Street',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  atlas: {
    label: 'Atlas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
  },
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
  },
};

// High-contrast Pickup Pin (Coordinate 1)
const pickupIcon = new L.DivIcon({
  html: `
    <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
      <div style="width: 16px; height: 16px; border-radius: 9999px; background: #09090B; border: 3.5px solid #FAFAFA; box-shadow: 0 2px 8px rgba(0,0,0,0.5);"></div>
    </div>
  `,
  className: 'custom-pickup-pin',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// High-contrast Destination Pin (Coordinate 2)
const destinationIcon = new L.DivIcon({
  html: `
    <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
      <div style="width: 16px; height: 16px; border-radius: 4px; background: #10B981; border: 3px solid #09090B; box-shadow: 0 2px 8px rgba(0,0,0,0.5);"></div>
    </div>
  `,
  className: 'custom-dest-pin',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Moving driver car icon
const carIcon = new L.DivIcon({
  html: `<div style="font-size: 24px; line-height: 1; transform: translate(-12px, -12px); filter: drop-shadow(0 2px 6px rgba(0,0,0,0.6));">🚖</div>`,
  className: 'moving-car-icon',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

// Component to automatically fit map bounds around the two coordinates
const FitBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    const validPoints = (points || []).filter(
      (p) =>
        Array.isArray(p) &&
        p.length === 2 &&
        typeof p[0] === 'number' &&
        typeof p[1] === 'number' &&
        !Number.isNaN(p[0]) &&
        !Number.isNaN(p[1])
    );
    if (validPoints.length > 1) {
      map.fitBounds(validPoints, { padding: [44, 44], maxZoom: 15 });
    } else if (validPoints.length === 1) {
      map.setView(validPoints[0], 14);
    }
  }, [map, JSON.stringify(points)]);
  return null;
};

// Interactive click handler so clicking on the map sets Coordinate 1 (Pickup) or Coordinate 2 (Drop-off)
const MapClickHandler = ({ activePinTarget, setActivePinTarget, onPickupChange, onDestinationChange }) => {
  useMapEvents({
    click(e) {
      if (!onPickupChange && !onDestinationChange) return;
      const lat = Number(e.latlng.lat.toFixed(4));
      const lng = Number(e.latlng.lng.toFixed(4));

      if (activePinTarget === 'pickup' && onPickupChange) {
        onPickupChange([lat, lng]);
        if (onDestinationChange) setActivePinTarget('destination');
      } else if (activePinTarget === 'destination' && onDestinationChange) {
        onDestinationChange([lat, lng]);
        if (onPickupChange) setActivePinTarget('pickup');
      } else if (onPickupChange) {
        onPickupChange([lat, lng]);
      }
    },
  });
  return null;
};

// Feature 11: Animated Moving Driver Marker
const MovingDriverMarker = ({ position }) => {
  const [animatedPos, setAnimatedPos] = useState(position);

  useEffect(() => {
    if (!position || !position[0] || !position[1]) return;

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
      <Popup>Driver Current Location</Popup>
    </Marker>
  );
};

const OSMMap = ({
  center,
  zoom,
  userLocation,
  driverLocation,
  destinationLocation,
  rideStatus,
  onPickupChange,
  onDestinationChange,
  onRouteCalculated,
  compact = false,
}) => {
  const [roadRoute, setRoadRoute] = useState([]);
  const [phase1Route, setPhase1Route] = useState([]);
  const [routeMetrics, setRouteMetrics] = useState({ distanceKm: null, durationMin: null });
  const [activePinTarget, setActivePinTarget] = useState('pickup'); // 'pickup' | 'destination'
  const [tileStyle, setTileStyle] = useState('street'); // 'street' | 'atlas' | 'satellite'
  const driverPickupGeometry = phase1Route; // Dual-phase driverPickupGeometry and roadRoute

  // Feature 12: Route drawing on map between two coordinates
  useEffect(() => {
    let isCancelled = false;

    async function loadRoutes() {
      const isEnRoute = rideStatus === 'accepted' || rideStatus === 'driver_en_route';

      // Phase 1: Driver to Pickup (if driver location exists)
      if (driverLocation && userLocation && isEnRoute) {
        const res = await routeService.calculateRoute(driverLocation, userLocation);
        if (!isCancelled && res.success) {
          setPhase1Route(res.coordinates);
        }
      } else {
        setPhase1Route([]);
      }

      // Phase 2 or default: Coordinate 1 (userLocation) to Coordinate 2 (destinationLocation)
      const dest = destinationLocation || (driverLocation && !isEnRoute ? driverLocation : null);
      if (
        userLocation &&
        dest &&
        typeof userLocation[0] === 'number' &&
        typeof userLocation[1] === 'number' &&
        typeof dest[0] === 'number' &&
        typeof dest[1] === 'number'
      ) {
        const res = await routeService.calculateRoute(userLocation, dest);
        if (!isCancelled && res.success) {
          setRoadRoute(res.coordinates);
          const metrics = {
            distanceKm: Number(res.distance.toFixed(1)),
            durationMin: Math.max(1, Math.round(res.duration)),
          };
          setRouteMetrics(metrics);
          if (onRouteCalculated) onRouteCalculated(metrics);
        } else if (!isCancelled) {
          setRoadRoute([userLocation, dest]);
          const fallbackMetrics = {
            distanceKm: Number((res.distance || 4.5).toFixed(1)),
            durationMin: Math.max(2, Math.round(res.duration || 12)),
          };
          setRouteMetrics(fallbackMetrics);
          if (onRouteCalculated) onRouteCalculated(fallbackMetrics);
        }
      } else {
        setRoadRoute([]);
        setRouteMetrics({ distanceKm: null, durationMin: null });
      }
    }

    loadRoutes();
    return () => {
      isCancelled = true;
    };
  }, [
    userLocation?.[0],
    userLocation?.[1],
    driverLocation?.[0],
    driverLocation?.[1],
    destinationLocation?.[0],
    destinationLocation?.[1],
    rideStatus,
  ]);

  const mapCenter = userLocation || destinationLocation || center || [28.6139, 77.209];
  const allPoints = [userLocation, driverLocation, destinationLocation].filter(Boolean);
  const canPickOnMap = Boolean(onPickupChange || onDestinationChange);
  const currentTile = MAP_STYLES[tileStyle] || MAP_STYLES.street;

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={mapCenter}
        zoom={zoom || 13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', background: '#E5E7EB' }}
      >
        <TileLayer
          key={tileStyle}
          attribution={currentTile.attribution}
          url={currentTile.url}
        />

        <FitBounds points={allPoints} />

        {canPickOnMap && (
          <MapClickHandler
            activePinTarget={activePinTarget}
            setActivePinTarget={setActivePinTarget}
            onPickupChange={onPickupChange}
            onDestinationChange={onDestinationChange}
          />
        )}

        {/* Coordinate 1: Pickup Location Marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={pickupIcon}
            draggable={Boolean(onPickupChange)}
            eventHandlers={
              onPickupChange
                ? {
                    dragend: (e) => {
                      const pos = e.target.getLatLng();
                      onPickupChange([Number(pos.lat.toFixed(4)), Number(pos.lng.toFixed(4))]);
                    },
                  }
                : undefined
            }
          >
            <Popup>
              <div className="text-xs font-sans">
                <strong>Pickup</strong>
                <br />
                {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Coordinate 2: Destination Location Marker */}
        {(destinationLocation ||
          (driverLocation && (rideStatus === 'in_ride' || rideStatus === 'completed'))) && (
          <Marker
            position={destinationLocation || driverLocation}
            icon={destinationIcon}
            draggable={Boolean(onDestinationChange && destinationLocation)}
            eventHandlers={
              onDestinationChange && destinationLocation
                ? {
                    dragend: (e) => {
                      const pos = e.target.getLatLng();
                      onDestinationChange([Number(pos.lat.toFixed(4)), Number(pos.lng.toFixed(4))]);
                    },
                  }
                : undefined
            }
          >
            <Popup>
              <div className="text-xs font-sans">
                <strong>Drop-off</strong>
                <br />
                {(destinationLocation || driverLocation)[0].toFixed(4)},{' '}
                {(destinationLocation || driverLocation)[1].toFixed(4)}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Animated Moving Driver Marker */}
        {driverLocation && <MovingDriverMarker position={driverLocation} />}

        {/* Phase 1 Route: Driver to Pickup */}
        {driverPickupGeometry.length > 0 && (
          <Polyline
            positions={driverPickupGeometry}
            color="#09090B"
            weight={5}
            opacity={0.85}
            dashArray="8, 6"
          />
        )}

        {/* Phase 2 Route: Coordinate 1 to Coordinate 2 Road Line */}
        {roadRoute.length > 0 && (
          <>
            <Polyline positions={roadRoute} color="#09090B" weight={7} opacity={0.9} />
            <Polyline positions={roadRoute} color="#10B981" weight={4} opacity={1} />
          </>
        )}
      </MapContainer>

      {/* Single Ultra-Clean Top-Right Bar (Pin Selector + Map View Toggle) */}
      <div className="absolute top-2.5 right-2.5 z-[400] flex items-center gap-1.5 pointer-events-none">
        {canPickOnMap && (
          <div className="pointer-events-auto flex items-center gap-0.5 p-0.5 rounded-lg bg-[#09090B]/90 backdrop-blur-md border border-white/15 text-[10px] shadow-md">
            <button
              type="button"
              onClick={() => setActivePinTarget('pickup')}
              className={`px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
                activePinTarget === 'pickup'
                  ? 'bg-[#FAFAFA] text-[#09090B] font-semibold'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
              }`}
            >
              Pickup Pin
            </button>
            <button
              type="button"
              onClick={() => setActivePinTarget('destination')}
              className={`px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
                activePinTarget === 'destination'
                  ? 'bg-[#10B981] text-[#09090B] font-semibold'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
              }`}
            >
              Drop Pin
            </button>
          </div>
        )}

        <div className="pointer-events-auto flex items-center gap-0.5 p-0.5 rounded-lg bg-[#09090B]/90 backdrop-blur-md border border-white/15 text-[10px] shadow-md">
          {Object.entries(MAP_STYLES).map(([key, style]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTileStyle(key)}
              className={`px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
                tileStyle === key
                  ? 'bg-white/20 text-[#FAFAFA] font-semibold'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Route Distance & ETA Pill */}
      {routeMetrics.distanceKm !== null && !compact && (
        <div className="absolute bottom-3 left-3 z-[400] flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#09090B]/90 backdrop-blur-md border border-white/15 text-xs shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span className="font-medium text-[#FAFAFA] tabular-nums">
            {routeMetrics.distanceKm} km · {routeMetrics.durationMin} min
          </span>
        </div>
      )}
    </div>
  );
};

export default OSMMap;
