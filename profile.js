// profile.js
// 個人簡介頁：登入檢查 + 身份切換 + 基本資料顯示

import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// localStorage 的 key（請讓 account.js 存到同一個 key）
const STORAGE_KEY_PROFILE = "myRentProfile"; // 基本資料
const STORAGE_KEY_ROLE = "myRentRole";       // 目前身份

// 各種身份的對應說明文字
const ROLE_CONFIG = {
  guest: {
    label: "房客／旅客",
    desc: "適合正在找房、短期住宿或體驗不同城市生活的使用者。",
  },
  landlord: {
    label: "房東",
    desc: "適合擁有 1–2 間房產，想穩定出租並掌握租金收入與房客服務。",
  },
  master: {
    label: "包租公／包租婆",
    desc: "適合擁有多間房、轉租或委託代管，重視整體資產與現金流管理。",
  },
  agent: {
    label: "代管業者",
    desc: "適合協助多位房東管理房源、維修與帳務的專業代管公司。",
  },
  investor: {
    label: "置產投資人",
    desc: "適合關注房市趨勢、投報率與長期資產佈局的投資者。",
  },
  other: {
    label: "其他身份",
    desc: "尚未明確角色，或是同時具有多重身份的使用者。",
  },
};

// 取得頁面元素
const avatarIcon = document.getElementById("avatarIcon");
const userNameEl = document.getElementById("userName");
const userRoleLabelEl = document.getElementById("userRoleLabel");

const roleSpan = document.getElementById("roleSpan");
const roleDesc = document.getElementById("roleDesc");
const chipsContainer = document.getElementById("roleChips");

// ----------------------
// 1. 監聽登入狀態
// ----------------------
function setupAuthWatcher() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      console.log('[auth] 當前登入狀態："未登入"');
      window.location.href = "index.html";
      return;
    }

    console.log(`[auth] 當前登入狀態："${user.uid}"`);

    const defaultName =
      user.displayName ||
      user.phoneNumber ||
      user.email ||
      "好想租屋會員";

    applyProfileName(defaultName);
    restoreBasicProfile();
  });
}

// ----------------------
// 2. 基本資料（名字、頭像）
// ----------------------
function applyProfileName(name) {
  if (userNameEl) userNameEl.textContent = name || "好想租屋會員";
  if (avatarIcon) avatarIcon.textContent = name?.trim()?.[0] || "租";
}

// 從 localStorage 把 account.html 存的資料拉出來
function restoreBasicProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data && data.name) applyProfileName(data.name);
  } catch (err) {
    console.warn("讀取本機基本資料失敗：", err);
  }
}

// ----------------------
// 3. 身份 chips 切換
// ----------------------
function applyRole(roleKey) {
  const config = ROLE_CONFIG[roleKey] || ROLE_CONFIG.guest;

  if (userRoleLabelEl)
    userRoleLabelEl.textContent = `目前的身份：${config.label}`;
  if (roleSpan) roleSpan.textContent = config.label;
  if (roleDesc) roleDesc.textContent = config.desc;

  if (chipsContainer) {
    const chips = chipsContainer.querySelectorAll(".chip");
    chips.forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.role === roleKey);
    });
  }
}

function restoreRole() {
  let roleKey = "guest";
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ROLE);
    if (saved) roleKey = saved;
  } catch {}
  applyRole(roleKey);
}

function setupRoleChips() {
  if (!chipsContainer) return;
  const chips = chipsContainer.querySelectorAll(".chip");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const role = chip.dataset.role || "guest";
      applyRole(role);
      localStorage.setItem(STORAGE_KEY_ROLE, role);
    });
  });
}

// ----------------------
// 初始化
// ----------------------
function initProfilePage() {
  setupAuthWatcher();
  setupRoleChips();
  restoreRole();
}

initProfilePage();