import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDoJk6yzYwS6unrRERIjhxebWwH5092GB4",
  authDomain: "healthmarket-e8b9e.firebaseapp.com",
  projectId: "healthmarket-e8b9e",
  storageBucket: "healthmarket-e8b9e.firebasestorage.app",
  messagingSenderId: "837056914238",
  appId: "1:837056914238:web:a972aa143d0b205a1ec26f",
  measurementId: "G-Z5QC40E3PS"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
