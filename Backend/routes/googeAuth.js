const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User =  require('../models/usermodel');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: "No credential provided" });

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub  } = payload;

    if (!email) return res.status(400).json({ message: "No email in Google token" });

    let user = await User.findOne({ email });
    if (!user) {    
      user = new User({
        name,
        email,
        googleId: sub,
        profilePic: picture,
        authProvider: "google"
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = sub;
      user.profilePic = user.profilePic || picture;
      user.authProvider = user.authProvider || "google";
      await user.save();
    }

    const appToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token: appToken, user: {
      id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      authProvider: user.authProvider
    }});
  } catch (err) {
    console.error("Google login error:", err);
    return res.status(401).json({ message: "Invalid Google token", error: err.message });
  }
});

module.exports = router;
