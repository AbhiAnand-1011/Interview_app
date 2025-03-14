import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
    apiKey: "AIzaSyBe7pIsXG55c7lw8N0Z8UYZ1BrCrXn8rAw",
    authDomain: "interview-d416c.firebaseapp.com",
    projectId: "interview-d416c",
    storageBucket: "interview-d416c.firebasestorage.app",
    messagingSenderId: "327945308569",
    appId: "1:327945308569:web:77b7adf124afb73059eb08",
    measurementId: "G-Q43NTYYWQZ"
  };
  const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export {auth};