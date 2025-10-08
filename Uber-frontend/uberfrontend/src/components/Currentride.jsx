import React, { useEffect, useState } from "react";
import { useRideStore } from "../zustand/useRideStore";
import { useUserStore } from "../Zustand/useUserStore";
import axios from "axios";

const Currentride = () => {
  const {
    currentRide,
    calculatetheprice,
    isLoading,
    error,
    finishRideuser,
    fetchRideHistory,
    fetchCurrentRide,
    cancelRideUser,
    bookRide,
  } = useRideStore();
  const { isAuthenticated } = useUserStore();

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [fare, setFare] = useState(0);

  // 🔹 Helper to fetch coordinates
  const getCoordinates = async (place) => {
    try {
      const API_KEY = "pk.d4d3cce23c00c2d9e20ac1070c22cc5d";
      const response = await fetch(
        `https://us1.locationiq.com/v1/search?key=${API_KEY}&q=${encodeURIComponent(place)}&format=json`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      return null;
    } catch (err) {
      console.error("Error fetching coordinates:", err);
      return null;
    }
  };

  // 🔹 Book Ride
  const handleBookRide = async () => {
    if (!pickup || !destination) return;

    try {
      const pickupCoords = await getCoordinates(pickup);
      const destCoords = await getCoordinates(destination);

      if (!pickupCoords || !destCoords) return;

      const fareData = await calculatetheprice(
        { lat: pickupCoords.lat, lng: pickupCoords.lng },
        { lat: destCoords.lat, lng: destCoords.lng }
      );
      console.log(fareData);

      if (!fareData?.fare) {
        console.error("❌ Fare calculation failed");
        return;
      }

      setFare(parseFloat(fareData.fare));

      await bookRide({
        pickup: { address: pickup, lat: pickupCoords.lat, lng: pickupCoords.lng },
        destination: {
          address: destination,
          lat: destCoords.lat,
          lng: destCoords.lng,
        },
        fare: fareData.fare,
      });

      setPickup("");
      setDestination("");
      setFare(0);
    } catch (err) {
      console.error("Failed to book ride:", err);
    }
  };

  // 🔹 Razorpay helpers
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const openRazorpayPayment = async (fare) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert("Razorpay SDK failed to load. Please check your internet connection.");
      return;
    }

    try {
      // Step 1: Create Razorpay order
      const { data } = await axios.post("http://localhost:5000/create-orders/create-order", {
        amount: fare,
      });

      // Step 2: Configure Razorpay options
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Uber Clone",
        description: `Ride from ${currentRide?.pickup?.address} to ${currentRide?.destination?.address}`,
        image: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png",
        order_id: data.order.id,
        handler: async function (response) {
          const verifyRes = await axios.post("http://localhost:5000/verify/verify-payment", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyRes.data.success) {
            alert("✅ Payment Successful!");
            await axios.post(`http://localhost:5000/rides/${currentRide._id}/mark-paid`);
            await fetchRideHistory();
            await fetchCurrentRide();
          } else {
            alert("❌ Payment verification failed!");
          }
        },
        prefill: {
          name: "Test User",
          contact: "9999999999",
        },
        theme: {
          color: "#000000",
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Error initiating payment");
    }
  };

  // 🔹 Fetch current ride on auth
  useEffect(() => {
    if (isAuthenticated && !currentRide) {
      fetchCurrentRide();
    }
  }, [isAuthenticated, fetchCurrentRide, currentRide]);

  // 🔹 UI RENDER STARTS HERE
  if (!currentRide) {
    return (
      <div className="rounded-2xl m-4 border border-gray-100 bg-white shadow-sm">
        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">🚗</span>
              Book a new ride
            </h3>
          </div>
          <div className="flex flex-col">
            <input
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="Starting ride from"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
            />
            <input
              className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="Final Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
          <button
            className="mt-5 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors w-full"
            onClick={handleBookRide}
            disabled={isLoading}
          >
            {isLoading ? "Booking..." : "Find rides"}
          </button>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl ml-3 border border-gray-100 bg-white shadow-sm">
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">🚘 Current Ride</h3>

        <div className="space-y-2 text-sm">
          <p><strong>Pickup:</strong> {currentRide.pickup?.address}</p>
          <p><strong>Destination:</strong> {currentRide.destination?.address}</p>
          <p><strong>Status:</strong> {currentRide.status}</p>
          <p><strong>Fare:</strong> ₹{currentRide.fare}</p>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={async () => {
              try {
                await finishRideuser(currentRide._id);
                await fetchRideHistory();
                await fetchCurrentRide();

                await openRazorpayPayment(currentRide.fare);
              } catch (error) {
                console.error("Failed to finish ride:", error);
                alert(
                  "Failed to finish ride: " +
                    (error.response?.data?.message || error.message)
                );
              }
            }}
            className="flex-1 bg-green-600 text-white rounded-xl py-3 hover:bg-green-700 transition"
          >
            Finish Ride & Pay ₹{currentRide.fare}
          </button>

          {/* Cancel ride */}
          <button
            onClick={() => cancelRideUser(currentRide._id)}
            disabled={isLoading}
            className="flex-1 bg-red-500 text-white rounded-xl py-3 hover:bg-red-600 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Currentride;
