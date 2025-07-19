import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom"; 
import axios from "axios";

const CaptainLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); 
  const [errorMessage, setErrorMessage] = useState(null); 

  const handleLogin = async (e) => { 
    e.preventDefault(); 
    setLoading(true); 
    setErrorMessage(null); 

    try {
      const res = await axios.post("http://localhost:5000/captains/login", {
        email,
        password,
      });

      const { token } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", "captain"); 

      console.log("Captain Login successful:", res.data);
      navigate("/capdashboard"); 
    } catch (error) {
      console.error("Captain Login failed:", error.response ? error.response.data : error.message);
      setErrorMessage(error.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen w-screen flex">
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
            <div>
              <strong className="block text-white text-xl">1B+</strong>
              Trips
            </div>
            <div>
              <strong className="block text-white text-xl">10K+</strong>
              Cities
            </div>
            <div>
              <strong className="block text-white text-xl">4.9★</strong>
              Rating
            </div>
          </div>
        </div>
      </div>

      <div className="w-1/2 flex justify-center items-center bg-gray-50 p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
            {/* Captain-specific Heading */}
            <h2 className="text-2xl text-center font-bold text-gray-800 mb-8">
              Captain: What's your phone number or email?
            </h2>

            {/* Display error message if any */}
            {errorMessage && (
              <p className="text-red-500 text-center text-sm mb-4">{errorMessage}</p>
            )}

            <form className="space-y-4" onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Enter email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded-xl bg-gray-200 text-black w-full"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded-xl bg-gray-200 text-black w-full"
                required
              />
              <button
                type="submit" 
                className="bg-black text-white w-full py-2 rounded-lg font-semibold hover:bg-gray-800 transition mt-6"
                disabled={loading} 
              >
                {loading ? 'Logging in...' : 'Captain Login'} {/* Changed text */}
              </button>
            </form>
          </div> 
          <div className="text-center text-sm text-gray-500 my-4">or</div>

          <button className="flex items-center justify-center gap-2 w-full border py-2 rounded-lg mb-3">
            <FaGoogle /> Continue with Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            New to Uber as a Captain?{" "}
            <Link
              to="/captain/register" 
              className="text-black font-medium cursor-pointer hover:underline"
            >
              Register
            </Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-2">
            By proceeding, you consent to receiving calls, WhatsApp or SMS/RCS messages,
            including by automated means, from Uber and its affiliates to the number provided.
            <span className="underline cursor-pointer"> Terms of Service</span> and
            <span className="underline cursor-pointer"> Privacy Policy</span>.
          </p>

          <p className="text-center text-xs text-gray-400 mt-4">
            Need help? <span className="underline cursor-pointer">Contact support</span>
          </p>
        </div> 
      </div>
    </div>
  );
};

export default CaptainLogin;