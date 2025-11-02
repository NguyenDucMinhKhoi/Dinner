import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration
// Get these values from Firebase Console > Project Settings > General
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with specific settings
// This prevents reCAPTCHA Enterprise error
export const auth = getAuth(app);

// Disable app verification for development (optional)
// This forces using standard reCAPTCHA v2 instead of Enterprise
if (typeof window !== "undefined") {
  (window as any).recaptchaVerifier = null;
}

// Export app for other Firebase services
export default app;
