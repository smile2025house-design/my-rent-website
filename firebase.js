// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// ★★★ 請用你自己的 Firebase Config ★★★
const firebaseConfig = {
  apiKey: "AIzaSyDap-cGTy0IKomhhbVQKB3Y-JLZk1pK42w",
  authDomain: "smilehouse-a68bc.firebaseapp.com",
  projectId: "smilehouse-a68bc",
  storageBucket: "smilehouse-a68bc.firebasestorage.app",
  messagingSenderId: "542151591313",
  appId: "1:542151591313:web:e10b1e0eb5a083fe75c630",
  measurementId: "G-08SLFEB4EER"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);