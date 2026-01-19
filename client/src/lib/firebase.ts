import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  EmailAuthProvider,
  type User
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Check if we're in development
const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Check if Firebase credentials are real or fake
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key";
const isFakeCredentials = apiKey.includes("JJJJJJ") || apiKey === "demo-api-key";

// Use dummy config for demo mode
const firebaseConfig = {
  apiKey: isFakeCredentials ? "demo-api-key" : apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

console.log("🔥 Firebase config:", {
  isDev,
  isFakeCredentials,
  apiKey: apiKey.substring(0, 10) + "..."
});

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Only connect to emulators if explicitly requested AND emulators are available
const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true";

if (isDev && useEmulators) {
  try {
    console.log("🔧 Attempting to connect to Firebase Emulators...");
    
    // Auth Emulator (Port 9099)
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    
    // Firestore Emulator (Port 8080)
    connectFirestoreEmulator(db, "localhost", 8080);
    
    // Storage Emulator (Port 9199)
    connectStorageEmulator(storage, "localhost", 9199);
    
    console.log("✅ Connected to Firebase Emulators");
  } catch (error) {
    console.warn("⚠️ Failed to connect to emulators, using fallback mode:", error);
  }
} else if (isFakeCredentials) {
  console.warn("⚠️ Using fake Firebase credentials - authentication will work but data won't persist to Firestore");
}

export {
  auth,
  db,
  storage,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  EmailAuthProvider,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp
};

export type { User };
