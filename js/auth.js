// Authentication helpers. There is intentionally no account creation method.
import {
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import { auth } from "./firebase.js";

export function observeAuth(callback) {
  return firebaseOnAuthStateChanged(auth, callback);
}

export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signOutUser() {
  return signOut(auth);
}

// Keep Firebase's provider error codes out of the visible UI.
export function friendlyAuthError(error) {
  const messages = {
    "auth/invalid-credential": "That email and password don’t match. Try again.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/user-disabled": "This account is disabled. Contact the person who manages the Firebase project.",
    "auth/too-many-requests": "There have been too many attempts. Please wait a little and try again.",
    "auth/network-request-failed": "Couldn’t reach Firebase. Check your internet connection and try again.",
    "auth/operation-not-allowed": "Email and password sign-in is not enabled in Firebase yet.",
  };
  return messages[error?.code] || "Something went wrong. Please try again.";
}
