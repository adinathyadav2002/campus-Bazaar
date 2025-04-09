// import React from 'react'

// export default function LoginNew() {
//   return (
//     <div>

//     </div>
//   )
// }

// src/components/Login.js
import React from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";

const LoginNew = () => {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken(); // Firebase ID Token

      // Send token to backend for verification
      // const response = await axios.post("http://localhost:5000/api/auth/google", { token });

      // // Store JWT token received from backend
      // localStorage.setItem("token", response.data.token);
      alert("Login Successful!");
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  return (
    <div>
      <h2>Login with Google</h2>
      <button onClick={handleGoogleLogin}>Sign in with Google</button>

      <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-blue-900 text-gray-400">Or continue with</span>
            </div>
          </div>
          <button
            type="button"
            className="w-full bg-white text-gray-700 p-3 rounded-lg hover:bg-gray-100 transition font-semibold flex items-center justify-center gap-2 border border-gray-300"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5"
            />
            Login with Google
          </button>

    </div>
  );
};

export default LoginNew;
