// script.js
// 共用登入／登出邏輯（index.html、profile.html、verify.html 都會載入）

import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* --------------------------------------------------
 * 1. 監聽目前登入狀態（所有頁面共用）
 * -------------------------------------------------- */
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("[auth] 當前登入狀態：", `"${user.uid}"`);
  } else {
    console.log('[auth] 當前登入狀態："未登入"');
  }
});

/* --------------------------------------------------
 * 2. 首頁 index.html：處理各種登入按鈕
 * -------------------------------------------------- */
function initLoginPage() {
  // 依照 index.html 的 id 名稱來抓元素（全部都是 dash 版本）
  const btnPhone  = document.getElementById("btn-phone");
  const btnGoogle = document.getElementById("btn-google");
  const btnLine   = document.getElementById("btn-line");
  const btnEmail  = document.getElementById("btn-email");
  const btnGuest  = document.getElementById("btn-guest");
  const btnForget = document.getElementById("btn-forget");

  // 如果這些按鈕都找不到，代表現在不是 index.html，就直接離開
  if (
    !btnPhone &&
    !btnGoogle &&
    !btnLine &&
    !btnEmail &&
    !btnGuest &&
    !btnForget
  ) {
    return;
  }

  /* ---- Google 登入 ---- */
  btnGoogle?.addEventListener("click", async () => {
    try {
      console.log("[auth] Google 登入開始");
      const provider = new GoogleAuthProvider();

      // 使用彈出視窗方式登入
      await signInWithPopup(auth, provider);

      console.log("[auth] Google 登入成功");
      // 登入成功導回首頁
      window.location.href = "home.html";
    } catch (err) {
      console.error("[auth] Google 登入失敗：", err);
      alert("Google 登入失敗，請稍後再試一次。");
    }
  });

  /* ---- 手機登入（之後可再接完整驗證流程） ---- */
  btnPhone?.addEventListener("click", () => {
    const phoneInput = /** @type {HTMLInputElement|null} */ (
      document.getElementById("phone")
    );
    const phone = phoneInput?.value.trim() || "";

    if (!phone) {
      alert("請先輸入手機號碼。");
      return;
    }

    // 目前先導到 verify.html，之後可以在那邊完成簡訊驗證流程
    // 這邊只做示意，方便你之後接 Firebase Phone Auth
    const url = new URL("verify.html", window.location.origin);
    url.searchParams.set("phone", phone);
    window.location.href = url.toString();
  });

  /* ---- LINE / Email 登入：目前先預留位子 ---- */
  btnLine?.addEventListener("click", () => {
    alert("LINE 登入之後再來接，現在請先用 Google 測試登入流程。");
  });

  btnEmail?.addEventListener("click", () => {
    alert("Email 登入之後再來接，現在請先用 Google 測試登入流程。");
  });

  /* ---- 訪客模式 ---- */
  btnGuest?.addEventListener("click", () => {
    // 如需更進階，可以用 localStorage 記錄 guest 狀態
    console.log("[auth] 以訪客身份繼續");
    window.location.href = "home.html";
  });

  /* ---- 找回帳戶：暫時先導到 verify.html ---- */
  btnForget?.addEventListener("click", () => {
    window.location.href = "verify.html";
  });
}

/* --------------------------------------------------
 * 3. 個人簡介 profile.html：處理登出按鈕
 * -------------------------------------------------- */
function initProfilePage() {
  const logoutRow = document.getElementById("logoutRow");
  if (!logoutRow) return; // 不是 profile.html 就離開

  logoutRow.addEventListener("click", async () => {
    const ok = window.confirm("確定要登出這個帳號嗎？");
    if (!ok) return;

    try {
      console.log("[auth] 登出開始");
      await signOut(auth);
      console.log("[auth] 已登出成功");
      // 回到登入方式選擇頁（index.html）
      window.location.href = "index.html";
    } catch (err) {
      console.error("[auth] 登出失敗：", err);
      alert("登出失敗，請稍後再試一次。");
    }
  });
}

/* --------------------------------------------------
 * 4. verify.html：之後可在這裡處理手機驗證結果
 *    目前先簡單顯示查詢參數（如果有的話）
 * -------------------------------------------------- */
function initVerifyPage() {
  if (!location.pathname.endsWith("verify.html")) return;

  const params = new URLSearchParams(window.location.search);
  const phone = params.get("phone");
  const errBox = document.getElementById("err");

  if (phone && errBox) {
    errBox.style.display = "block";
    errBox.textContent = `目前僅示範導頁流程，尚未真正發送簡訊驗證碼。（手機：${phone}）`;
  }
}

/* --------------------------------------------------
 * 5. 啟動對應頁面的初始化
 * -------------------------------------------------- */
initLoginPage();   // 如果是 index.html，會自動偵測按鈕並啟用
initProfilePage(); // 如果是 profile.html，會自動偵測登出列並啟用
initVerifyPage();  // 如果是 verify.html，會處理簡單訊息顯示