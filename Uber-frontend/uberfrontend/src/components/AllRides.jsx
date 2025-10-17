import React, { useEffect } from "react";
import { useRideStore } from "../zustand/useRideStore";

const API_BASE = 'http://localhost:5000';

const AllRides = () => {
  const { rideHistory, fetchRideHistory, isLoading, error } = useRideStore();

  useEffect(() => {
    fetchRideHistory();
  }, [fetchRideHistory]);

  const downloadReceipt = async (rideId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/rides/${rideId}/receipt.pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to download receipt');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ride_${rideId}_receipt.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Could not download receipt');
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="m-6">
      <div className="rounded-2xl bg-white/95 backdrop-blur shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">Ride History</h3>
        </div>
        <div className="p-5 pt-0 divide-y">
          {rideHistory && rideHistory.length > 0 ? (
            rideHistory.map((ride) => (
              <div key={ride._id} className="flex items-center justify-between py-4">
                <div>
                  <div className="text-sm text-gray-500">
                    {new Date(ride.createdAt).toLocaleString("en-IN")}
                  </div>
                  <div className="text-gray-900">
                    {ride.pickup?.address} → {ride.destination?.address}
                  </div>
                  <div className="text-sm text-gray-600">
                    Fare: ₹{Number(ride.fare).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Payment ID: {ride.paymentId || '—'}
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => downloadReceipt(ride._id)}
                    className="text-sm rounded-md border border-gray-200 px-3 py-2 hover:bg-gray-50"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">No rides found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllRides;


