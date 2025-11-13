/* ---------------------------------------------------------------
   Firebase (登入專用)
---------------------------------------------------------------- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDap-cGTy0KmhNbVQKB3Y-JLZk1pK42w",
  authDomain: "smilehouse-a68bc.firebaseapp.com",
  projectId: "smilehouse-a68bc",
  storageBucket: "smilehouse-a68bc.firebasestorage.app",
  messagingSenderId: "542151591313",
  appId: "1:542151591313:web:e10b1e0eb5a038e75c5630",
  measurementId: "G-08LFEB4EER"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* 工具 */
const $ = (sel) => document.querySelector(sel);
const path = location.pathname.split("/").pop() || "home.html";

/* ---------------------------------------------------------------
   自動分頁高亮 footer tab
---------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("footer.tabs a.tab").forEach((a) => {
    if (a.getAttribute("href") === path) {
      a.classList.add("active");
    }
  });
});

/* ---------------------------------------------------------------
   Firebase 登入轉址
---------------------------------------------------------------- */
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (path === "index.html" || path === "verify.html") {
      window.location.href = "home.html";
    }
  } else {
    if (path !== "index.html" && path !== "verify.html") {
      window.location.href = "index.html";
    }
  }
});

/* Google 登入 */
const googleBtn = $("#google-login");
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      window.location.href = "home.html";
    } catch (err) {
      alert("Google 登入失敗：" + err.message);
    }
  });
}

/* 匿名 */
const guestBtn = $("#guest-login");
if (guestBtn) {
  guestBtn.addEventListener("click", async () => {
    await signInAnonymously(auth);
    window.location.href = "home.html";
  });
}

/* Email Link 寄送 */
const emailBtn = $("#email-login");
if (emailBtn) {
  emailBtn.addEventListener("click", async () => {
    const email = prompt("請輸入 email：");
    if (!email) return;
    try {
      await sendSignInLinkToEmail(auth, email, {
        url: `${location.origin}/verify.html`,
        handleCodeInApp: true
      });
      localStorage.setItem("emailForSignIn", email);
      alert("已寄出登入連結，請去信箱點開");
    } catch (err) {
      alert("Email Link 寄送失敗：" + err.message);
    }
  });
}

/* Email Link 自動登入 */
if (isSignInWithEmailLink(auth, window.location.href)) {
  let email = localStorage.getItem("emailForSignIn") || prompt("請輸入 Email");
  if (email) {
    await signInWithEmailLink(auth, email, window.location.href);
    localStorage.removeItem("emailForSignIn");
    window.location.href = "home.html";
  }
}

/* 登出 */
const logoutBtn = $("#logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await auth.signOut();
    window.location.href = "index.html";
  });
}