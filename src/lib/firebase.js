import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB5ET4SWjhevWsway1n0-XvG2sZLHV1GRI",
  authDomain: "react-chat-ff128.firebaseapp.com",
  projectId: "react-chat-ff128",
  storageBucket: "react-chat-ff128.appspot.com",
  messagingSenderId: "682311363044",
  appId: "1:682311363044:web:452f5048aec4691c6a7ff1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { onAuthStateChanged };



