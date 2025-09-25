import axios from 'axios';

const API_BASE = 'http://localhost:5000';

// Fallback coordinates for Indian cities
const getIndianFallbackCoords = (place) => {
  const indianCities = {
    'delhi': { lat: 28.6139, lng: 77.2090 },
    'new delhi': { lat: 28.6139, lng: 77.2090 },
    'gurgaon': { lat: 28.5355, lng: 77.3910 },
    'gurugram': { lat: 28.5355, lng: 77.3910 },
    'noida': { lat: 28.5355, lng: 77.3910 },
    'mumbai': { lat: 19.0760, lng: 72.8777 },
    'bangalore': { lat: 12.9716, lng: 77.5946 },
    'chennai': { lat: 13.0827, lng: 80.2707 },
    'hyderabad': { lat: 17.3850, lng: 78.4867 },
    'pune': { lat: 18.5204, lng: 73.8567 },
    'kolkata': { lat: 22.5726, lng: 88.3639 },
    'ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'jaipur': { lat: 26.9124, lng: 75.7873 },
    'lucknow': { lat: 26.8467, lng: 80.9462 },
    'kanpur': { lat: 26.4499, lng: 80.3319 }
  };

  const searchTerm = place.toLowerCase().replace(/\s+/g, ' ').trim();
  
  for (const [city, coords] of Object.entries(indianCities)) {
    if (searchTerm.includes(city)) {
      return coords;
    }
  }
  
  // Default to Delhi if no match found
  return { lat: 28.6139, lng: 77.2090 };
};

export const fareService = {
  // Calculate fare based on pickup and destination coordinates
  calculateFare: async (pickup, destination) => {
    try {
      const response = await axios.post(`${API_BASE}/calculate/calculate`, {
        pickup,
        destination
      });
      
      return response.data;
    } catch (error) {
      console.error('Fare calculation error:', error);
      throw new Error(error.response?.data?.message || 'Failed to calculate fare');
    }
  },

  // Get coordinates for a place using LocationIQ API with India bias
  getCoordinates: async (place) => {
    try {
      const API_KEY = "pk.d4d3cce23c00c2d9e20ac1070c22cc5d";
      
      // Add India bias to the search
      const indiaBias = place.includes('India') ? '' : ', India';
      const searchQuery = `${place}${indiaBias}`;
      
      const response = await axios.get(
        `https://us1.locationiq.com/v1/search?key=${API_KEY}&q=${encodeURIComponent(searchQuery)}&format=json&countrycodes=in&bounded=1&viewbox=68,8,97,37&limit=1`
      );
      
      if (response.data && response.data.length > 0) {
        const coords = {
          lat: parseFloat(response.data[0].lat),
          lng: parseFloat(response.data[0].lon)
        };
        
        // Verify coordinates are in India
        if (coords.lat >= 8 && coords.lat <= 37 && coords.lng >= 68 && coords.lng <= 97) {
          return coords;
        } else {
          console.warn('Coordinates outside India, using fallback:', coords);
          // Return Indian fallback coordinates
          return getIndianFallbackCoords(place);
        }
      }
      
      // If no results, try fallback
      return getIndianFallbackCoords(place);
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      // Return Indian fallback coordinates
      return getIndianFallbackCoords(place);
    }
  },

  // Calculate fare for a ride with automatic coordinate fetching
  calculateFareForRide: async (pickupAddress, destinationAddress) => {
    try {
      const [pickupCoords, destCoords] = await Promise.all([
        fareService.getCoordinates(pickupAddress),
        fareService.getCoordinates(destinationAddress)
      ]);

      if (!pickupCoords || !destCoords) {
        throw new Error('Could not fetch coordinates for pickup or destination');
      }

      const fareData = await fareService.calculateFare(pickupCoords, destCoords);
      
      return {
        ...fareData,
        pickup: {
          address: pickupAddress,
          coordinates: pickupCoords
        },
        destination: {
          address: destinationAddress,
          coordinates: destCoords
        }
      };
    } catch (error) {
      console.error('Error calculating fare for ride:', error);
      throw error;
    }
  }
};

export default fareService;
