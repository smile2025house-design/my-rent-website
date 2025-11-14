// script.js
// -----------------------------------------------------
// 共用登入狀態監聽 + 登出事件
// -----------------------------------------------------

import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/**
 * 更新「個人簡介」頁面的 UI
 * - profileName
 * - profileRole
 */
function updateProfilePage(user) {
  const nameEl = document.getElementById("profileName");
  const roleEl = document.getElementById("profileRole");

  if (!nameEl && !roleEl) return; // 不在 profile.html，直接略過

  if (user) {
    // 有登入
    const displayName = user.displayName || "好想租屋會員";
    const email = user.email || "";

    nameEl.textContent = displayName;

    // 這裡先給一段簡單文案，你之後可以自己改
    if (roleEl) {
      roleEl.textContent =
        email
          ? `目前以會員身份使用：${email}，好好享受找房體驗。`
          : "目前以會員身份使用，好好享受找房體驗。";
    }
  } else {
    // 未登入（訪客模式）
    if (nameEl) nameEl.textContent = "訪客模式";
    if (roleEl)
      roleEl.textContent = "登入後即可同步預約紀錄、房源收藏與帶看服務。";
  }
}

/**
 * 綁定登出按鈕
 * - profile.html 裡的整行「登出」：id="logoutRow"
 * - 其他頁面如果有按鈕 id="logoutBtn" 也會一起支援
 */
function setupLogoutHandlers() {
  const logoutRow = document.getElementById("logoutRow");
  const logoutBtn = document.getElementById("logoutBtn");

  const handler = async () => {
    const confirmLogout = window.confirm("確定要登出帳號嗎？");
    if (!confirmLogout) return;

    try {
      await signOut(auth);
      alert("已成功登出，下次再回來找房子～");
      // 登出後導回首頁（你也可以改成 index.html）
      window.location.href = "home.html";
    } catch (err) {
      console.error("登出失敗：", err);
      alert("登出時發生錯誤，請稍後再試。");
    }
  };

  if (logoutRow) {
    logoutRow.addEventListener("click", handler);
  }
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handler);
  }
}

/**
 * 初始化：整個網站共用
 */
function initAuthListener() {
  onAuthStateChanged(auth, (user) => {
    console.log("[auth] 當前登入狀態：", user ? user.uid : "未登入");

    // 更新個人簡介頁面的內容
    updateProfilePage(user);

    // 之後如果有「房東模式頁面需要強制登入」，可以在這裡加判斷：
    // const path = window.location.pathname;
    // if (!user && path.endsWith("manage.html")) {
    //   alert("請先登入會員再使用物件出租管理功能。");
    //   window.location.href = "verify.html"; // 或你的登入頁
    // }
  });
}

// -----------------------------------------------------
// 實際執行
// -----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initAuthListener();
  setupLogoutHandlers();
});