/* script.js — 好想租屋：登入整合（Google / Email Link / Phone 導頁 / 匿名） */
/* --------------------------------------------------------------- */
/* 1) Firebase CDN（v10.x 模組）                                  */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* 2) 你的 Firebase 設定（照你的專案config） */
const firebaseConfig = {
  apiKey: "AIzaSyDap-cGTy0IKomhHbVQKB3Y-JLZk1pK42w",
  authDomain: "smilehouse-a68bc.firebaseapp.com",
  projectId: "smilehouse-a68bc",
  storageBucket: "smilehouse-a68bc.firebasestorage.app",
  messagingSenderId: "542151591313",
  appId: "1:542151591313:web:e10b10e0b5a083fe75c630",
  measurementId: "G-0Q5LFE84ER"
};

/* 3) 初始化 */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* 4) 小工具 */
const $ = (sel) => document.querySelector(sel);
const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();

/* 5) 登入狀態變化：自動導頁
   - index.html / verify.html：若已登入 → 轉 home.html
   - home.html：若未登入 → 轉 index.html
*/
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

/* 綁定工具：依 id 綁 click */
function bindClick(id, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", handler);
}

/* 6) Google 登入（#btn-google） */
bindClick("btn-google", async () => {
  try {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);
    console.log("✅ Google 登入成功：", res.user?.email || res.user?.uid);
    window.location.href = "home.html";
  } catch (err) {
    console.error("❌ Google 登入失敗：", err);
    alert("Google 登入失敗：" + (err?.message || ""));
  }
});

/* 7) 匿名訪客登入（#btn-guest） */
bindClick("btn-guest", async () => {
  try {
    await signInAnonymously(auth);
    console.log("✅ 以訪客身分登入");
    window.location.href = "home.html";
  } catch (err) {
    console.error("❌ 訪客登入失敗：", err);
    alert("訪客登入失敗：" + (err?.message || ""));
  }
});

/* 8) Email Link 登入（#btn-email）
      流程：index.html 送信 → 使用者點信 → verify.html 自動完成登入
*/
const ACTION_URL = `${location.origin}/verify.html`;
bindClick("btn-email", async () => {
  try {
    const email = prompt("請輸入您的 Email：");
    if (!email) return;
    const settings = { url: ACTION_URL, handleCodeInApp: true };
    await sendSignInLinkToEmail(auth, email, settings);
    localStorage.setItem("emailForSignIn", email);
    alert("已寄送登入連結到您的信箱，請前往收信並點開繼續。");
  } catch (err) {
    console.error("❌ 寄送 Email Link 失敗：", err);
    alert("寄送 Email Link 失敗：" + (err?.message || ""));
  }
});

/* 9) 在 verify.html 自動完成 Email Link 登入 */
async function completeEmailLinkIfNeeded() {
  try {
    if (!isSignInWithEmailLink(auth, window.location.href)) return;
    let email = localStorage.getItem("emailForSignIn");
    if (!email) {
      email = prompt("請輸入當時用來接收連結的 Email：");
      if (!email) return;
    }
    await signInWithEmailLink(auth, email, window.location.href);
    localStorage.removeItem("emailForSignIn");
    window.location.href = "home.html";
  } catch (err) {
    console.error("❌ Email Link 完成登入失敗：", err);
    alert("Email Link 登入失敗：" + (err?.message || ""));
  }
}

/* 10) 電話登入 → 導向 verify.html 進行 OTP（#btn-continue） */
bindClick("btn-continue", () => {
  const c = $("#country")?.value || "+886";
  const p = $("#phone")?.value?.trim();
  if (!p) return alert("請先輸入手機號碼");
  const params = new URLSearchParams({ c, p });
  window.location.href = `verify.html?${params.toString()}`;
});

/* 11) LINE 登入（#btn-line）— 先放教學提示 */
bindClick("btn-line", () => {
  alert(
    "LINE 登入需要串接 LINE Login 或 LIFF。\n\n" +
    "步驟：\n1) 申請 LINE Developers → 建立 Provider / Channel\n2) 啟用 LINE Login，設定 Callback URL（例如 https://你的網域/line-callback ）\n3) 前端載入 LIFF SDK / LINE Login 並交換 ID Token → 後端驗證或用 Firebase Custom Token 登入"
  );
});

/* 12) 登出（home.html 的 #logout） */
bindClick("logout", async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (err) {
    console.error("❌ 登出失敗：", err);
    alert("登出失敗：" + (err?.message || ""));
  }
});

/* 13) 只有 verify.html 才嘗試完成 Email Link 登入 */
if (here === "verify.html") {
  completeEmailLinkIfNeeded();
}