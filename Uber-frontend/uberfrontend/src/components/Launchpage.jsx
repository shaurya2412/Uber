import { FaGoogle, FaFacebookF } from "react-icons/fa";

import travelilustra from "../assets/travelilustra.webp";

const LaunchPage = () => {

  // States for form fields
  


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
      

    <div>
        <img src={travelilustra} alt="travel welcome video" />
    </div>
</div>
);
};

export default LaunchPage;
