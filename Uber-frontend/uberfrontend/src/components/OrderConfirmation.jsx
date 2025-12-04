import React, { useMemo, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useRideStore } from "../Zustand/useRideStore";
import { useUserStore } from "../Zustand/useUserstore";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location || {};
  const method = state?.method || "Paid"; // Razorpay | Solana | Paid
  const paymentId = state?.paymentId || "-";

  const { rideHistory, currentRide, fetchRideHistory } = useRideStore();
  const { user, isAuthenticated, fetchProfile } = useUserStore();

  useEffect(() => {
    // Ensure we have the latest user and ride data
    if (isAuthenticated && (!rideHistory || rideHistory.length === 0)) {
      fetchRideHistory?.();
    }
    if (!user && isAuthenticated) {
      fetchProfile?.();
    }
  }, [isAuthenticated, rideHistory, user, fetchRideHistory, fetchProfile]);

  const ride = useMemo(() => {
    // Prefer currentRide if present; otherwise, last completed ride
    if (currentRide) return currentRide;
    const sorted = [...(rideHistory || [])].sort(
      (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
    );
    return sorted.find((r) => r?.status === "completed") || sorted[0] || null;
  }, [currentRide, rideHistory]);

  const orderNumber = useMemo(() => {
    const base = ride?._id || Math.random().toString(36).slice(2, 10);
    return `#${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${base.slice(-6)}`;
  }, [ride]);

  const totalAmount = ride?.fare ? Number(ride.fare).toFixed(2) : "0.00";
  const shippingMethod = "standard shipping";
  const paymentMethod = method === "Solana" ? "Solana" : method === "Razorpay" ? "Razorpay" : "Paid";

  const name = user?.name || user?.fullName || user?.username || "—";
  const email = user?.email || "—";
  const phone = user?.phone || user?.mobile || "—";
  const address = ride?.destination?.address || ride?.pickup?.address || "—";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Thank you + Billing */}
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">Thank you for your purchase!</h1>
          <p className="mt-4 text-gray-500 max-w-md">Your order will be processed within 24 hours during working days. We will notify you by email once your order has been shipped.</p>

          <div className="mt-10">
            <h2 className="text-lg font-semibold text-gray-900">Billing address</h2>
            <div className="mt-5 space-y-4 text-sm text-gray-700">
              <div className="flex gap-6">
                <span className="w-24 text-gray-500">Name</span>
                <span>{name}</span>
              </div>
              <div className="flex gap-6">
                <span className="w-24 text-gray-500">Address</span>
                <span className="capitalize">{address}</span>
              </div>
              <div className="flex gap-6">
                <span className="w-24 text-gray-500">Phone</span>
                <span>{phone}</span>
              </div>
              <div className="flex gap-6">
                <span className="w-24 text-gray-500">Email</span>
                <span>{email}</span>
              </div>
            </div>

            <div className="mt-8">
              <Link to="/rides" className="inline-flex items-center rounded-full px-5 py-3 bg-rose-500 text-white hover:bg-rose-600">Track Your Order</Link>
            </div>
          </div>
        </div>

        {/* Right Panel - Order Summary */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <h3 className="text-2xl font-semibold text-gray-900">Order Summary</h3>

          <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-medium text-gray-900">{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
            </div>
            <div>
              <p className="text-gray-500">Order Number</p>
              <p className="font-medium text-gray-900">{orderNumber}</p>
            </div>
            <div>
              <p className="text-gray-500">Payment Method</p>
              <p className="font-medium text-gray-900">{paymentMethod}</p>
            </div>
          </div>

          {/* Ride items */}
          <div className="mt-6 border-t pt-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-white border flex items-center justify-center">
                <span className="text-lg">🚖</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Start</p>
                <p className="text-sm text-gray-600 capitalize">{ride?.pickup?.address || "—"}</p>
              </div>
              <div className="text-right font-medium text-gray-900">₹0.00</div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-white border flex items-center justify-center">
                <span className="text-lg">🏁</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Finish</p>
                <p className="text-sm text-gray-600 capitalize">{ride?.destination?.address || "—"}</p>
              </div>
              <div className="text-right font-medium text-gray-900">₹{Number(totalAmount).toFixed(2)}</div>
            </div>
          </div>

          {/* Captain details */}
          <div className="mt-6 rounded-xl bg-white border p-4">
            <p className="text-sm text-gray-500">Captain</p>
            <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{ride?.captain?.name || ride?.captain?.fullName || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{ride?.captain?.phone || ride?.captain?.mobile || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500">Vehicle</p>
                <p className="font-medium text-gray-900">{ride?.captain?.vehicle?.model || ride?.captain?.vehicleModel || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500">Plate</p>
                <p className="font-medium text-gray-900">{ride?.captain?.vehicle?.plate || ride?.captain?.vehicleNumber || "—"}</p>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="mt-6 border-t pt-6 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Sub Total</span>
              <span className="text-gray-900">₹{Number(totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-900">₹0.00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">₹0.00</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t font-semibold text-gray-900">
              <span>Order Total</span>
              <span>₹{Number(totalAmount).toFixed(2)}</span>
            </div>
          </div>

          {/* Payment reference */}
          <div className="mt-6 text-xs text-gray-500">
            <p>Payment ID: <span className="font-mono text-gray-700">{paymentId}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;


