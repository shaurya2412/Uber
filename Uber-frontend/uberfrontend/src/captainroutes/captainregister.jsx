import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiMapPin, FiStar, FiTruck } from "react-icons/fi";

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
  const [errors, setErrors] = useState({ firstname: '', lastname: '', email: '', phone: '', password: '', vehicleColor: '', vehiclePlate: '', vehicleModel: '', vehicleCapacity: '' });

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

    console.log("🚀 Frontend: Starting captain registration");
    console.log("📝 Frontend: Form data:", {
      firstname, lastname, email, password,
      vehicleColor, vehiclePlate, vehicleModel, vehicleCapacity
    });

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

    console.log("📤 Frontend: Sending request to backend:", JSON.stringify(requestData, null, 2));

    try {
      setIsSubmitting(true);
      const res = await axios.post("http://localhost:5000/captains/register", requestData);

      console.log("✅ Frontend: Registration successful:", res.data);
      alert("Registration successful! Redirecting to login...");
      // Navigate to login or dashboard after successful registration
      navigate('/captainlogin');
    } catch (error) {
      console.error("❌ Frontend: Registration failed:", error);
      console.error("❌ Frontend: Error response:", error.response?.data);
      console.error("❌ Frontend: Error status:", error.response?.status);
      
      if (error.response?.data?.error) {
        const errorMessages = error.response.data.error.map(err => err.msg).join(", ");
        console.log("📝 Frontend: Validation errors:", errorMessages);
        alert("Validation errors: " + errorMessages);
      } else if (error.response?.data?.message) {
        console.log("📝 Frontend: Server message:", error.response.data.message);
        alert("Server error: " + error.response.data.message);
      } else {
        console.log("📝 Frontend: Network or unknown error");
        alert("Something went wrong while registering. Check console for details.");
      }
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
                <h2 className="text-2xl font-semibold text-gray-900 text-center">Become a Driver</h2>
                <p className="text-gray-500 mt-2 text-center">Create your driver account to start earning.</p>

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

                  {/* Vehicle Information */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Vehicle Information</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <input
                          aria-label="Vehicle color"
                          type="text"
                          placeholder="Vehicle color"
                          value={vehicleColor}
                          onChange={(e) => { setVehicleColor(e.target.value); validate('vehicleColor', e.target.value); }}
                          className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                        {errors.vehicleColor && <p className="mt-1 text-xs text-red-600">{errors.vehicleColor}</p>}
                      </div>
                      <div>
                        <input
                          aria-label="License plate"
                          type="text"
                          placeholder="License plate"
                          value={vehiclePlate}
                          onChange={(e) => { setVehiclePlate(e.target.value); validate('vehiclePlate', e.target.value); }}
                          className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                        {errors.vehiclePlate && <p className="mt-1 text-xs text-red-600">{errors.vehiclePlate}</p>}
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
                          className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                        {errors.vehicleModel && <p className="mt-1 text-xs text-red-600">{errors.vehicleModel}</p>}
                      </div>
                      <div>
                        <input
                          aria-label="Capacity"
                          type="text"
                          placeholder="Capacity (seats)"
                          value={vehicleCapacity}
                          onChange={(e) => { setVehicleCapacity(e.target.value); validate('vehicleCapacity', e.target.value); }}
                          className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                        {errors.vehicleCapacity && <p className="mt-1 text-xs text-red-600">{errors.vehicleCapacity}</p>}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    aria-label="Create Driver Account"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center rounded-lg bg-black text-white py-3 px-4 text-sm font-semibold shadow-md transition-all hover:bg-gray-900 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting && (
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    )}
                    Create Driver Account →
                  </button>
                </form>
              </div>

              <div className="flex items-center gap-3 my-3">
                <div className="h-px w-full bg-gray-200" />
                <span className="text-xs text-gray-500">or</span>
                <div className="h-px w-full bg-gray-200" />
              </div>

              <button type="button" className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 hover:bg-gray-50 transition-colors">
                <FaGoogle className="text-[#4285F4]" /> Continue with Google
              </button>

              <p className="text-center text-sm text-gray-600 mt-6">
                Already have an account?{" "}
                <button type="button" onClick={() => navigate('/captainlogin')} className="text-purple-600 hover:underline hover:text-purple-500 font-medium">Sign in</button>
              </p>
              <p className="text-center text-xs text-gray-400 mt-2">By creating an account, you agree to our <span className="underline">Terms of Service</span> & <span className="underline">Privacy Policy</span>.</p>
            </div>
          </motion.section>

          {/* Left panel - brand */}
          <motion.section
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="order-2 lg:order-1 bg-gradient-to-b from-black via-gray-900 to-black text-gray-100 rounded-2xl p-10 flex items-center"
          >
            <div className="max-w-md">
              <h1 className="text-4xl font-extrabold tracking-tight">Ride</h1>
              <h2 className="text-xl font-medium text-gray-300 mt-3">Drive with Ride</h2>
              <p className="mt-5 text-gray-300">Set your own schedule, be your own boss, and start earning.</p>

              <ul className="mt-8 space-y-4">
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

export default CaptainRegister;
