import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Firebase Config
export const firebaseConfig = {
  apiKey: "AIzaSyCu8hn_j3SQxfy3oQiqYSIc6PK9n2JbjK4",
  authDomain: "omniplex-5290f.firebaseapp.com",
  projectId: "omniplex-5290f",
  storageBucket: "omniplex-5290f.firebasestorage.app",
  messagingSenderId: "482232575040",
  appId: "1:482232575040:web:08d42323371263a26beba5",
  measurementId: "G-6VWXCQYQEL"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };

export const initializeFirebase = () => {
  return app;
};
