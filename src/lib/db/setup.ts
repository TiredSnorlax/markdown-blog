// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
//

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "markdown-blog-1116c.firebaseapp.com",
  projectId: "markdown-blog-1116c",
  storageBucket: "markdown-blog-1116c.appspot.com",
  messagingSenderId: "1021866219410",
  appId: "1:1021866219410:web:1ca507cd1f486c2341134b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const db = getFirestore(app);

export { app, auth, db };
