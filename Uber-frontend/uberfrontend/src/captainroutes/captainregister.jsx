import React, { useState } from "react";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

  const handleRegister = async (e) => {
    e.preventDefault();

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
    }
  };

  return (
    <div className="min-h-screen w-screen flex">
      {/* Left Side - Banner / Info */}
      <div className="w-1/2 bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] text-white p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-4">Uber</h1>
          <h2 className="text-2xl font-semibold mb-6">Drive with Uber</h2>
          <p className="mb-6 text-gray-300">
            Set your own schedule, be your own boss, and start earning money by driving with Uber.
          </p>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-center gap-2">🚗 Flexible hours and earnings</li>
            <li className="flex items-center gap-2">📍 Drive in your own city</li>
            <li className="flex items-center gap-2">⭐ Join millions of drivers worldwide</li>
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
            <h2 className="text-2xl text-center font-bold text-gray-500 mb-2">Become a Driver</h2>
            <p className="text-center text-gray-600 mb-6">Create your driver account to start earning</p>

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

              {/* Vehicle Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Vehicle Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Vehicle Color"
                    value={vehicleColor}
                    onChange={(e) => setVehicleColor(e.target.value)}
                    className="border border-gray-300 px-3 py-2 rounded text-black w-full"
                    required
                  />
                  <input
                    type="text"
                    placeholder="License Plate"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    className="border border-gray-300 px-3 py-2 rounded text-black w-full"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <input
                    type="text"
                    placeholder="Vehicle Model"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="border border-gray-300 px-3 py-2 rounded text-black w-full"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Capacity (seats)"
                    value={vehicleCapacity}
                    onChange={(e) => setVehicleCapacity(e.target.value)}
                    className="border border-gray-300 px-3 py-2 rounded text-black w-full"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-black text-white w-full py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                Create Driver Account →
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
              onClick={() => navigate('/captainlogin')}
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

export default CaptainRegister;
