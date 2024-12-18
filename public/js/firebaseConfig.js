import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBH_Ocqfh7zdIuEdUEzfPVHycFgwa_P3RQ",
  authDomain: "connectr-593cd.firebaseapp.com",
  projectId: "connectr-593cd",
  storageBucket: "connectr-593cd.appbasestorage.app",
  messagingSenderId: "404957370696",
  appId: "1:404957370696:web:6a336c2c93f5fde630fb7d",
  measurementId: "G-0XPYH8697J"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { 
  app, 
  auth, 
  db, 
  googleProvider, 
  analytics 
};
