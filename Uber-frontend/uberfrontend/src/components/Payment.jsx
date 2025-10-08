import React from "react";
import axios from "axios";

const Payment = () => {

  const handlePayment = async () => {
    try {
      const { data } = await axios.post("http://localhost:5000/create-orders/create-order", {
        amount: 500, // ₹500
      });

      const options = {
        key: data.key, 
        amount: data.order.amount, 
        currency: data.order.currency,
        name: "Uber Clone",
        description: "Ride Payment",
        image: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png",
        order_id: data.order.id,
        handler: async function (response) {
          const res = await axios.post("http://localhost:5000/verify/verify-payment", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (res.data.success) {
            alert("✅ Payment Successful!");
          } else {
            alert("❌ Payment Verification Failed!");
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
      console.error(error);
      alert("Error while initiating payment");
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
