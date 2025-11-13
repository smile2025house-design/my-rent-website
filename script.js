/* script.js — Firebase 登入整合：Google / Email Link / Phone Redirect / 匿名 */
/* --------------------------------------------------------------- */
/* 1) Firebase CDN 模組 */
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

/* 2) 正確的 Firebase Config（你剛剛提供的） */
const firebaseConfig = {
  apiKey: "AIzaSyDap-cGTy0IKomhHbVQKB3Y-JLZk1pK42w",
  authDomain: "smilehouse-a68bc.firebaseapp.com",
  projectId: "smilehouse-a68bc",
  storageBucket: "smilehouse-a68bc.firebasestorage.app",
  messagingSenderId: "542151591313",
  appId: "1:542151591313:web:e10b1e00b5a083fe75c630",
  measurementId: "G-Q05LFE84ER"
};

/* 3) 初始化 Firebase */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* 工具 */
const $ = (sel) => document.querySelector(sel);
const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();

/* 4) 自動導頁 */
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (here === "index.html" || here === "verify.html") {
      window.location.href = "home.html";
    }
  } else {
    if (here === "home.html") {
      window.location.href = "index.html";
    }
  }
});

/* 5) Google 登入 */
const wireGoogle = () => {
  const btn = $("#btn-google");
  if (!btn) return;
  
  const provider = new GoogleAuthProvider();

  btn.addEventListener("click", async () => {
    try {
      const res = await signInWithPopup(auth, provider);
      window.location.href = "home.html";
    } catch (err) {
      console.error(err);
      alert("Google 登入失敗：" + err.message);
    }
  });
};

/* 6) 匿名登入 */
const wireGuest = () => {
  const btn = $("#btn-guest");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    try {
      await signInAnonymously(auth);
      window.location.href = "home.html";
    } catch (err) {
      alert("訪客登入失敗：" + err.message);
    }
  });
};

/* 7) Email Link 登入（寄信） */
const ACTION_URL = `${location.origin}/verify.html`;

const wireEmailLinkSender = () => {
  const btn = $("#btn-email");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    try {
      const email = prompt("請輸入電子郵件：");
      if (!email) return;

      await sendSignInLinkToEmail(auth, email, {
        url: ACTION_URL,
        handleCodeInApp: true
      });

      localStorage.setItem("emailForSignIn", email);
      alert("登入連結已寄出，請到信箱點開繼續。");
    } catch (err) {
      alert("Email Link 寄送失敗：" + err.message);
    }
  });
};

/* 8) 完成 Email Link */
const completeEmailLinkIfNeeded = async () => {
  if (!isSignInWithEmailLink(auth, window.location.href)) return;

  let email = localStorage.getItem("emailForSignIn");
  if (!email) {
    email = prompt("請輸入當時用的 Email：");
  }

  try {
    await signInWithEmailLink(auth, email, window.location.href);
    localStorage.removeItem("emailForSignIn");
    window.location.href = "home.html";
  } catch (err) {
    alert("Email Link 登入失敗：" + err.message);
  }
};

/* 9) 手機登入：跳轉 verify.html（OTP 發送流程在 verify.html） */
const wirePhoneRedirect = () => {
  const btn = $("#btn-continue");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const c = $("#country")?.value || "+886";
    const p = $("#phone")?.value.trim();
    if (!p) return alert("請輸入手機號碼");

    const params = new URLSearchParams({ c, p });
    window.location.href = `verify.html?${params.toString()}`;
  });
};

/* 10) LINE 登入（占位） */
const wireLinePlaceholder = () => {
  const btn = $("#btn-line");
  if (!btn) return;

  btn.addEventListener("click", () => {
    alert("LINE Login 需另外串接 LIFF，未來可幫你加上。");
  });
};

/* 11) 登出 */
const wireLogout = () => {
  const btn = $("#logout");
  if (!btn) return;

  btn.addEventListener("click", () => {
    auth.signOut().then(() => {
      window.location.href = "index.html";
    });
  });
};

/* 啟用所有事件 */
wireGoogle();
wireGuest();
wireEmailLinkSender();
wirePhoneRedirect();
wireLinePlaceholder();
wireLogout();

/* verify.html 自動完成 Email Link */
if (here === "verify.html") {
  completeEmailLinkIfNeeded();
}