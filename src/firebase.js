// FILE: src/firebase.js

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";   // ✅ add
import { getAuth } from "firebase/auth";             // ✅ add

const firebaseConfig = {
  apiKey: "AIzaSyDngMKf95_jnAjR6G1dDPokSzUChrYOuS0",
  authDomain: "ricovir.firebaseapp.com",
  projectId: "ricovir",
  storageBucket: "ricovir.firebasestorage.app",
  messagingSenderId: "499915949001",
  appId: "1:499915949001:web:9bacd91112753a7bc7de18",
  measurementId: "G-BQTMQGQV6H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Services you ACTUALLY use
export const db = getFirestore(app);   // Firestore
export const auth = getAuth(app);      // Authentication

// Optional (not required for your app)
const analytics = getAnalytics(app);

getAnalytics(app);