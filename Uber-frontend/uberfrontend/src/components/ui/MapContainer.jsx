import React, { forwardRef } from 'react';
import { Navigation } from 'lucide-react';

const MapContainer = forwardRef(
  ({ children, className = '', showGrid = true, overlay = null }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative w-full h-full min-h-[350px] bg-[#0A0A0F] overflow-hidden ${className}`}
      >
        {/* Subtle grid pattern background */}
        {showGrid && (
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
        )}

        {/* Ambient tech glow in center */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none z-0" />

        {/* Map contents (e.g. Leaflet MapContainer or dark placeholder) */}
        <div className="relative z-10 w-full h-full">
          {children || (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 select-none">
              <div className="w-12 h-12 rounded-2xl bg-[#1A1A24] border border-[#2D2D3F] flex items-center justify-center text-[#7C3AED] mb-3 shadow-[0_0_30px_rgba(124,58,237,0.15)]">
                <Navigation className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-sm font-medium text-[#F8FAFC]">Live Satellite Grid Initializing</p>
              <p className="text-xs text-[#94A3B8] max-w-xs mt-1">
                Real-time geospatial telemetry streams will render across this grid.
              </p>
            </div>
          )}
        </div>

        {/* Floating overlays (e.g. GPS center button, layer controls) */}
        {overlay && <div className="absolute z-20 pointer-events-auto">{overlay}</div>}
      </div>
    );
  }
);

MapContainer.displayName = 'MapContainer';

export default MapContainer;
