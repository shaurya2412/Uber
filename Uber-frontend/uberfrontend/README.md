
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
