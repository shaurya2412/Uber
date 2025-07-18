import React, { useState } from "react";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Welcome = () => {
  const navigate = useNavigate();

  // States for form fields
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/users/register", {
        fullname: {
          firstname,
          lastname,
        },
        email,
        password,
      });

      console.log("Registered:", res.data);
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Something went wrong while registering.");
    }
  };

  return (
    <div className="min-h-screen w-screen flex">
      {/* Left Side - Banner / Info */}
      <div className="w-1/2 bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] text-white p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-4">Uber</h1>
          <h2 className="text-2xl font-semibold mb-6">Go anywhere with Uber</h2>
          <p className="mb-6 text-gray-300">
            Request a ride, hop in, and go. Choose from a variety of ride types and get where you need to be.
          </p>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-center gap-2">🚗 Reliable rides in minutes</li>
            <li className="flex items-center gap-2">📍 Available in 10,000+ cities</li>
            <li className="flex items-center gap-2">⭐ Trusted by millions worldwide</li>
          </ul>
          <div className="mt-10 border-t border-gray-700 pt-6 text-sm text-gray-400 grid grid-cols-3 gap-4">
            <div><strong className="block text-white text-xl">1B+</strong>Trips</div>
            <div><strong className="block text-white text-xl">10K+</strong>Cities</div>
            <div><strong className="block text-white text-xl">4.9★</strong>Rating</div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-1/2 flex justify-center items-center bg-gray-50 p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
            <h2 className="text-2xl text-center font-bold text-gray-500 mb-2">Get started</h2>
            <p className="text-center text-gray-600 mb-6">Create your account to start riding</p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First name"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded text-black w-full"
                  required
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded text-black w-full"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded text-black w-full"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded text-black w-full"
                />
              </div>

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded text-black w-full"
                required
              />

              <button
                type="submit"
                className="bg-black text-white w-full py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                Create account →
              </button>
            </form>
          </div>

          <div className="text-center text-sm text-gray-500 mb-4">or</div>

          <button className="flex items-center justify-center gap-2 w-full border py-2 rounded-lg mb-3">
            <FaGoogle /> Continue with Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <span
              onClick={() => navigate('/login')}
              className="text-black font-medium cursor-pointer hover:underline"
            >
              Sign in
            </span>
          </p>

          <p className="text-center text-xs text-gray-400 mt-2">
            By creating an account, you agree to our{" "}
            <span className="underline cursor-pointer">Terms of Service</span> and{" "}
            <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>

          <p className="text-center text-xs text-gray-400 mt-4">
            Need help? <span className="underline cursor-pointer">Contact support</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
