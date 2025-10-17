const express = require("express");
const router = express.Router();
const { sendTestReceipt } = require("../services/receiptService");

// Test route for receipt email with enhanced template
router.get("/test-receipt", async (req, res) => {
  try {
    const result = await sendTestReceipt();
    res.json({ success: true, message: result.message });
  } catch (error) {
    console.error("❌ Error sending test receipt:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error sending test receipt.",
      error: error.message 
    });
  }
});

module.exports = router;
