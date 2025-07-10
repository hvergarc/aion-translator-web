// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDIjWfxU6Y9nNy3uY5hGSTw37veCvtCsuU",
  authDomain: "iaion-firebase.firebaseapp.com",
  projectId: "iaion-firebase",
//   storageBucket: "iaion-firebase.firebasestorage.app",
storageBucket: "iaion-firebase.appspot.com",
  messagingSenderId: "388741210179",
  appId: "1:388741210179:web:a5a5b60c7e2253955e74f6",
  measurementId: "G-Q0WDE2NGDP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);