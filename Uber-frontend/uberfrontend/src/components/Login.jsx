import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiMapPin, FiStar, FiTruck } from "react-icons/fi";
import { useUserStore } from "../zustand/useUserstore"; 
import toast, { Toaster } from "react-hot-toast";
import { API_BASE_URL } from "../config";

const API_BASE = API_BASE_URL;

const Login = () => {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const setToken = useUserStore((state) => state.setToken);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // ✅ GOOGLE LOGIN SUCCESS
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/google`, {
        credential: credentialResponse.credential,
      });

      const data = response.data;

      if (response.status === 200 && data.token) {
        setUser(data.user);
        setToken(data.token);

        toast.success("Google login successful 🚀");
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Google login failed ❌");
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Google login failed. Please try again 😢");
    }
  };

  // ✅ GOOGLE LOGIN FAILURE
  const handleGoogleError = () => {
    toast.error("Google login cancelled or failed ❌");
  };

  // ✅ EMAIL/PASSWORD LOGIN
  const handlelogin = async (e) => {
    e.preventDefault();
    const allValid = [
      validate('email', email),
      validate('password', password)
    ].every(Boolean);
    if (!allValid) return;
    try {
      setIsSubmitting(true);
      const res = await axios.post(`${API_BASE}/users/login`, {
        email,
        password,
      });

      const { token } = res.data;
      localStorage.setItem("token", token);

      toast.success("Login successful 🎉");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Invalid email or password ❌");
    } finally {
      setIsSubmitting(false);
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
                <h2 className="text-2xl font-semibold text-gray-900 text-center">Welcome back</h2>
                <p className="text-gray-500 mt-2 text-center">Sign in to continue your journey.</p>

                <form className="mt-6 space-y-4" onSubmit={handlelogin} noValidate>
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
                    aria-label="Sign in"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center rounded-lg bg-black text-white py-3 px-4 text-sm font-semibold shadow-md transition-all hover:bg-gray-900 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting && (
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    )}
                    Sign in
                  </button>

                  <div className="flex items-center gap-3 my-2">
                    <div className="h-px w-full bg-gray-200" />
                    <span className="text-xs text-gray-500">or</span>
                    <div className="h-px w-full bg-gray-200" />
                  </div>

                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap={false}
                      theme="outline"
                      size="large"
                      text="continue_with"
                      shape="rectangular"
                    />
                  </div>

                  <div className="text-center text-sm text-gray-600 mt-4">
                    New to Ride?{" "}
                    <button
                      type="button"
                      onClick={() => navigate('/Welcome')}
                      className="text-purple-600 hover:underline hover:text-purple-500 font-medium"
                    >
                      Create account
                    </button>
                  </div>

                  <div className="text-center text-sm text-gray-600">
                    Are you a driver?{" "}
                    <button
                      type="button"
                      onClick={() => navigate('/captainlogin')}
                      className="text-purple-600 hover:underline hover:text-purple-500 font-medium"
                    >
                      Login as Captain
                    </button>
                  </div>
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
              <h2 className="text-xl font-medium text-gray-300 mt-3">Go anywhere with Ride</h2>
              <p className="mt-5 text-gray-300">
                Your ride, ready when you are. Book, track, and arrive — safely and effortlessly.
              </p>

              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-600/20 text-purple-400"><FiTruck /></span>
                  <span className="text-sm text-gray-300">Reliable rides in minutes</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-600/20 text-purple-400"><FiMapPin /></span>
                  <span className="text-sm text-gray-300">Available in 10,000+ cities</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-600/20 text-purple-400"><FiStar /></span>
                  <span className="text-sm text-gray-300">Trusted by millions worldwide</span>
                </li>
              </ul>
            </div>
          </motion.section>
        </div>
      </div>

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default Login;
