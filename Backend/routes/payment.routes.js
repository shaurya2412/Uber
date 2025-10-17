const express = require("express");
const Razorpay = require("razorpay");
const router = express.Router();

router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    // Check if Razorpay credentials are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
      console.error("❌ Razorpay credentials not configured");
      return res.status(500).json({
        success: false,
        message: "Payment service not configured. Please contact support.",
        error: "RAZORPAY_CREDENTIALS_MISSING"
      });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount provided"
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`,
    };

    console.log("🔄 Creating Razorpay order for amount:", amount);
    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({
        success: false,
        message: "Failed to create payment order"
      });
    }

    console.log("✅ Razorpay order created:", order.id);
    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("❌ Razorpay error:", error);
    
    // Provide specific error messages
    if (error.error && error.error.code) {
      return res.status(400).json({
        success: false,
        message: `Payment error: ${error.error.description}`,
        error: error.error.code
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Payment service temporarily unavailable",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
});

module.exports = router;
