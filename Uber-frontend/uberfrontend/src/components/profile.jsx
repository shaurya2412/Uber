import React from "react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="flex justify-center mb-4">
          <img
            src="https://via.placeholder.com/120"
            alt="Profile"
            className="w-28 h-28 rounded-full border-4 border-blue-500 object-cover"
          />
        </div>

        {/* Name and Role */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Shaurya Saxena</h2>
          <p className="text-gray-500">Frontend Developer</p>
        </div>

        {/* Info Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">About</h3>
          <p className="text-gray-600 text-sm">
            Passionate about building intuitive and performant user interfaces. Experienced with React, Tailwind CSS, and modern frontend workflows.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-around">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
            Follow
          </button>
          <button className="border border-blue-500 text-blue-500 px-4 py-2 rounded-lg hover:bg-blue-50 transition">
            Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;