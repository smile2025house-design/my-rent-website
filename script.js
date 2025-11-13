// script.js
import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const here = location.pathname.split("/").pop().toLowerCase();
const $ = (sel) => document.querySelector(sel);

// 自動導頁
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (here === "index.html" || here === "verify.html") {
      location.href = "home.html";
    }
  } else {
    if (here !== "index.html" && here !== "verify.html") {
      location.href = "index.html";
    }
  }
});

// Google 登入
const googleBtn = $("#btn-google");
if (googleBtn) {
  googleBtn.onclick = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      location.href = "home.html";
    } catch (err) {
      alert("Google 登入失敗：" + err.message);
    }
  };
}

// 匿名登入（訪客）
const guestBtn = $("#btn-guest");
if (guestBtn) {
  guestBtn.onclick = async () => {
    await signInAnonymously(auth);
    location.href = "home.html";
  };
}

// Email Link
const emailBtn = $("#btn-email");
if (emailBtn) {
  emailBtn.onclick = async () => {
    const email = prompt("請輸入 Email：");
    if (!email) return;

    await sendSignInLinkToEmail(auth, email, {
      url: `${location.origin}/verify.html`,
      handleCodeInApp: true,
    });

    localStorage.setItem("emailForSignIn", email);
    alert("已寄送登入連結");
  };
}

// verify.html 自動完成登入
if (here === "verify.html") {
  completeEmailLinkLogin();
}

async function completeEmailLinkLogin() {
  if (!isSignInWithEmailLink(auth, location.href)) return;

  let email = localStorage.getItem("emailForSignIn");
  if (!email) {
    email = prompt("請輸入之前使用的 Email：");
  }
  try {
    await signInWithEmailLink(auth, email, location.href);
    localStorage.removeItem("emailForSignIn");
    location.href = "home.html";
  } catch (err) {
    alert("Email Link 登入失敗：" + err.message);
  }
}