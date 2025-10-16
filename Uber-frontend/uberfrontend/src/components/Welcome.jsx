import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";
import { FiTruck, FiMapPin, FiStar, FiEye, FiEyeOff } from "react-icons/fi";
import { useUserStore } from "../Zustand/useUserStore";
import toast, { Toaster } from "react-hot-toast";

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
      
      const response = await axios.post("http://localhost:5000/auth/google", {
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
      const res = await axios.post("http://localhost:5000/users/register", {
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
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-gray-50">
      <div className="relative max-w-6xl mx-auto py-12 px-8 lg:px-16">
        {/* vertical divider on large screens */}
        <div className="hidden lg:block absolute inset-y-12 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-gray-200 to-transparent" aria-hidden></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Right panel first on mobile */}
          <motion.section
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="order-1 lg:order-2 bg-gray-50 rounded-2xl p-6 sm:p-7 flex items-center justify-center"
          >
            <div className="w-full max-w-md">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-gray-900">Get started</h2>
                <p className="text-gray-500 mt-2">Create your account to start riding.</p>

                <form onSubmit={handleRegister} className="mt-6 space-y-4" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        aria-label="First name"
                        type="text"
                        placeholder="First name"
                        value={firstname}
                        onChange={(e) => { setFirstname(e.target.value); validate('firstname', e.target.value); }}
                        className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                      {errors.firstname && <p className="mt-1 text-xs text-red-600">{errors.firstname}</p>}
                    </div>
                    <div>
                      <input
                        aria-label="Last name"
                        type="text"
                        placeholder="Last name"
                        value={lastname}
                        onChange={(e) => { setLastname(e.target.value); validate('lastname', e.target.value); }}
                        className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                      {errors.lastname && <p className="mt-1 text-xs text-red-600">{errors.lastname}</p>}
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
                        className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                    </div>
                    <div>
                      <input
                        aria-label="Phone number"
                        type="tel"
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); validate('phone', e.target.value); }}
                        className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                    </div>
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
                    aria-label="Create Account"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center rounded-lg bg-black text-white py-3 px-4 text-sm font-semibold shadow-md transition-all hover:bg-gray-900 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting && (
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    )}
                    Create Account →
                  </button>

                  {/* or divider */}
                  <div className="flex items-center gap-3 my-2">
                    <div className="h-px w-full bg-gray-200" />
                    <span className="text-xs text-gray-500">or</span>
                    <div className="h-px w-full bg-gray-200" />
                  </div>

                  <div className="w-full">
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

                  <p className="text-center text-xs text-gray-400 mt-2">
                    By creating an account, you agree to our <span className="underline">Terms of Service</span> & <span className="underline">Privacy Policy</span>.
                  </p>
                </form>
              </div>
              <Toaster position="top-right" reverseOrder={false} />
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

              <div className="mt-10 border-t border-gray-700 pt-6 text-sm text-gray-400 grid grid-cols-3 gap-6">
                <div><strong className="block text-white text-xl">1B+</strong>Trips</div>
                <div><strong className="block text-white text-xl">10K+</strong>Cities</div>
                <div><strong className="block text-white text-xl">4.9★</strong>Rating</div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
