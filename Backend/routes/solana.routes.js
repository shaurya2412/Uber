const express = require("express");
const crypto = require("crypto");
const { Connection, PublicKey } = require("@solana/web3.js");
const Payment = require("../models/payment.model");
const Ride = require("../models/ride.model");

const router = express.Router();

const SOLANA_URL =
  process.env.SOLANA_NETWORK === "mainnet-beta"
    ? "https://api.mainnet-beta.solana.com"
    : "https://api.devnet.solana.com";
const TREASURY_WALLET = process.env.SOLANA_TREASURY_WALLET;
const INR_TO_SOL_RATE = parseFloat(process.env.INR_TO_SOL_RATE || "0.00005");

/**
 * POST /solana/initiate
 * Creates a Solana payment intent
 */
router.post("/initiate", async (req, res) => {
  try {
    const { amount, rideId, userId } = req.body;

    if (!amount || amount <= 0)
      return res.status(400).json({ success: false, message: "Invalid amount" });

    // Validate treasury wallet address early and normalize
    const treasury = (TREASURY_WALLET || "").trim();
    try {
      // throws if invalid
      // eslint-disable-next-line no-new
      new PublicKey(treasury);
    } catch (e) {
      console.error("❌ Invalid SOLANA_TREASURY_WALLET env value:", TREASURY_WALLET);
      return res.status(500).json({ success: false, message: "Payment service misconfigured: invalid treasury wallet" });
    }

    const solAmount = Number(amount) * INR_TO_SOL_RATE;
    const expectedLamports = Math.floor(solAmount * 1e9);
    const reference = crypto.randomUUID();
    const orderId = `sol_${reference}`;

    await Payment.create({
      ride: rideId,
      user: userId,
      provider: "solana",
      orderId,
      solana_reference: reference,
      amount,
      currency: "INR",
      status: "created",
      method: "solana",
    });

    return res.json({
      success: true,
      provider: "solana",
      data: {
        treasuryWalletAddress: treasury,
        amount: Number(solAmount.toFixed(9)),
        lamports: expectedLamports,
        reference,
        orderId,
        network: process.env.SOLANA_NETWORK || "devnet",
        message: `Ride payment via Solana`,
      },
    });
  } catch (err) {
    console.error("❌ Solana initiate error:", err);
    res.status(500).json({ success: false, message: "Payment initiation failed" });
  }
});

/**
 * POST /solana/verify
 * Verifies Solana on-chain transaction and marks ride paid
 */
// ✅ VERIFY SOLANA PAYMENT
router.post("/verify", async (req, res) => {
  try {
    const { rideId, reference, txSignature } = req.body;

    if (!rideId || !reference || !txSignature) {
      return res.status(400).json({
        success: false,
        message: "Missing fields — rideId, reference, or txSignature is required",
      });
    }

    console.log("🔍 Verifying Solana payment...");
    console.log("🧾 Reference:", reference);
    console.log("🔗 Signature:", txSignature);

    const connection = new Connection(SOLANA_URL, "confirmed");

    // Step 1️⃣: Fetch transaction data from the blockchain
    const tx = await connection.getParsedTransaction(txSignature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      return res.status(400).json({
        success: false,
        message: "Transaction not confirmed yet or invalid signature",
      });
    }

    // Step 2️⃣: Load Payment record
    const payment = await Payment.findOne({ solana_reference: reference });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // Step 3️⃣: Fetch latest treasury balance (safe universal check)
    const treasuryPubKey = new PublicKey(TREASURY_WALLET);
    const afterBalance = await connection.getBalance(treasuryPubKey);
    const receivedLamports = afterBalance;

    console.log("💰 Treasury current balance:", afterBalance);

    // Step 4️⃣: Compare against expected amount
    const expectedLamports = Math.floor(payment.amount * INR_TO_SOL_RATE * 1e9);
    const tolerance = 10000; // ~0.00001 SOL
    const verified = receivedLamports + tolerance >= expectedLamports;

    console.log("💰 Expected:", expectedLamports);
    console.log("💰 Received:", receivedLamports);
    console.log("💰 Verified:", verified);

    // Step 5️⃣: Handle verification result
    if (!verified) {
      await Payment.findOneAndUpdate(
        { solana_reference: reference },
        { status: "failed", txSignature, raw: tx }
      );
      return res.status(400).json({
        success: false,
        message: "Insufficient amount received",
        receivedLamports,
        expectedLamports,
      });
    }

    // Step 6️⃣: Mark payment + ride as successful
    await Payment.findOneAndUpdate(
      { solana_reference: reference },
      {
        status: "captured",
        txSignature,
        raw: tx,
      }
    );

    await Ride.findByIdAndUpdate(rideId, {
      paymentStatus: "paid",
      paymentId: txSignature,
      paidAt: new Date(),
      paymentMethod: "solana",
    });

    // Optional: send email receipt (same as Razorpay flow)
    try {
      await sendRideReceipt(rideId, txSignature);
      console.log(`📧 Receipt sent for ride ${rideId}`);
    } catch (e) {
      console.warn("⚠️ Payment verified but receipt email failed:", e.message);
    }

    console.log(
      `✅ Verified Solana payment: https://explorer.solana.com/tx/${txSignature}?cluster=devnet`
    );

    return res.json({
      success: true,
      message: "Solana payment verified successfully",
      txSignature,
      explorer: `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`,
      receivedLamports,
      expectedLamports,
    });
  } catch (err) {
    console.error("❌ Solana verify error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Verification failed", error: err.message });
  }
});

module.exports = router;
