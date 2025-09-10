import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import uber_india from "../assets/uber_india.png";

const LaunchPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col font-sans bg-gray-50">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-8 md:px-12 py-4 bg-white shadow-sm">
        <span className="text-2xl font-bold text-black">Uber</span>
        <button
          onClick={() => navigate("/Welcome")}
          className="bg-black text-white px-5 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-300"
        >
          Get Started
        </button>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-center pt-16 pb-14 px-8 md:px-12 gap-8">
        {/* Left Text */}
        <div className="max-w-xl text-center lg:text-left">
          <span className="inline-block px-3 py-1 text-sm font-medium text-black bg-purple-100 rounded-full">
            Trusted by 1M+ users
          </span>
          <h1 className="text-5xl sm:text-6xl font-extrabold mt-6 leading-tight text-gray-900">
            Your daily commute <br className="hidden sm:inline" />
            <span className="text-purple-400">Simplified.</span>
          </h1>
          <p className="mt-4 text-gray-600 text-lg">
            Safe, reliable, and affordable rides at your fingertips. Join millions
            who trust us for their daily commute.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
            <button
              onClick={() => navigate("/Welcome")}
              className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-300"
            >
              Login as a User
            </button>
            <button
              onClick={() => navigate("/captainregister")}
              className="border border-gray-300 bg-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300"
            >
              Become a Driver
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="mt-10 lg:mt-0 flex justify-center">
          <div className="w-full max-w-md mx-auto overflow-hidden rounded-2xl shadow-xl transform transition-transform duration-500 hover:scale-105">
            <img
              src={uber_india}
              alt="Uber App Preview"
              className="w-full h-auto object-contain"
              style={{ 
                maxHeight: '500px',
                // Add a subtle gradient overlay if image quality is poor
                background: 'linear-gradient(to bottom, #f8fafc, #e2e8f0)'
              }}
              onError={(e) => {
                // Fallback styling if image fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            {/* Fallback div in case image doesn't load */}
            <div 
              className="hidden w-full h-64 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center text-white text-lg font-semibold"
              style={{ display: 'none' }}
            >
              Uber App Preview
            </div>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="py-16 px-8 md:px-12 bg-white">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900">
            Committed to Your Safety
          </h2>
          <p className="mt-2 text-gray-600 text-lg">
            We've built comprehensive safety features to ensure every ride is secure
            and comfortable.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-6xl mx-auto">
          <div className="p-8 border border-gray-100 rounded-xl shadow-sm text-center">
            <FaCheckCircle className="text-green-600 text-4xl mx-auto" />
            <h3 className="font-bold text-lg text-gray-800 mt-4">Verified Drivers</h3>
            <p className="text-gray-600 text-sm mt-2">
              All drivers undergo comprehensive background checks and vehicle inspections.
            </p>
          </div>
          <div className="p-8 border border-gray-100 rounded-xl shadow-sm text-center">
            <FaCheckCircle className="text-green-600 text-4xl mx-auto" />
            <h3 className="font-bold text-lg text-gray-800 mt-4">Real-time Tracking</h3>
            <p className="text-gray-600 text-sm mt-2">
              Share your trip details with loved ones and track your ride in real-time.
            </p>
          </div>
          <div className="p-8 border border-gray-100 rounded-xl shadow-sm text-center">
            <FaCheckCircle className="text-green-600 text-4xl mx-auto" />
            <h3 className="font-bold text-lg text-gray-800 mt-4">24/7 Support</h3>
            <p className="text-gray-600 text-sm mt-2">
              Our support team is available around the clock to assist you with any concerns.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LaunchPage;