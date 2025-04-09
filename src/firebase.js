// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {getFirestore} from 'firebase/firestore'
// Your Firebase configuration (Replace with your actual config)
const firebaseConfig = {
  apiKey: String(process.env.REACT_APP_APIKEY),
  authDomain: String(process.env.REACT_APP_AUTHDOMAIN),
  projectId: String(process.env.REACT_APP_PROJECTID),
  storageBucket: String(process.env.REACT_APP_BUCKET),
  messagingSenderId: String(process.env.REACT_APP_MESSAGESENDERID),
  appId: String(process.env.REACT_APP_APPID)
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app)

