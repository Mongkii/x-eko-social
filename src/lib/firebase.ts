
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
// import { getAnalytics, type Analytics } from "firebase/analytics"; // Uncomment if you need Analytics

// Hardcoded Firebase configuration as per user request
const firebaseConfig = {
  apiKey: "AIzaSyCOemyCg4b8daqdTmvl5Vlz5KOL9bRrEnc",
  authDomain: "shopyme-x8mqi.firebaseapp.com",
  projectId: "shopyme-x8mqi",
  storageBucket: "shopyme-x8mqi.firebasestorage.app",
  messagingSenderId: "758724977031",
  appId: "1:758724977031:web:95b05a338952a7d2a8b322",
  measurementId: "G-MJZXTP7JRM" // measurementId is optional for SDK v7.20.0+ but included if provided
};


let app: FirebaseApp;
let authInstance: Auth;
let firestoreInstance: Firestore;
let storageInstance: FirebaseStorage;
// let analyticsInstance: Analytics; // Uncomment if you need Analytics

// Initialize Firebase App
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Basic check for essential hardcoded values (already present in firebaseConfig object)
if (!firebaseConfig.apiKey) {
  throw new Error("Firebase API Key is missing in the hardcoded config.");
}
if (!firebaseConfig.projectId) {
  throw new Error("Firebase Project ID is missing in the hardcoded config.");
}

// Get Firebase services
authInstance = getAuth(app);
// Connect to the specified Firestore database instance
firestoreInstance = getFirestore(app, "ekosocialdatabase"); 
storageInstance = getStorage(app);
// if (typeof window !== 'undefined' && firebaseConfig.measurementId) { // Initialize Analytics only on client side if measurementId is present
//   analyticsInstance = getAnalytics(app);
// }

// Export the initialized instances
export { app, authInstance as auth, firestoreInstance as firestore, storageInstance as storage };
// export { app, authInstance as auth, firestoreInstance as firestore, storageInstance as storage, analyticsInstance as analytics }; // Uncomment if using Analytics
