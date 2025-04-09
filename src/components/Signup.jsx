import React from "react";

const Signup = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="bg-blue-900 p-8 rounded-2xl shadow-lg w-[40rem]">
        <h2 className="text-white text-2xl font-bold mb-6 text-center">Sign Up</h2>
        <form>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2" htmlFor="name">Name</label>
              <input type="text" id="name" className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your name" required />
            </div>
            <div>
              <label className="block text-white mb-2" htmlFor="email">Email</label>
              <input type="email" id="email" className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your email" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-white mb-2" htmlFor="phone">Phone Number</label>
              <input type="tel" id="phone" className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your phone number" required />
            </div>
            <div>
              <label className="block text-white mb-2" htmlFor="address">Address</label>
              <input type="text" id="address" className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your address" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-white mb-2" htmlFor="password">Password</label>
              <input type="password" id="password" className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your password" required />
            </div>
            <div>
              <label className="block text-white mb-2" htmlFor="confirmPassword">Confirm Password</label>
              <input type="password" id="confirmPassword" className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Confirm your password" required />
            </div>
          </div>
          <button type="submit" className="w-full mt-6 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-semibold">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
