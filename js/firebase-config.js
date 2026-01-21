// Firebase Configuration - Centralized module
// Note: Client-side Firebase keys are designed to be public.
// Security is enforced via Firebase Security Rules, not by hiding these keys.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDGKD7wM7O0vnwR_NXWQVhNYudLQHFqts8",
  authDomain: "perch-96206.firebaseapp.com",
  projectId: "perch-96206",
  storageBucket: "perch-96206.firebasestorage.app",
  messagingSenderId: "666435496292",
  appId: "1:666435496292:web:df730cd0dfcb42ab277271"
};

// Initialize Firebase (only once)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth, firebaseConfig };
