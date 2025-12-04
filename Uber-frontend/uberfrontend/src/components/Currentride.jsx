import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRideStore } from "../Zustand/useRideStore";
import { useUserStore } from "../Zustand/useUserstore";
import axios from "axios";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from "framer-motion";
import { FiMapPin, FiNavigation, FiClock, FiDollarSign, FiX } from "react-icons/fi";
import { API_BASE_URL } from "../config";

const API_BASE = API_BASE_URL;

const Currentride = () => {
  const navigate = useNavigate();
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

  const { userId, isAuthenticated } = useUserStore();
  const { publicKey, sendTransaction } = useWallet();

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [fare, setFare] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // Helper to fetch coordinates
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

  // Calculate fare between pickup and destination
  const handleCalculateFare = async () => {
    if (!pickup || !destination) {
        alert("Please enter both pickup and destination locations.");
      return;
    }

    setIsCalculating(true);
    try {
      const pickupCoords = await getCoordinates(pickup);
      const destCoords = await getCoordinates(destination);

      if (!pickupCoords || !destCoords) {
        alert("Unable to locate one of the addresses. Please verify both locations.");
        return;
      }

      const fareData = await calculatetheprice(
        { lat: pickupCoords.lat, lng: pickupCoords.lng },
        { lat: destCoords.lat, lng: destCoords.lng }
      );

      if (fareData?.fare) {
        setFare(parseFloat(fareData.fare));
        console.log("Fare calculated:", fareData.fare);
      } else {
        alert("We could not calculate the fare right now. Please try again.");
      }
    } catch (err) {
      console.error("Failed to calculate fare:", err);
      alert("The fare calculation failed. Please try again in a moment.");
    } finally {
      setIsCalculating(false);
    }
  };

  // Book ride after fare confirmation
  const handleBookRide = async () => {
    if (!pickup || !destination) {
      alert("Please enter both pickup and destination locations.");
      return;
    }

    if (fare === 0) {
      alert("Please calculate the fare before booking.");
      return;
    }

    setIsBooking(true);
    try {
      const pickupCoords = await getCoordinates(pickup);
      const destCoords = await getCoordinates(destination);

      if (!pickupCoords || !destCoords) {
        alert("Unable to locate one of the addresses. Please verify both locations.");
        return;
      }

      await bookRide({
        pickup: {
          address: pickup,
          coordinates: { lat: pickupCoords.lat, lng: pickupCoords.lng },
        },
        destination: {
          address: destination,
          coordinates: { lat: destCoords.lat, lng: destCoords.lng },
        },
        fare: fare,
      });

      setPickup("");
      setDestination("");
      setFare(0);
      console.log("Ride booked successfully");
    } catch (err) {
      console.error("Ride booking failed:", err);
      alert("We could not complete the booking. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  // Razorpay helpers
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
      alert("The Razorpay SDK did not load. Please check your connection and try again.");
      return;
    }

    try {
      console.log("Initiating Razorpay payment for fare:", fare);

      // Step 1: Create Razorpay order
      const { data } = await axios.post(`${API_BASE}/create-orders/create-order`, {
        amount: fare,
      });

      if (!data.success) {
        throw new Error(data.message || "Payment order creation failed.");
      }

      console.log("Payment order created:", data.order.id);

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
            console.log("Verifying payment:", response.razorpay_payment_id);

            const verifyRes = await axios.post(`${API_BASE}/verify/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              rideId: currentRide._id,
            });

            if (verifyRes.data.success) {
              console.log("Payment verified successfully");
              alert("Payment successful. A receipt has been sent to your email.");

              await fetchRideHistory();
              await fetchCurrentRide();
              navigate("/order-confirmation", { state: { method: "Razorpay", paymentId: response.razorpay_payment_id } });
            } else {
              console.error("Payment verification failed:", verifyRes.data.message);
              alert(`Payment verification failed: ${verifyRes.data.message}`);
            }
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError);
            alert("We could not verify the payment. Please contact support.");
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
      console.error("Payment error:", error);
      if (error.response?.data?.message) {
        alert(`Payment error: ${error.response.data.message}`);
      } else if (error.message) {
        alert(`Payment error: ${error.message}`);
      } else {
        alert("We could not initiate the payment. Please try again.");
      }
    }
  };

  // Solana payment flow
  const handleSolanaPayment = async (fare) => {
    if (!currentRide?._id) {
      alert("No active ride could be found.");
      return;
    }

    if (!publicKey) {
      alert("Please connect your Solana wallet before proceeding.");
      return;
    }

    setIsBooking(true);

    try {
      console.log("Creating Solana payment intent...");

      // Step 1: Create payment intent on backend
      const { data } = await axios.post(`${API_BASE}/solana/initiate`, {
        amount: fare,
        rideId: currentRide._id,
        userId: userId,
      });

      if (!data.success) throw new Error("Failed to initiate Solana payment");
      const payment = data.data;

      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      const treasuryAddress = (payment.treasuryWalletAddress || "").trim();
      const treasury = new PublicKey(treasuryAddress);
      const lamports = Number.isFinite(payment.lamports)
        ? Number(payment.lamports)
        : Math.floor(Number(payment.amount) * 1e9);

      // Step 2: Create and send Solana transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasury,
          lamports,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");
      console.log("Transaction confirmed:", signature);

      // Step 3: Verify payment on backend
      const verifyRes = await axios.post(`${API_BASE}/solana/verify`, {
        rideId: currentRide._id,
        reference: payment.reference,
        txSignature: signature,
      });

      if (verifyRes.data.success) {
        alert(
          `Solana payment successful.\nView on Explorer:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
        );
        await fetchRideHistory();
        await fetchCurrentRide();
        navigate("/order-confirmation", { state: { method: "Solana", paymentId: signature } });
      } else {
        alert("Verification failed: " + verifyRes.data.message);
      }
    } catch (err) {
      console.error("Solana payment error:", err);
      alert("Solana payment failed. Please review the console for details.");
    } finally {
      setIsBooking(false);
    }
  };

  // Fetch latest ride data for authenticated users
  useEffect(() => {
    if (isAuthenticated && !currentRide) {
      fetchCurrentRide();
    }
  }, [isAuthenticated, fetchCurrentRide, currentRide]);

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (statusLower === 'confirmed') return 'bg-blue-100 text-blue-800';
    if (statusLower === 'completed') return 'bg-green-100 text-green-800';
    if (statusLower === 'cancelled') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  // UI rendering
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Current Ride</h1>
          <WalletMultiButton className="!rounded-lg !h-9 !text-sm" />
        </div>

        {!currentRide ? (
          /* Compact Book New Ride Card */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Book a New Ride</h2>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Pickup location"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />

              <input
                type="text"
                placeholder="Destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />

              {fare > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700 font-medium">Estimated Fare: ₹{fare.toFixed(2)}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCalculateFare}
                  disabled={isCalculating || !pickup || !destination}
                  className="flex-1 bg-gray-900 text-white rounded-lg py-2.5 px-4 font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCalculating ? "Calculating..." : "Calculate Fare"}
                </button>

                <button
                  onClick={handleBookRide}
                  disabled={isBooking || fare === 0}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 px-4 font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBooking ? "Booking..." : "Book Ride"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Compact Current Ride Card */
         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

  <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
    <h2 className="text-xl font-semibold text-white">Current Ride</h2>
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(currentRide.status)}`}>
      {currentRide.status}
    </span>
  </div>

  {/* Display ride OTP when pending */}
  {currentRide?.status === "pending" && (
    <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mx-6 mt-4">
      <p className="text-sm text-yellow-800 font-medium">
        Your Ride OTP:
        <span className="text-lg font-bold ml-2">
          {useRideStore.getState().rideOtp}
        </span>
      </p>
      <p className="text-xs text-yellow-600 mt-1">
        Share this OTP with your captain when they arrive.
      </p>
    </div>
  )}


              {/* Ride details */}
            <div className="p-6 space-y-4">
              {/* Route */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiMapPin className="w-4 h-4 text-green-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Pickup</p>
                    <p className="text-sm font-medium text-gray-900">{currentRide.pickup?.address || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center ml-4">
                  <div className="w-px h-6 bg-gray-300"></div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiNavigation className="w-4 h-4 text-red-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Destination</p>
                    <p className="text-sm font-medium text-gray-900">{currentRide.destination?.address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Fare */}
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Total Fare</span>
                  <span className="text-2xl font-bold text-white">₹{currentRide.fare || '0.00'}</span>
                </div>
              </div>

              {/* Payment Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={async () => {
                    try {
                      await finishRideuser(currentRide._id);
                      await fetchRideHistory();
                      await fetchCurrentRide();
                      await openRazorpayPayment(currentRide.fare);
                    } catch (error) {
                      console.error("Failed to finish ride:", error);
                      alert("Failed to finish ride: " + (error.response?.data?.message || error.message));
                    }
                  }}
                  className="bg-green-600 text-white rounded-lg py-2.5 px-4 font-medium hover:bg-green-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pay ₹{currentRide.fare} (Razorpay)
                </button>

                <button
                  onClick={async () => {
                    try {
                      await finishRideuser(currentRide._id);
                      await handleSolanaPayment(currentRide.fare);
                      await fetchRideHistory();
                      await fetchCurrentRide();
                    } catch (error) {
                      console.error("Failed Solana ride:", error);
                      alert("Solana payment failed: " + (error.response?.data?.message || error.message));
                    }
                  }}
                  className="bg-purple-600 text-white rounded-lg py-2.5 px-4 font-medium hover:bg-purple-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pay with Solana
                </button>
              </div>

              <button
                onClick={() => cancelRideUser(currentRide._id)}
                disabled={isLoading}
                className="w-full bg-red-500 text-white rounded-lg py-2.5 px-4 font-medium hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Cancelling...' : 'Cancel Ride'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Currentride;
