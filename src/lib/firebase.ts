
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
// import { getAnalytics, type Analytics } from "firebase/analytics"; // Uncomment if you need Analytics

const {
  NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} = process.env;

if (!NEXT_PUBLIC_FIREBASE_API_KEY) {
  throw new Error(
    "Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing. " +
    "Ensure it is set in your environment variables (e.g., .env file)."
  );
}
if (!NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  throw new Error(
    "Firebase Project ID (NEXT_PUBLIC_FIREBASE_PROJECT_ID) is missing. " +
    "Ensure it is set in your environment variables (e.g., .env file)."
  );
}

// Define a type for the config object to allow conditional assignment
interface FirebaseConfig {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Conditionally add measurementId if it exists
if (NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) {
  firebaseConfig.measurementId = NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
}

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
export { app, authInstance as auth, firestoreInstance as firestore, storageInstance as storage };
// export { app, authInstance as auth, firestoreInstance as firestore, storageInstance as storage, analyticsInstance as analytics }; // Uncomment if using Analytics
