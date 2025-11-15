// account.js
// 會員基本資料編輯頁（和 profile.js 完全連動）

import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ⚙️ 和 profile.js 對齊的 key
const STORAGE_KEY_PROFILE = "myRentProfile"; // 基本資料
const STORAGE_KEY_ROLE = "myRentRole";       // 身分

// 這些是你在 account.html 裡的欄位 id（請確認頁面有這些元素）
const form = document.getElementById("accountForm");
const nameInput = document.getElementById("accName");
const phoneInput = document.getElementById("accPhone");
const cityInput = document.getElementById("accCity");
const roleSelect = document.getElementById("accRole"); // 下拉選單：身分
const noteInput = document.getElementById("accNote");
const statusBox = document.getElementById("accountStatus");

// ---------- 1. 先確認登入狀態 ----------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.log('[account] 未登入，導回登入頁');
    window.location.href = "index.html";
    return;
  }

  console.log(`[account] 目前使用者：${user.uid}`);

  // 有登入就載入資料
  await loadProfileFromFirestore(user);
  loadProfileFromLocalFallback(user);
  setupFormSubmit(user);
});

// ---------- 2. 從 Firestore 載入 profiles/{uid} ----------
async function loadProfileFromFirestore(user) {
  try {
    const ref = doc(db, "profiles", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      console.log("[account] Firestore 尚未建立 profile，略過");
      return;
    }

    const data = snap.data();
    console.log("[account] 從 Firestore 載入資料：", data);

    fillFormWithData(data);

    // 順便同步一份到 localStorage，讓 profile.js 也能用
    const profileForLocal = {
      name: data.name || "",
      phone: data.phone || "",
      city: data.city || "",
      note: data.note || "",
    };
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profileForLocal));
    if (data.role) {
      localStorage.setItem(STORAGE_KEY_ROLE, data.role);
    }
  } catch (err) {
    console.error("[account] 讀取 Firestore 失敗：", err);
  }
}

// ---------- 3. 若 Firestore 還沒有，就用 localStorage / auth 當後備 ----------
function loadProfileFromLocalFallback(user) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (raw) {
      const data = JSON.parse(raw);
      console.log("[account] 使用 localStorage 資料填入表單：", data);
      fillFormWithData(data);
    } else {
      // 完全沒有，就用 Firebase Auth 的基本資訊當預設
      const defaultName =
        user.displayName ||
        user.phoneNumber ||
        user.email ||
        "";
      if (nameInput && !nameInput.value) {
        nameInput.value = defaultName;
      }
    }

    const savedRole = localStorage.getItem(STORAGE_KEY_ROLE);
    if (roleSelect && savedRole && !roleSelect.value) {
      roleSelect.value = savedRole;
    }
  } catch (err) {
    console.warn("[account] localStorage 解析失敗：", err);
  }
}

// ---------- 4. 把資料塞進表單 ----------
function fillFormWithData(data) {
  if (!data) return;
  if (nameInput && data.name) nameInput.value = data.name;
  if (phoneInput && data.phone) phoneInput.value = data.phone;
  if (cityInput && data.city) cityInput.value = data.city;
  if (noteInput && data.note) noteInput.value = data.note;
  if (roleSelect && data.role) roleSelect.value = data.role;
}

// ---------- 5. 表單送出：寫入 Firestore + localStorage ----------
function setupFormSubmit(user) {
  if (!form) {
    console.warn("[account] 找不到 form#accountForm");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const profileData = {
      name: nameInput?.value.trim() || "",
      phone: phoneInput?.value.trim() || "",
      city: cityInput?.value.trim() || "",
      note: noteInput?.value.trim() || "",
      role: roleSelect?.value || "guest",
      uid: user.uid,
      updatedAt: serverTimestamp(),
    };

    try {
      const ref = doc(db, "profiles", user.uid);
      await setDoc(ref, profileData, { merge: true });

      // 寫回 localStorage 給 profile.js 用
      const localProfile = {
        name: profileData.name,
        phone: profileData.phone,
        city: profileData.city,
        note: profileData.note,
      };
      localStorage.setItem(
        STORAGE_KEY_PROFILE,
        JSON.stringify(localProfile)
      );
      localStorage.setItem(STORAGE_KEY_ROLE, profileData.role);

      if (statusBox) {
        statusBox.textContent = "✅ 已儲存你的基本資料";
        statusBox.style.color = "#16a34a";
      }

      // 儲存完可以導回個人簡介頁（看你要不要）
      // window.location.href = "profile.html";
    } catch (err) {
      console.error("[account] 儲存失敗：", err);
      if (statusBox) {
        statusBox.textContent = "❌ 儲存失敗，請稍後再試";
        statusBox.style.color = "#b91c1c";
      }
    }
  });
}