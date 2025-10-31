// models/payment.model.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  ride: { type: mongoose.Schema.Types.ObjectId, ref: "Ride", required: true },
    provider: { type: String, enum: ["razorpay", "solana"] },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  orderId: { type: String, required: true, index: true, unique: true },
  paymentId: { type: String },
  signature: { type: String },
  solana_reference: String,
  txSignature: String,
  amount: { type: Number }, // in INR (not paise)
  currency: { type: String, default: "INR" },
  status: {
    type: String,
    enum: ["created", "captured", "failed", "refunded"],
    default: "created",
  },
  method: { type: String },
  raw: { type: mongoose.Schema.Types.Mixed }, // store raw response for audit
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payment", paymentSchema);
