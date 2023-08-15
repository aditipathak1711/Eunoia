import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration

const firebaseConfig = {
    apiKey: "AIzaSyDLDPGC_noOspxk-SM74YoL2sjm97FX080",
    authDomain: "tasktracker-23700.firebaseapp.com",
    projectId: "tasktracker-23700",
    messagingSenderId: "580117269608",
    appId: "1:580117269608:web:4a724b3a5bd6c40c117fdd",
    measurementId: "G-WGKTBTEQGD"
};

// Initialize Firebase only if no app instance exists
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Export Firebase services
export { auth, db, analytics };
