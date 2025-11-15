// profile.js
// 個人簡介頁：登入檢查 + 身份顯示 + 基本資料整合（和 account.js 對應）

import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 與 account.js 對應的 localStorage key
const STORAGE_KEY_PROFILE = "myRentProfile";
const STORAGE_KEY_ROLE = "myRentRole";

// 各種身份的說明（Airbnb 風格文案）
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
    desc: "擁有多間房、委託代管，重視現金流與長期穩定經營的房產經營者。",
  },
  agent: {
    label: "代管業者",
    desc: "協助多位房東管理物件、租金、修繕與報表的專業團隊。",
  },
  investor: {
    label: "置產投資人",
    desc: "專注房地產趨勢與投報率，尋找適合長期投資的物件。",
  },
  other: {
    label: "其他身份",
    desc: "尚未明確角色，或是同時具備多重身份的使用者。",
  },
};

// 頁面元素
const avatarIcon = document.getElementById("avatarIcon");
const userNameEl = document.getElementById("userName");
const userCityEl = document.getElementById("userCity");
const userPhoneEl = document.getElementById("userPhone");
const userRoleLabelEl = document.getElementById("userRoleLabel");
const roleSpan = document.getElementById("roleSpan");
const roleDesc = document.getElementById("roleDesc");
const chipsContainer = document.getElementById("roleChips");
const editBtn = document.getElementById("btnEditProfile");

// ----------------------
// 1. 監聽登入狀態
// ----------------------
function setupAuthWatcher() {
  onAuthStateChanged(auth, async (user) => {
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

    // 同步 Firestore 與 localStorage 資料
    await restoreProfileData(user);
    setupRoleChips();
    restoreRole();
  });
}

// ----------------------
// 2. 從 Firestore / localStorage 拉資料
// ----------------------
async function restoreProfileData(user) {
  try {
    // Firestore 先
    const ref = doc(db, "profiles", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      console.log("[profile] 從 Firestore 取得資料：", data);
      fillProfileUI(data);

      // 更新 localStorage（同步給下次快速載入）
      const localData = {
        name: data.name || "",
        phone: data.phone || "",
        city: data.city || "",
      };
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(localData));
      if (data.role) localStorage.setItem(STORAGE_KEY_ROLE, data.role);
      return;
    }

    // 若 Firestore 沒資料，改從 localStorage 讀
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (raw) {
      const local = JSON.parse(raw);
      console.log("[profile] 使用 localStorage 資料：", local);
      fillProfileUI(local);
    }
  } catch (err) {
    console.error("[profile] 讀取會員資料失敗：", err);
  }
}

// ----------------------
// 3. 顯示會員資料在畫面上
// ----------------------
function fillProfileUI(data) {
  if (!data) return;
  if (userNameEl && data.name) userNameEl.textContent = data.name;
  if (userCityEl && data.city) userCityEl.textContent = data.city;
  if (userPhoneEl && data.phone) userPhoneEl.textContent = data.phone;
  if (avatarIcon)
    avatarIcon.textContent =
      data.name?.trim()?.[0] || "租";
}

// ----------------------
// 4. 身份 chips 切換
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
// 5. 點擊「編輯」導向 account.html
// ----------------------
if (editBtn) {
  editBtn.addEventListener("click", () => {
    window.location.href = "account.html";
  });
}

// ----------------------
// 初始化
// ----------------------
setupAuthWatcher();