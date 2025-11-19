// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

export const firebaseConfig = {
  apiKey: "AIzaSyDap-cGTy0IKomhHbVQKB3Y-JLZk1pK42w",
  authDomain: "smilehouse-a68bc.firebaseapp.com",
  projectId: "smilehouse-a68bc",
  storageBucket: "smilehouse-a68bc.firebasestorage.app",
  messagingSenderId: "542151591313",
  appId: "1:542151591313:web:e10b10e0b5a083fe75c630",
  measurementId: "G-0Q5LFE84ER"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// OAuth providers
export const googleProvider = new GoogleAuthProvider();
export const lineProvider = new OAuthProvider("oidc.oid.line");

// 共用的登出函式，頁面可以直接呼叫
export async function logoutAndGoToLogin() {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (err) {
    console.error("[LOGOUT ERROR]", err);
    alert("登出失敗：" + (err.message || ""));
  }
}

// 讓其他檔案可以用
export {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
};