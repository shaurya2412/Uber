const express = require("express");
const router = express.Router();
const { sendEmail } = require("../services/emailService");
const { generateTripReceiptHTML } = require("../services/receiptTemplate");

router.get("/test-receipt", async (req, res) => {
  const tripData = {
    user: { name: "Shaurya", email: "shauryaa2412@gmail.com" },
    tripId: "UBR102938",
    pickup: "Sector 18, Noida",
    drop: "Connaught Place, New Delhi",
    fare: 184.5,
    distance: 12.4,
    duration: "00:22:45",
    carType: "Black Sedan",
    paymentMethod: "Razorpay - **** 3219",
    receiptNo: "RCP1845",
    mapUrl:
      "https://maps.googleapis.com/maps/api/staticmap?size=300x200&path=color:0x0000ff|weight:3|28.567|77.324|28.628|77.218&key=YOUR_MAPS_API_KEY",
    date: "16 Oct 2025, 10:22 PM",
  };

  try {
    await sendEmail({
      to: tripData.user.email,
      subject: `Your Ride Receipt - ${tripData.tripId}`,
      html: generateTripReceiptHTML(tripData),
    });
    res.send("✅ Trip receipt sent successfully!");
  } catch (error) {
    console.error("❌ Error sending receipt:", error);
    res.status(500).send("Error sending receipt.");
  }
});

module.exports = router;
