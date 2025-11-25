import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom"; 
import axios from "axios";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiMapPin, FiStar, FiTruck } from "react-icons/fi";
import { API_BASE_URL } from "../config";

const API_BASE = API_BASE_URL;

const CaptainLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [errorMessage, setErrorMessage] = useState(null); 
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validate = (field, value) => {
    let message = '';
    if (field === 'email') {
      const ok = /[^@\s]+@[^@\s]+\.[^@\s]+/.test(value) || /^\+?[0-9]{7,15}$/.test(value);
      if (!ok) message = 'Enter a valid email or phone';
    }
    if (field === 'password') {
      if (value.length < 6) message = 'Min 6 characters';
    }
    setErrors((e) => ({ ...e, [field]: message }));
    return message === '';
  };

  const handleLogin = async (e) => { 
    e.preventDefault(); 
    const allValid = [
      validate('email', email),
      validate('password', password)
    ].every(Boolean);
    if (!allValid) return;
    setLoading(true); 
    setErrorMessage(null); 

    try {
      const res = await axios.post(`${API_BASE}/captains/login`, {
        email,
        password,
      });

 const token = res.data.captaintoken;
localStorage.setItem("captaintoken", token);

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
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-gray-50">
      <div className="relative max-w-6xl mx-auto py-12 px-8 lg:px-16">
        <div className="hidden lg:block absolute inset-y-12 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-gray-200 to-transparent" aria-hidden></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Right panel (form) first on mobile */}
          <motion.section
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="order-1 lg:order-2 bg-gray-50 rounded-2xl p-6 sm:p-7 flex items-center justify-center"
          >
            <div className="w-full max-w-md">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-gray-900 text-center">Captain Login</h2>
                <p className="text-gray-500 mt-2 text-center">Sign in to start driving.</p>

                {errorMessage && (
                  <p className="text-red-600 text-center text-sm mt-4">{errorMessage}</p>
                )}

                <form className="mt-6 space-y-4" onSubmit={handleLogin} noValidate>
                  <div>
                    <input
                      aria-label="Email or phone"
                      type="text"
                      placeholder="Email or phone number"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); validate('email', e.target.value); }}
                      className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                  </div>

                  <div className="relative">
                    <input
                      aria-label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); validate('password', e.target.value); }}
                      className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute inset-y-0 right-3 my-auto h-8 w-8 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                    {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                  </div>

                  <button
                    type="submit" 
                    aria-label="Captain Login"
                    className="w-full inline-flex items-center justify-center rounded-lg bg-black text-white py-3 px-4 text-sm font-semibold shadow-md transition-all hover:bg-gray-900 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={loading} 
                  >
                    {loading && (
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    )}
                    {loading ? 'Logging in...' : 'Captain Login'}
                  </button>

                  <div className="flex items-center gap-3 my-3">
                    <div className="h-px w-full bg-gray-200" />
                    <span className="text-xs text-gray-500">or</span>
                    <div className="h-px w-full bg-gray-200" />
                  </div>

                  <button type="button" className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 hover:bg-gray-50 transition-colors">
                    <FaGoogle className="text-[#4285F4]" /> Continue with Google
                  </button>

                  <div className="text-center text-sm text-gray-600 mt-4">
                    New to Ride as a Captain?{" "}
                    <Link to="/captainregister" className="text-purple-600 hover:underline hover:text-purple-500 font-medium">Register</Link>
                  </div>

                  <p className="text-center text-xs text-gray-400 mt-2">
                    By proceeding, you consent to our <span className="underline">Terms of Service</span> & <span className="underline">Privacy Policy</span>.
                  </p>
                </form>
              </div>
            </div>
          </motion.section>

          {/* Left panel - brand */}
          <motion.section
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="order-2 lg:order-1 bg-gradient-to-b from-black via-gray-900 to-black text-gray-100 rounded-2xl p-8 flex items-center"
          >
            <div className="max-w-md">
              <h1 className="text-4xl font-extrabold tracking-tight">Ride</h1>
              <h2 className="text-xl font-medium text-gray-300 mt-3">Drive with Ride</h2>
              <p className="mt-5 text-gray-300">
                Set your own schedule, be your own boss, and start earning with confidence.
              </p>

              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-600/20 text-purple-400"><FiTruck /></span>
                  <span className="text-sm text-gray-300">Flexible hours and earnings</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-600/20 text-purple-400"><FiMapPin /></span>
                  <span className="text-sm text-gray-300">Drive in your own city</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-600/20 text-purple-400"><FiStar /></span>
                  <span className="text-sm text-gray-300">Join millions of drivers worldwide</span>
                </li>
              </ul>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default CaptainLogin;