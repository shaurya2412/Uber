import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";
import { FiTruck, FiMapPin, FiStar, FiEye, FiEyeOff } from "react-icons/fi";
import { useUserStore } from "../Zustand/useUserstore";
import toast, { Toaster } from "react-hot-toast";
import { API_BASE_URL } from "../config";
import nexuslogo from "../assets/nexuslogo.png";

const API_BASE = API_BASE_URL;

const Welcome = () => {
  const navigate = useNavigate();

  // States for form fields
  const setUser = useUserStore((state) => state.setUser);
  const setToken = useUserStore((state) => state.setToken);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ firstname: '', lastname: '', email: '', phone: '', password: '' });

  const validate = (field, value) => {
    let message = '';
    if (field === 'firstname' || field === 'lastname') {
      if (!value.trim()) message = 'Required';
    }
    if (field === 'email') {
      const ok = /[^@\s]+@[^@\s]+\.[^@\s]+/.test(value);
      if (!ok) message = 'Enter a valid email';
    }
    if (field === 'phone') {
      const ok = value === '' || /^\+?[0-9]{7,15}$/.test(value);
      if (!ok) message = 'Enter a valid phone number';
    }
    if (field === 'password') {
      if (value.length < 6) message = 'Min 6 characters';
    }
    setErrors((e) => ({ ...e, [field]: message }));
    return message === '';
  };

  
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log("Google Credential:", credentialResponse);
      
      const response = await axios.post(`${API_BASE}/auth/google`, {
        credential: credentialResponse.credential
      });

      const data = response.data;
      console.log(credentialResponse.credential);
      console.log(response.data);
      if (response.status === 200 && data.token) {
        console.log("Login successful:", data);
        setUser(data.user);
        setToken(data.token);
        navigate("/dashboard");
      } else {
        console.error("Login failed:", data.message || "Unknown error");
        alert(`Login failed: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Google login error:", error);
      alert("Google login failed hihihihi. Please try again.");
    }
  };

  const handleGoogleError = () => {
    console.log("Google Login Failed");
    alert("Google login failed hihihi2. Please try again.");
  };


  const handleRegister = async (e) => {
    e.preventDefault();
    const allValid = [
      validate('firstname', firstname),
      validate('lastname', lastname),
      validate('email', email),
      validate('phone', phone),
      validate('password', password)
    ].every(Boolean);
    if (!allValid) return;

    try {
      setIsSubmitting(true);
      const res = await axios.post(`${API_BASE}/users/register`, {
        fullname: {
          firstname,
          lastname,
        },
        email,
        phone,
        password,
      });
toast.success("new user registered");
      console.log("Registered:", res.data);
      navigate('/login');
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Something went wrong while registering.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-gray-100 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-32 left-12 w-72 h-72 bg-gradient-to-br from-gray-100 to-transparent blur-3xl opacity-60" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tr from-gray-100 to-transparent blur-3xl opacity-50" />
      </div>

      <div className="relative max-w-6xl mx-auto py-12 lg:py-16 px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">

          {/* Left panel - brand storytelling */}
          <motion.section
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1 bg-gradient-to-b from-gray-900 via-gray-850 to-gray-900 text-white rounded-3xl p-10 flex flex-col justify-between shadow-2xl shadow-gray-900/30 relative overflow-hidden"
          >
            <div className="absolute inset-x-0 -top-10 h-40 bg-gradient-to-b from-white/10 to-transparent opacity-70" />
            <div className="absolute inset-y-0 right-0 w-52 bg-gradient-to-l from-white/5 to-transparent opacity-40" />

            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <img 
                  src={nexuslogo} 
                  alt="Nexus Ride Logo" 
                  className="h-10 w-auto object-contain"
                />
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-white/70">
                    Nexus
                  </p>
                  <h1 className="text-3xl font-semibold tracking-tight">Ride Better</h1>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-4xl font-bold leading-tight">Your ride, ready when you are.</h2>
                <p className="text-gray-200 text-lg leading-relaxed">
                  Book premium trips, track every move, and arrive with ease. Seamless booking, real-time support, and trusted drivers in every city.
                </p>
              </div>

              <ul className="space-y-5">
                {[
                  { icon: FiTruck, title: "Reliable rides in minutes", desc: "Executive fleet on standby" },
                  { icon: FiMapPin, title: "Available in 10k+ cities", desc: "Global presence, local comfort" },
                  { icon: FiStar, title: "4.9/5 rider rating", desc: "Loved by millions worldwide" },
                ].map(({ icon: Icon, title, desc }) => (
                  <li key={title} className="flex gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="text-sm text-gray-300 mt-0.5">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-6 pt-8 border-t border-white/10 text-center text-sm text-gray-300">
              <div>
                <p className="text-3xl font-bold text-white">1B+</p>
                <p>Trips completed</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">65</p>
                <p>Countries</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">24/7</p>
                <p>Live support</p>
              </div>
            </div>
          </motion.section>

          {/* Right panel - form */}
          <motion.section
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2 bg-white/60 backdrop-blur-sm rounded-3xl p-1 shadow-2xl shadow-gray-900/10 border border-gray-200/60 flex items-center justify-center"
          >
            <div className="w-full max-w-md bg-white rounded-[28px] p-8 sm:p-9">
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.4em] text-gray-500 font-semibold">Create account</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-2">Join Nexus</h2>
                <p className="text-gray-500 mt-1">Complete your user profile and start rides.</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        aria-label="First name"
                        type="text"
                        placeholder="First name"
                        value={firstname}
                        onChange={(e) => { setFirstname(e.target.value); validate('firstname', e.target.value); }}
                        className={`w-full rounded-xl border ${errors.firstname ? 'border-red-300' : 'border-gray-300'} bg-white text-sm text-gray-900 placeholder:text-gray-400 py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all`}
                        required
                      />
                      {errors.firstname && <p className="mt-1.5 text-xs text-red-600">{errors.firstname}</p>}
                    </div>
                    <div>
                      <input
                        aria-label="Last name"
                        type="text"
                        placeholder="Last name"
                        value={lastname}
                        onChange={(e) => { setLastname(e.target.value); validate('lastname', e.target.value); }}
                        className={`w-full rounded-xl border ${errors.lastname ? 'border-red-300' : 'border-gray-300'} bg-white text-sm text-gray-900 placeholder:text-gray-400 py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all`}
                        required
                      />
                      {errors.lastname && <p className="mt-1.5 text-xs text-red-600">{errors.lastname}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        aria-label="Email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); validate('email', e.target.value); }}
                        className={`w-full rounded-xl border ${errors.email ? 'border-red-300' : 'border-gray-300'} bg-white text-sm text-gray-900 placeholder:text-gray-400 py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all`}
                        required
                      />
                      {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
                    </div>
                    <div>
                      <input
                        aria-label="Phone number"
                        type="tel"
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); validate('phone', e.target.value); }}
                        className={`w-full rounded-xl border ${errors.phone ? 'border-red-300' : 'border-gray-300'} bg-white text-sm text-gray-900 placeholder:text-gray-400 py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all`}
                      />
                      {errors.phone && <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>}
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      aria-label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); validate('password', e.target.value); }}
                      className={`w-full rounded-xl border ${errors.password ? 'border-red-300' : 'border-gray-300'} bg-white text-sm text-gray-900 placeholder:text-gray-400 py-3.5 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all`}
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
                    {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}
                  </div>

                  <button
                    aria-label="Create Account"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3.5 px-4 text-base font-semibold shadow-lg shadow-gray-900/25 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting && (
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    )}
                    Create Account
                  </button>

                  <div className="flex items-center gap-3 my-4">
                    <div className="h-px w-full bg-gray-200" />
                    <span className="text-xs text-gray-500">or</span>
                    <div className="h-px w-full bg-gray-200" />
                  </div>

                  <div className="w-full flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap={false}
                      auto_select={false}
                      theme="outline"
                      size="large"
                      text="continue_with"
                      shape="rectangular"
                    />
                  </div>

                  <div className="text-center text-sm text-gray-600 mt-4">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="text-purple-600 hover:underline hover:text-purple-500 font-medium"
                    >
                      Sign in
                    </button>
                  </div>

                  <div className="text-center text-sm text-gray-600">
                    Are you a driver?{" "}
                    <button
                      type="button"
                      onClick={() => navigate('/captainRegister')}
                      className="text-purple-600 hover:underline hover:text-purple-500 font-medium"
                    >
                      Login as Captain
                    </button>
                  </div>

                  <p className="text-center text-xs text-gray-400 mt-3 leading-relaxed">
                    By creating an account, you agree to our <span className="underline">Terms of Service</span> & <span className="underline">Privacy Policy</span>.
                  </p>
                </form>
              </div>
          </motion.section>
        </div>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default Welcome;
