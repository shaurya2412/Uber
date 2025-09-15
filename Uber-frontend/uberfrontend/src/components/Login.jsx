import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { useUserStore } from "../Zustand/useUserstore";

const Login = () => {
  const navigate = useNavigate();
const setUser = useUserStore((state) => state.setUser);
const setToken = useUserStore((state) => state.setToken);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const handlelogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/users/login", {
        email,
        password,
      });

      const { token } = res.data;
      localStorage.setItem("token", token);

      console.log("Login successful:", res.data);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Invalid email or password.");
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
        </div>
      </div>

      <div className="w-1/2 flex justify-center items-center bg-gray-50 p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <h2 className="text-2xl text-center font-bold text-gray-500 mb-8">
            What's your phone number or email?
          </h2>

          <form className="space-y-4">
            <input
              type="email"
              placeholder="Enter phone number or email"
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
          </form>

          <button
            onClick={handlelogin}
            className="bg-black text-white w-full py-2 rounded-lg font-semibold hover:bg-gray-800 transition mt-6"
          >
            Login
          </button>

          <div className="text-center text-sm text-gray-500 my-4">or</div>

          <div className="flex justify-center">
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
        </div>
      </div>
    </div>
  );
};

export default Login;
