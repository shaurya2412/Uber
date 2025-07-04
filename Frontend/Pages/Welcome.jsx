import React from "react";
import uberLogo from '../assets/uber.png';

const Welcome = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12 shadow-sm sticky top-0 z-10 bg-white">
        <div className="flex items-center space-x-3">
<img src={uberLogo} alt="Uber Logo" className="h-3 w-auto object-contain" />

          <span className="text-2xl font-bold text-black tracking-tight">Uber</span>
        </div>
        <div className="hidden md:flex items-center space-x-10">
          <a href="#" className="text-gray-700 hover:text-black transition-colors duration-150 font-medium">Ride</a>
          <a href="#" className="text-gray-700 hover:text-black transition-colors duration-150 font-medium">Drive</a>
          <a href="#" className="text-gray-700 hover:text-black transition-colors duration-150 font-medium">Business</a>
          <a href="#" className="text-gray-700 hover:text-black transition-colors duration-150 font-medium">About</a>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-white  border border-gray-300 hover:bg-gray-100 px-5 py-2 rounded transition-shadow shadow-sm hover:shadow-md font-medium">Log in</button>
          <button className="bg-black text-white hover:bg-gray-900 px-5 py-2 rounded transition-shadow shadow-md font-semibold">Sign up</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh] py-12">
          {/* Left Side - Image */}
         

          {/* Right Side - Content */}
          <div className="order-1 lg:order-2 space-y-10">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-extrabold text-black leading-tight tracking-tight">
                Go anywhere with <span className="text-black">Uber</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Request a ride, hop in, and go. Choose from a variety of ride options to get where you need to be.
              </p>
            </div>

            <div className="space-y-4">
              <button className="bg-black text-white hover:bg-gray-900 text-lg px-8 py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
                Get Started
              </button>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Available 24/7</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Safe & Reliable</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-black">10M+</div>
                <div className="text-sm text-gray-600">Daily rides</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black">600+</div>
                <div className="text-sm text-gray-600">Cities worldwide</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black">5M+</div>
                <div className="text-sm text-gray-600">Active drivers</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">Why choose Uber?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the convenience and reliability that millions trust every day
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">🚗</span>
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">Quick & Easy</h3>
              <p className="text-gray-600">Request a ride with just a few taps and get picked up in minutes</p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">💳</span>
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">Cashless Payment</h3>
              <p className="text-gray-600">Pay seamlessly through the app with your preferred payment method</p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">Safe & Secure</h3>
              <p className="text-gray-600">Every ride is tracked and all drivers are background checked</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Welcome;
