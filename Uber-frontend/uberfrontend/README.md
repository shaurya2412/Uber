# Uber Clone Frontend

A React-based frontend application for an Uber-like ride booking service.

## Features

- 🚗 **Ride Booking**: Book rides with pickup and destination
- 👤 **User Authentication**: Login and registration system
- 🚕 **Captain Management**: Driver registration and management
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- 🗺️ **Map Integration**: Ready for Google Maps or Mapbox integration
- 📊 **Real-time Updates**: Live ride status updates
- 📈 **Ride History**: Track past rides and spending

## Tech Stack

- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing
- **Leaflet** - Open-source mapping library

## Setup Instructions

### 1. Install Dependencies
```bash
cd uberfrontend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `uberfrontend` directory:
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. Start Development Server
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` by default.

### 4. Build for Production
```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Dashboard.jsx    # Main dashboard with ride booking
│   ├── Login.jsx        # User authentication
│   ├── Map.jsx          # Map component (placeholder)
│   └── ...
├── captainroutes/        # Captain-specific routes
│   ├── CaptainLogin.jsx # Captain authentication
│   └── captainregister.jsx
├── Zustand/             # State management stores
│   ├── useRideStore.js  # Ride-related state
│   ├── useUserStore.js  # User authentication state
│   └── useCaptainStore.js
├── Routes.jsx           # Application routing
└── App.jsx             # Main application component
```

## State Management

### useRideStore
Manages ride-related state:
- `currentRide` - Currently active ride
- `rideHistory` - Array of completed rides
- `rideStatus` - Current ride status (idle, searching, etc.)
- `bookRide()` - Function to book a new ride
- `fetchCurrentRide()` - Get user's current ride
- `fetchRideHistory()` - Get user's ride history

### useUserStore
Manages user authentication:
- `isAuthenticated` - User login status
- `user` - Current user data
- `login()` - User login function
- `logout()` - User logout function

## API Integration

The frontend communicates with the backend API at `http://localhost:3000`:

- **Rides**: `/rides/book`, `/rides/user-current`, `/rides/user-history`
- **Users**: `/users/login`, `/users/register`, `/users/profile`
- **Captains**: `/captains/login`, `/captains/register`

## Ride Booking Flow

1. **User Input**: Enter pickup and destination addresses
2. **Validation**: Check required fields and format
3. **API Call**: Send booking request to backend
4. **State Update**: Update local state with new ride
5. **UI Update**: Show ride tracking interface

## Styling

The application uses Tailwind CSS for styling with:
- **Color Scheme**: Black background with white text and green accents
- **Responsive Grid**: CSS Grid for layout management
- **Component Classes**: Consistent spacing and typography
- **Hover Effects**: Interactive elements with hover states

## Dependencies

### Production Dependencies
- `react` ^19.1.0 - React library
- `react-dom` ^19.1.0 - React DOM rendering
- `zustand` ^5.0.8 - State management
- `axios` ^1.10.0 - HTTP client
- `react-router-dom` ^7.6.3 - Routing
- `tailwindcss` ^4.1.11 - CSS framework
- `leaflet` ^1.9.4 - Mapping library
- `react-leaflet` ^5.0.0 - React wrapper for Leaflet

### Development Dependencies
- `@vitejs/plugin-react` ^4.5.2 - Vite React plugin
- `vite` ^7.0.0 - Build tool
- `eslint` ^9.29.0 - Code linting

## Troubleshooting

### Common Issues

1. **API Connection Error**: Ensure backend is running on port 3000
2. **Authentication Issues**: Check JWT token in localStorage
3. **Build Errors**: Clear node_modules and reinstall dependencies
4. **Port Conflicts**: Change Vite port in vite.config.js

### Development Tips

- Use React DevTools for debugging
- Check browser console for API errors
- Verify API endpoints in Network tab
- Test authentication flow step by step

## Future Enhancements

- [ ] Real-time location tracking
- [ ] Push notifications
- [ ] Payment integration
- [ ] Ride scheduling
- [ ] Driver rating system
- [ ] Multi-language support
