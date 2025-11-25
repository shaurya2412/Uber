import React from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

const API_BASE = API_BASE_URL;

const Payment = () => {

  const handlePayment = async () => {
    try {
      console.log("🔄 Initiating test payment for ₹500");
      
      const { data } = await axios.post(`${API_BASE}/create-orders/create-order`, {
        amount: 500, // ₹500
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to create payment order");
      }

      console.log("✅ Payment order created:", data.order.id);

      const options = {
        key: data.key, 
        amount: data.order.amount, 
        currency: data.order.currency,
        name: "Uber Clone",
        description: "Ride Payment Test",
        image: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png",
        order_id: data.order.id,
        handler: async function (response) {
          try {
            console.log("🔄 Verifying payment:", response.razorpay_payment_id);
            
            const res = await axios.post(`${API_BASE}/verify/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (res.data.success) {
              console.log("✅ Payment verified successfully");
              alert("✅ Payment Successful!");
            } else {
              console.error("❌ Payment verification failed:", res.data.message);
              alert(`❌ Payment Verification Failed: ${res.data.message}`);
            }
          } catch (verifyError) {
            console.error("❌ Payment verification error:", verifyError);
            alert("❌ Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "Test User",
          email: "testuser@example.com",
          contact: "9999999999",
        },
        notes: {
          address: "Uber Payment Testing",
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
        alert("Error while initiating payment. Please check your internet connection and try again.");
      }
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "60px" }}>
      <h2>🚗 Pay for your ride</h2>
      <button
        style={{
          backgroundColor: "black",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
        }}
        onClick={handlePayment}
      >
        Pay ₹500
      </button>
    </div>
  );
};

export default Payment;
