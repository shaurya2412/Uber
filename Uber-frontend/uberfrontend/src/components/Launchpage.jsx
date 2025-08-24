import { FaGoogle, FaFacebookF } from "react-icons/fa";

import travelilustra from "../assets/travelilustra.webp";
import { useNavigate } from 'react-router-dom';

const LaunchPage = () => {

  // States for form fields
    const navigate = useNavigate();
  


  return (
    <div className="min-h-screen w-screen flex p-0.5">
      {/* Left Side - Banner / Info */}
      <div className="w-1/2    bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] text-white p-12 flex flex-col justify-center">
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
          
          <div className="p-8 mt-16 ">
            <button className=" text-white border-2 mr-6" onClick={()=> navigate("/Welcome")} >User login</button>
                        <button className="p-6 text-white border-2" onClick={()=> navigate("/captainregister")} >Captain login</button>
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
