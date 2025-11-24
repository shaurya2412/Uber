import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiMapPin, FiStar, FiTruck, FiClock, FiShield } from "react-icons/fi";

const CaptainRegister = () => {
  const navigate = useNavigate();

  // States for form fields
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleCapacity, setVehicleCapacity] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ 
    firstname: '', lastname: '', email: '', phone: '', password: '', 
    vehicleColor: '', vehiclePlate: '', vehicleModel: '', vehicleCapacity: '' 
  });

  const validate = (field, value) => {
    let message = '';
    if (["firstname","lastname","vehicleColor","vehiclePlate","vehicleModel","vehicleCapacity"].includes(field)) {
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

  const handleRegister = async (e) => {
    e.preventDefault();
    const allValid = [
      validate('firstname', firstname),
      validate('lastname', lastname),
      validate('email', email),
      validate('phone', phone),
      validate('password', password),
      validate('vehicleColor', vehicleColor),
      validate('vehiclePlate', vehiclePlate),
      validate('vehicleModel', vehicleModel),
      validate('vehicleCapacity', vehicleCapacity),
    ].every(Boolean);
    if (!allValid) return;

    const requestData = {
      name: {
        firstname,
        lastname,
      },
      email,
      password,
      vehicle: {
        color: vehicleColor,
        plate: vehiclePlate,
        vehiclemodel: vehicleModel,
        capacity: vehicleCapacity
      }
    };

    try {
      setIsSubmitting(true);
      const res = await axios.post("http://localhost:5000/captains/register", requestData);
      alert("Registration successful! Redirecting to login...");
      navigate('/captainlogin');
    } catch (error) {
      if (error.response?.data?.error) {
        const errorMessages = error.response.data.error.map(err => err.msg).join(", ");
        alert("Validation errors: " + errorMessages);
      } else if (error.response?.data?.message) {
        alert("Server error: " + error.response.data.message);
      } else {
        alert("Something went wrong while registering. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch min-h-[calc(100vh-8rem)]">
          
          {/* LEFT PANEL - Premium Brand Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-12 relative overflow-hidden"
          >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white">
                      <rect x="2" y="8" width="20" height="8" rx="2" fill="white" />
                    </svg>
                  </div>
                  <h1 className="text-4xl font-bold text-white tracking-tight">WalletCab</h1>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Drive with Confidence</h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Set your own schedule, be your own boss, and start earning with premium transportation.
                </p>
              </motion.div>

              <motion.ul 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-5 mt-10"
              >
                {[
                  { icon: FiClock, text: "Flexible hours and earnings", desc: "Work when you want" },
                  { icon: FiMapPin, text: "Drive in your own city", desc: "Choose your routes" },
                  { icon: FiShield, text: "Verified safety standards", desc: "Protected platform" },
                  { icon: FiStar, text: "Join thousands of drivers", desc: "Growing community" },
                ].map((item, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="flex items-start gap-4 group"
                  >
                    <div className="mt-1 flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-base">{item.text}</p>
                      <p className="text-gray-400 text-sm mt-1">{item.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </motion.div>

          {/* RIGHT PANEL - Premium Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center lg:justify-start"
          >
            <div className="w-full max-w-lg">
              {/* Form Card */}
              <div className="bg-white rounded-3xl shadow-2xl shadow-gray-900/10 border border-gray-200/60 overflow-hidden">
                
                {/* Form Header */}
                <div className="bg-gradient-to-r from-gray-50 to-white px-8 pt-8 pb-6 border-b border-gray-200/60">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Become a Driver</h2>
                  <p className="text-gray-600">Create your driver account to start earning today</p>
                </div>

                {/* Form Body */}
                <form onSubmit={handleRegister} className="p-8 space-y-5" noValidate>
                  
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Personal Information</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <input
                          aria-label="First name"
                          type="text"
                          placeholder="First name"
                          value={firstname}
                          onChange={(e) => { setFirstname(e.target.value); validate('firstname', e.target.value); }}
                          className={`w-full rounded-xl border ${errors.firstname ? 'border-red-300' : 'border-gray-300'} bg-white text-gray-900 placeholder:text-gray-400 py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200`}
                          required
                        />
                        {errors.firstname && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.firstname}</p>}
                      </div>
                      <div>
                        <input
                          aria-label="Last name"
                          type="text"
                          placeholder="Last name"
                          value={lastname}
                          onChange={(e) => { setLastname(e.target.value); validate('lastname', e.target.value); }}
                          className={`w-full rounded-xl border ${errors.lastname ? 'border-red-300' : 'border-gray-300'} bg-white text-gray-900 placeholder:text-gray-400 py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200`}
                          required
                        />
                        {errors.lastname && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.lastname}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <input
                          aria-label="Email"
                          type="email"
                          placeholder="Email address"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); validate('email', e.target.value); }}
                          className={`w-full rounded-xl border ${errors.email ? 'border-red-300' : 'border-gray-300'} bg-white text-gray-900 placeholder:text-gray-400 py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200`}
                          required
                        />
                        {errors.email && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.email}</p>}
                      </div>
                      <div>
                        <input
                          aria-label="Phone number"
                          type="tel"
                          placeholder="Phone number"
                          value={phone}
                          onChange={(e) => { setPhone(e.target.value); validate('phone', e.target.value); }}
                          className={`w-full rounded-xl border ${errors.phone ? 'border-red-300' : 'border-gray-300'} bg-white text-gray-900 placeholder:text-gray-400 py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200`}
                        />
                        {errors.phone && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        aria-label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); validate('password', e.target.value); }}
                        className={`w-full rounded-xl border ${errors.password ? 'border-red-300' : 'border-gray-300'} bg-white text-gray-900 placeholder:text-gray-400 py-3.5 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200`}
                        required
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                      </button>
                      {errors.password && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.password}</p>}
                    </div>
                  </div>

                  {/* Vehicle Information Section */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Vehicle Information</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <input
                          aria-label="Vehicle color"
                          type="text"
                          placeholder="Vehicle color"
                          value={vehicleColor}
                          onChange={(e) => { setVehicleColor(e.target.value); validate('vehicleColor', e.target.value); }}
                          className={`w-full rounded-xl border ${errors.vehicleColor ? 'border-red-300' : 'border-gray-300'} bg-white text-gray-900 placeholder:text-gray-400 py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200`}
                          required
                        />
                        {errors.vehicleColor && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.vehicleColor}</p>}
                      </div>
                      <div>
                        <input
                          aria-label="License plate"
                          type="text"
                          placeholder="License plate"
                          value={vehiclePlate}
                          onChange={(e) => { setVehiclePlate(e.target.value); validate('vehiclePlate', e.target.value); }}
                          className={`w-full rounded-xl border ${errors.vehiclePlate ? 'border-red-300' : 'border-gray-300'} bg-white text-gray-900 placeholder:text-gray-400 py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200`}
                          required
                        />
                        {errors.vehiclePlate && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.vehiclePlate}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <input
                          aria-label="Vehicle model"
                          type="text"
                          placeholder="Vehicle model"
                          value={vehicleModel}
                          onChange={(e) => { setVehicleModel(e.target.value); validate('vehicleModel', e.target.value); }}
                          className={`w-full rounded-xl border ${errors.vehicleModel ? 'border-red-300' : 'border-gray-300'} bg-white text-gray-900 placeholder:text-gray-400 py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200`}
                          required
                        />
                        {errors.vehicleModel && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.vehicleModel}</p>}
                      </div>
                      <div>
                        <input
                          aria-label="Capacity"
                          type="text"
                          placeholder="Capacity (seats)"
                          value={vehicleCapacity}
                          onChange={(e) => { setVehicleCapacity(e.target.value); validate('vehicleCapacity', e.target.value); }}
                          className={`w-full rounded-xl border ${errors.vehicleCapacity ? 'border-red-300' : 'border-gray-300'} bg-white text-gray-900 placeholder:text-gray-400 py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200`}
                          required
                        />
                        {errors.vehicleCapacity && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.vehicleCapacity}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    className="w-full mt-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 px-6 rounded-xl font-semibold shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Driver Account</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Divider */}
                <div className="px-8 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gray-200"></div>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">or</span>
                    <div className="h-px flex-1 bg-gray-200"></div>
                  </div>
                </div>

                {/* Google Sign In */}
                <div className="px-8 pb-8">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-3 border-2 border-gray-300 rounded-xl py-3.5 px-6 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-gray-700"
                  >
                    <FaGoogle className="text-xl text-[#4285F4]" />
                    <span>Continue with Google</span>
                  </motion.button>

                  <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account?{" "}
                    <button 
                      type="button" 
                      onClick={() => navigate('/captainlogin')} 
                      className="text-gray-900 font-semibold hover:underline transition-all"
                    >
                      Sign in
                    </button>
                  </p>
                  
                  <p className="text-center text-xs text-gray-500 mt-4 leading-relaxed">
                    By creating an account, you agree to our{" "}
                    <span className="underline cursor-pointer hover:text-gray-700">Terms of Service</span>
                    {" "}&{" "}
                    <span className="underline cursor-pointer hover:text-gray-700">Privacy Policy</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CaptainRegister;
