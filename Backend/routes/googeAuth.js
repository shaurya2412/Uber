const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/usermodel");

const router = express.Router();
const googleClientId =
  process.env.GOOGLE_CLIENT_ID ||
  process.env.VITE_GOOGLE_CLIENT_ID ||
  "847766407074-2dbvej5askqhrjg1dskldisqclrjd9cn.apps.googleusercontent.com";

const client = new OAuth2Client(googleClientId);

router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "No credential provided" });
    }

    let payload;
    if (credential === "test_google_credential" || credential === "mock_google_token") {
      // Test credential bypass for testing without live Google popup
      payload = {
        email: "nexus.rider@gmail.com",
        name: "Nexus Rider",
        picture:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        sub: "google_1029384756",
      };
    } else {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
      });
      payload = ticket.getPayload();
    }

    const { email, name, picture, sub } = payload;
    if (!email) {
      return res.status(400).json({ message: "No email in Google token" });
    }

    let user;
    if (User.db.readyState === 1) {
      try {
        user = await User.findOne({ email });
        if (!user) {
          user = new User({
            name: name || "Google User",
            fullname: {
              firstname: (name || "Google").split(" ")[0] || "Google",
              lastname: (name || "").split(" ").slice(1).join(" ") || "User",
            },
            email,
            googleId: sub,
            profilePic: picture,
            authProvider: "google",
            role: "user",
          });
          await user.save();
        } else if (!user.googleId) {
          user.googleId = sub;
          user.profilePic = user.profilePic || picture;
          user.authProvider = user.authProvider || "google";
          await user.save();
        }
      } catch (dbErr) {
        console.warn("MongoDB warning during Google auth:", dbErr.message);
      }
    }

    if (!user) {
      user = {
        _id: "google_" + String(sub || Date.now()).slice(-8),
        name: name || "Google User",
        fullname: {
          firstname: (name || "Google").split(" ")[0] || "Google",
          lastname: (name || "").split(" ").slice(1).join(" ") || "User",
        },
        email,
        profilePic: picture,
        authProvider: "google",
        role: "user",
      };
    }

    const secret = process.env.JWT_SECRET || "Jwttoken";
    const appToken = jwt.sign(
      {
        _id: user._id,
        id: user._id,
        email: user.email,
        role: user.role || "user",
      },
      secret,
      { expiresIn: "7d" }
    );

    return res.json({
      token: appToken,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name || (user.fullname ? `${user.fullname.firstname} ${user.fullname.lastname}` : "Google User"),
        email: user.email,
        profilePic: user.profilePic,
        authProvider: user.authProvider || "google",
        role: user.role || "user",
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    return res
      .status(401)
      .json({ message: "Invalid Google token", error: err.message });
  }
});

module.exports = router;
