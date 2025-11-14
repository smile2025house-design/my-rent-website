import { auth, onAuthStateChanged } from "./firebase.js";

// 全站登入保護
export function requireAuth() {
  onAuthStateChanged(auth, (user) => {
    const isVerifyPage = window.location.pathname.includes("verify.html");

    // 未登入 → 只能停留在 verify.html
    if (!user) {
      if (!isVerifyPage) {
        window.location.href = "verify.html";
      }
      return;
    }

    // 已登入 → 不可停在 verify.html
    if (user && isVerifyPage) {
      window.location.href = "profile.html";
    }
  });
}