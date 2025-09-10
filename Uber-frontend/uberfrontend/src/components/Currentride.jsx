import React, { useEffect } from 'react'
import { useRideStore } from "../zustand/useRideStore";
import { useUserStore } from '../Zustand/useUserstore';
const Currentride = () => {
  
    const { 
    currentRide, 

    isLoading, 
    error,
    fetchCurrentRide, 
    cancelRide
  } = useRideStore();
  const { isAuthenticated } = useUserStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentRide();
    }
  }, [isAuthenticated, fetchCurrentRide]);

  // If no current ride, show a message with refresh button
  if (!currentRide) {
    return (
      <div className="rounded-lg m-4 ml-6 border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">
            No Active Ride
          </h3>
          <p className="text-muted-foreground">You don't have any active rides at the moment.</p>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              Error: {error}
            </div>
          )}
          <button 
            onClick={fetchCurrentRide}
            disabled={isLoading}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 mt-2"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
    );
  }

  // Helper function to get captain initials
  const getCaptainInitials = (captain) => {
    if (!captain?.fullname) return 'NA';
    const { firstname, lastname } = captain.fullname;
    return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
  };

  // Helper function to get status display text
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Searching';
      case 'accepted': return 'Accepted';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return(
<div className="rounded-lg  m-4 ml-6 border bg-card text-card-foreground shadow-sm">
  <div className="flex flex-col space-y-1.5 p-6">
    <div className="flex items-center justify-between">
      <h3 className="flex items-center gap-2 whitespace-nowrap text-2xl font-semibold leading-none tracking-tight">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.6-1.5-1.6h-1.1c-.9 0-1.7.5-2.1 1.4L14.6 17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 1-3 2h-7a3 3 0 0 0-3 3" />
          <circle cx="7" cy="17" r="2" />
          <path d="M9 17h6" />
          <circle cx="18" cy="17" r="2" />
        </svg>
        Ride Status
      </h3>
      <button 
        onClick={fetchCurrentRide}
        disabled={isLoading}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-2"
        title="Refresh ride status"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
        >
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M8 16H3v5" />
        </svg>
      </button> 
    </div>
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${getStatusColor(currentRide.status)}`}>
      {getStatusText(currentRide.status)}
    </div>
    
   
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        <div>Ride ID: {currentRide._id}</div>
        <div>Status: {currentRide.status}</div>
        <div>Captain: {currentRide.captain ? 'Assigned' : 'Not assigned'}</div>
        <div>Fare: ${currentRide.fare}</div>
      </div>
  </div>
  <div className="p-6 pt-0 space-y-4">
    {currentRide.captain ? (
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
          <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
            {getCaptainInitials(currentRide.captain)}
          </span>
        </div>
        <div className="flex-1">
          <p className="font-medium">
            {currentRide.captain.fullname?.firstname} {currentRide.captain.fullname?.lastname}
          </p>
          <p className="text-sm text-muted-foreground">
            {currentRide.captain.vehicle?.vehiclemodel} • {currentRide.captain.vehicle?.plate}
          </p>
        </div>
        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </button>
      </div>
    ) : (
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
          <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
              <line x1="9" x2="15" y1="22" y2="22" />
            </svg>
          </span>
        </div>
        <div className="flex-1">
          <p className="font-medium">Searching for driver...</p>
          <p className="text-sm text-muted-foreground">Please wait while we find you a ride</p>
        </div>
      </div>
    )}

    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-green-600"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span>{currentRide.pickup?.address || 'Pickup address'}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-red-600"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span>{currentRide.destination?.address || 'Destination address'}</span>
      </div>
    </div>

    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>
          {currentRide.status === 'pending' ? 'Searching...' : 
           currentRide.status === 'accepted' ? 'Driver on the way' : 
           currentRide.status === 'in_progress' ? 'Ride in progress' : 'ETA: Calculating...'}
        </span>
      </div>
      <span className="font-medium">${currentRide.fare?.toFixed(2) || '0.00'}</span>
    </div>

    {currentRide.status === 'pending' && (
      <button 
        onClick={() => cancelRide(currentRide._id)}
        disabled={isLoading}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2 w-full"
      >
        {isLoading ? 'Cancelling...' : 'Cancel Ride'}
      </button>
    )}
  </div>
</div>  )
}

export default Currentride