
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
// import { getAnalytics, type Analytics } from "firebase/analytics"; // Uncomment if you need Analytics

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
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

// Get Firebase services
authInstance = getAuth(app);
firestoreInstance = getFirestore(app);
storageInstance = getStorage(app);
// if (typeof window !== 'undefined') { // Initialize Analytics only on client side
//   analyticsInstance = getAnalytics(app);
// }

// Export the initialized instances
// Note: It's common to export the instances with their conventional names (auth, firestore, storage)
export { app, authInstance as auth, firestoreInstance as firestore, storageInstance as storage };
// export { app, authInstance as auth, firestoreInstance as firestore, storageInstance as storage, analyticsInstance as analytics }; // Uncomment if using Analytics
