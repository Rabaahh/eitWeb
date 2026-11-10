// Firebase's modular browser SDK. Replace the config values with your web app's
// config from Firebase Console; this client config is designed to be public.
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCVOuBDHrTs_G5d4ovCO6VK1mTNaryL0HM",
  authDomain: "eitweb.firebaseapp.com",
  projectId: "eitweb",
  storageBucket: "eitweb.firebasestorage.app",
  messagingSenderId: "934814553421",
  appId: "1:934814553421:web:66e1a5b86de2d37704d304"
};

// These IDs keep the Me/Her labels consistent for both accounts. Find each UID
// in Firebase Console > Authentication > Users and paste it here.
export const people = {
  meUid: "2edjADpFjjOSXkedINflIQRWODg1",
  herUid: "DAQ9B3X3MtP1tUtCYPu5jYlqP6n1",
};

const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
