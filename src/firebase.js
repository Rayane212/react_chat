import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDrF5xgtHH5WPKB_ZPnjt2Io_HJrZr7c38",
  authDomain: "react-chat-6ddfc.firebaseapp.com",
  projectId: "react-chat-6ddfc",
  storageBucket: "react-chat-6ddfc.appspot.com",
  messagingSenderId: "436752795153",
  appId: "1:436752795153:web:d8f0721eb4c8506d5353b0",
  measurementId: "G-S3TTJGNEFT"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore();