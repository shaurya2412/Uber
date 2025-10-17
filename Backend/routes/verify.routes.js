const express = require("express");
const crypto = require("crypto");
const { sendRideReceipt } = require("../services/receiptService");
const rideModel = require("../models/ride.model");

const router = express.Router();

// Payment verification route with receipt email integration
router.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, rideId } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(sign)
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Update ride payment status
      if (rideId) {
        await rideModel.findByIdAndUpdate(rideId, {
          paymentStatus: 'paid',
          paymentId: razorpay_payment_id,
          paidAt: new Date()
        });
      }

      // Send receipt email if rideId is provided
      if (rideId) {
        try {
          await sendRideReceipt(rideId, razorpay_payment_id);
          console.log(`✅ Receipt sent for ride ${rideId} after payment verification`);
        } catch (receiptError) {
          console.error('⚠️ Payment verified but receipt failed:', receiptError);
          // Don't fail the payment verification if receipt fails
        }
      }

      res.json({ 
        success: true, 
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id
      });
    } else {
      res.json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to manually trigger receipt for completed rides
router.post("/send-receipt/:rideId", async (req, res) => {
  try {
    const { rideId } = req.params;
    
    if (!rideId) {
      return res.status(400).json({
        success: false,
        message: "Ride ID is required"
      });
    }

    await sendRideReceipt(rideId, "MANUAL_TRIGGER");
    
    res.json({
      success: true,
      message: "Receipt sent successfully",
      rideId
    });
  } catch (error) {
    console.error("Error sending manual receipt:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send receipt",
      error: error.message
    });
  }
});

module.exports = router;
