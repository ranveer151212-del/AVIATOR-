import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Firebase Web app configuration supplied by the user.
// Firebase Analytics (firebase/analytics) is web-only and is not initialized in this React Native app.
const firebaseConfig = {
  apiKey: "AIzaSyBSPIQ5bHIUrmGYLect7_vVXITPf-siK1c",
  authDomain: "store-fd106.firebaseapp.com",
  databaseURL: "https://store-fd106-default-rtdb.firebaseio.com",
  projectId: "store-fd106",
  storageBucket: "store-fd106.firebasestorage.app",
  messagingSenderId: "710265961545",
  appId: "1:710265961545:web:659f211eaab72448021398",
  measurementId: "G-4G93YK3NQ9"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
let auth;
try {
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch {
  auth = getAuth(app);
}
export { auth };
export const db = getFirestore(app);
