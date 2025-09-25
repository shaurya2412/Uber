import React, { useState } from 'react';

const CoordinatesDisplay = ({ pickupLocation, destinationLocation, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!pickupLocation || !destinationLocation) {
    return null;
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center">
          <span className="text-lg mr-2">📍</span>
          <span className="font-medium text-gray-700">Route Coordinates</span>
        </div>
        <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-100">
          <div className="mt-3 space-y-3">
            {/* Pickup Coordinates */}
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <div className="flex items-center mb-2">
                <span className="text-amber-600 mr-2">📍</span>
                <span className="font-medium text-amber-800">Pickup Location</span>
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <div><strong>Latitude:</strong> {pickupLocation[0].toFixed(6)}°</div>
                <div><strong>Longitude:</strong> {pickupLocation[1].toFixed(6)}°</div>
                <div className="text-xs text-gray-500 mt-1">
                  Decimal: {pickupLocation[0]}, {pickupLocation[1]}
                </div>
              </div>
            </div>

            {/* Destination Coordinates */}
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="flex items-center mb-2">
                <span className="text-red-600 mr-2">🎯</span>
                <span className="font-medium text-red-800">Destination Location</span>
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <div><strong>Latitude:</strong> {destinationLocation[0].toFixed(6)}°</div>
                <div><strong>Longitude:</strong> {destinationLocation[1].toFixed(6)}°</div>
                <div className="text-xs text-gray-500 mt-1">
                  Decimal: {destinationLocation[0]}, {destinationLocation[1]}
                </div>
              </div>
            </div>

            {/* Distance Information */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center mb-2">
                <span className="text-blue-600 mr-2">📏</span>
                <span className="font-medium text-blue-800">Route Details</span>
              </div>
              <div className="text-sm text-gray-700">
                <div><strong>Distance:</strong> {calculateDistance(pickupLocation, destinationLocation).toFixed(2)} km (straight line)</div>
                <div className="text-xs text-gray-500 mt-1">
                  * Actual driving distance may vary
                </div>
              </div>
            </div>

            {/* Copy Coordinates Button */}
            <button
              onClick={() => {
                const coordsText = `Pickup: ${pickupLocation[0]}, ${pickupLocation[1]}\nDestination: ${destinationLocation[0]}, ${destinationLocation[1]}`;
                navigator.clipboard.writeText(coordsText);
                alert('Coordinates copied to clipboard!');
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm transition-colors"
            >
              📋 Copy Coordinates
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to calculate distance between two coordinates
function calculateDistance(coord1, coord2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(coord2[0] - coord1[0]);
  const dLon = deg2rad(coord2[1] - coord1[1]);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(coord1[0])) * Math.cos(deg2rad(coord2[0])) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

export default CoordinatesDisplay;
