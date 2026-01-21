// Auth Helper - Centralized authentication state management
// Uses Firebase Auth as the single source of truth

import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

let currentUser = null;
let authReady = false;
let authReadyPromise = null;
let authCallbacks = [];

// Initialize auth state listener
authReadyPromise = new Promise((resolve) => {
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    authReady = true;
    resolve(user);

    // Notify all registered callbacks
    authCallbacks.forEach(cb => cb(user));
  });
});

// Wait for auth to be ready
export function waitForAuth() {
  return authReadyPromise;
}

// Register a callback for auth state changes
export function onAuthChange(callback) {
  authCallbacks.push(callback);

  // If auth is already ready, call immediately
  if (authReady) {
    callback(currentUser);
  }

  // Return unsubscribe function
  return () => {
    authCallbacks = authCallbacks.filter(cb => cb !== callback);
  };
}

// Get current user (may be null if not logged in or auth not ready)
export function getCurrentUser() {
  return currentUser;
}

// Check if user is logged in
export function isLoggedIn() {
  return currentUser !== null;
}

// Check if user is a guest (not logged in)
export function isGuest() {
  return currentUser === null;
}

// Get user display name
export function getUserName() {
  if (!currentUser) return null;
  return currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
}

// Get user email
export function getUserEmail() {
  return currentUser?.email || null;
}

// Get user photo URL
export function getUserPhoto() {
  return currentUser?.photoURL || null;
}

// Get user ID
export function getUserId() {
  return currentUser?.uid || null;
}

// Update UI elements based on auth state
// Call this with selectors for your login/logout UI elements
export function setupAuthUI(options = {}) {
  const {
    loginBtnSelector = '.login-btn',
    userInfoSelector = '.user-info',
    userNameSelector = '.user-name',
    userAvatarSelector = '.user-avatar',
    logoutBtnSelector = '.logout-btn'
  } = options;

  onAuthChange((user) => {
    const loginBtn = document.querySelector(loginBtnSelector);
    const userInfo = document.querySelector(userInfoSelector);
    const userName = document.querySelector(userNameSelector);
    const userAvatar = document.querySelector(userAvatarSelector);
    const logoutBtn = document.querySelector(logoutBtnSelector);

    if (user) {
      // User is logged in
      if (loginBtn) loginBtn.style.display = 'none';
      if (userInfo) userInfo.style.display = 'flex';
      if (userName) userName.textContent = getUserName();
      if (userAvatar && user.photoURL) {
        userAvatar.src = user.photoURL;
        userAvatar.style.display = 'block';
      }
    } else {
      // User is guest
      if (loginBtn) loginBtn.style.display = 'flex';
      if (userInfo) userInfo.style.display = 'none';
    }
  });
}

// Sign out helper
export async function signOut() {
  try {
    await auth.signOut();
    // Clear any remaining booking state on logout
    localStorage.removeItem('currentVenue');
    localStorage.removeItem('bookingTime');
    localStorage.removeItem('bookingDuration');
    localStorage.removeItem('bookingPeople');
    localStorage.removeItem('lastBookingRef');
    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    return false;
  }
}

export { auth };
