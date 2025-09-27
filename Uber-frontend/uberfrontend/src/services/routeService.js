export const routeService = {
  calculateRoute: async (start, end) => {
    try {
      const startCoords = `${start[1]},${start[0]}`; 
      const endCoords = `${end[1]},${end[0]}`;
            const url = `https://router.project-osrm.org/route/v1/driving/${startCoords};${endCoords}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]); // Convert back to lat,lng
        
        return {
          success: true,
          coordinates,
          distance: route.distance / 1000, 
          duration: route.duration / 60, 
          route
        };
      } else {
        throw new Error('No route found');
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      return {
        success: false,
        coordinates: [start, end],
        distance: calculateDistance(start, end),
        duration: calculateDistance(start, end) * 2,
        error: error.message
      };
    }
  },

  // Calculate route with waypoints for more complex routing
  calculateRouteWithWaypoints: async (waypoints) => {
    try {
      const coordinates = waypoints.map(wp => `${wp[1]},${wp[0]}`).join(';');
      const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0];
        const routeCoordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        
        return {
          success: true,
          coordinates: routeCoordinates,
          distance: route.distance / 1000,
          duration: route.duration / 60,
          route
        };
      } else {
        throw new Error('No route found');
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      return {
        success: false,
        coordinates: waypoints,
        error: error.message
      };
    }
  }
};

// Helper function to calculate straight-line distance
function calculateDistance(coord1, coord2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(coord2[0] - coord1[0]);
  const dLon = deg2rad(coord2[1] - coord1[1]);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(coord1[0])) * Math.cos(deg2rad(coord2[0])) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

export default routeService;
