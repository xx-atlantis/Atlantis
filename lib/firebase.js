// lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  // ... CONFIG ...
  apiKey: "AIzaSyA7Y1Lx9Qa9kO6kd0jvkG4-NiMSSmPC3jM",
  authDomain: "fir-441219.firebaseapp.com",
  projectId: "firebase-441219",
  storageBucket: "firebase-441219.firebasestorage.app",
  messagingSenderId: "1046408342500",
  appId: "1:1046408342500:web:59a7677b8a2847313db5f1",
  measurementId: "G-9Z4W4WV1F7"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize App Check (Client-Side Only)
if (typeof window !== "undefined") {
  // Prevent double-initialization
  if (!window.FIREBASE_APPCHECK_INIT) {
    
    // Create the provider using the v3 Key
    const provider = new ReCaptchaV3Provider("6LcW_yssAAAAAP1QqsyoJa7LbFri5xC4xFboTJFc");

    // Initialize
    initializeAppCheck(app, {
      provider: provider,
      isTokenAutoRefreshEnabled: true,
    });
    
    // Add Debug Token for Localhost (Check console for the token if needed)
    if (process.env.NODE_ENV === 'development') {
       self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }

    window.FIREBASE_APPCHECK_INIT = true;
  }
}

export const auth = getAuth(app);