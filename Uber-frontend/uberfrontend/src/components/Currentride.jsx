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
  const [isCalculating, setIsCalculating] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

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

  // 🔹 Calculate Fare
  const handleCalculateFare = async () => {
    if (!pickup || !destination) {
      alert("Please enter pickup and destination");
      return;
    }

    setIsCalculating(true);
    try {
      const pickupCoords = await getCoordinates(pickup);
      const destCoords = await getCoordinates(destination);

      if (!pickupCoords || !destCoords) {
        alert("Could not fetch coordinates. Please check the place names.");
        return;
      }

      const fareData = await calculatetheprice(
        { lat: pickupCoords.lat, lng: pickupCoords.lng },
        { lat: destCoords.lat, lng: destCoords.lng }
      );

      if (fareData?.fare) {
        setFare(parseFloat(fareData.fare));
        console.log("✅ Fare calculated:", fareData.fare);
      } else {
        alert("Failed to calculate fare");
      }
    } catch (err) {
      console.error("Failed to calculate fare:", err);
      alert("Failed to calculate fare. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  // 🔹 Book Ride
  const handleBookRide = async () => {
    if (!pickup || !destination) {
      alert("Please enter pickup and destination");
      return;
    }

    if (fare === 0) {
      alert("Please calculate fare first");
      return;
    }

    setIsBooking(true);
    try {
      const pickupCoords = await getCoordinates(pickup);
      const destCoords = await getCoordinates(destination);

      if (!pickupCoords || !destCoords) {
        alert("Could not fetch coordinates. Please check the place names.");
        return;
      }

      await bookRide({
        pickup: { 
          address: pickup, 
          coordinates: { lat: pickupCoords.lat, lng: pickupCoords.lng }
        },
        destination: {
          address: destination,
          coordinates: { lat: destCoords.lat, lng: destCoords.lng }
        },
        fare: fare,
      });

      setPickup("");
      setDestination("");
      setFare(0);
      console.log("✅ Ride booked successfully");
    } catch (err) {
      console.error("Failed to book ride:", err);
      alert("Failed to book ride. Please try again.");
    } finally {
      setIsBooking(false);
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
      console.log("🔄 Initiating payment for fare:", fare);
      
      // Step 1: Create Razorpay order
      const { data } = await axios.post("http://localhost:5000/create-orders/create-order", {
        amount: fare,
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to create payment order");
      }

      console.log("✅ Payment order created:", data.order.id);

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
          try {
            console.log("🔄 Verifying payment:", response.razorpay_payment_id);
            
            const verifyRes = await axios.post("http://localhost:5000/verify/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              rideId: currentRide._id, // Include rideId for receipt email
            });

            if (verifyRes.data.success) {
              console.log("✅ Payment verified successfully");
              alert("✅ Payment Successful! Receipt sent to your email.");
              
              // Refresh ride data
              await fetchRideHistory();
              await fetchCurrentRide();
            } else {
              console.error("❌ Payment verification failed:", verifyRes.data.message);
              alert(`❌ Payment verification failed: ${verifyRes.data.message}`);
            }
          } catch (verifyError) {
            console.error("❌ Payment verification error:", verifyError);
            alert("❌ Payment verification failed. Please contact support.");
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
      console.error("❌ Payment Error:", error);
      
      // Provide specific error messages
      if (error.response?.data?.message) {
        alert(`Payment Error: ${error.response.data.message}`);
      } else if (error.message) {
        alert(`Payment Error: ${error.message}`);
      } else {
        alert("Error initiating payment. Please check your internet connection and try again.");
      }
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
            
            {/* Fare Display */}
            {fare > 0 && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm text-green-800">
                  <strong>Estimated Fare: ₹{fare}</strong>
                </p>
              </div>
            )}
          </div>
          
          {/* Calculate Fare Button */}
          <button
            className="mt-4 bg-gray-800 text-white px-4 py-3 rounded-xl hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full"
            onClick={handleCalculateFare}
            disabled={isCalculating || isBooking || !pickup || !destination}
          >
            {isCalculating ? "Calculating..." : "Calculate Fare"}
          </button>

          {/* Book Ride Button */}
          <button
            className="mt-3 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full"
            onClick={handleBookRide}
            disabled={isBooking || isCalculating || fare === 0 || !pickup || !destination}
          >
            {isBooking ? "Booking..." : "Book Ride"}
          </button>
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
