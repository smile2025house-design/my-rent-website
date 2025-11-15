// account.js
// 會員資料編輯頁（和 profile 頁面共用同一份資料）

import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 和 profile.js 對齊的 localStorage key（之後 profile 頁可以共用）
const STORAGE_KEY_PROFILE = "myRentProfile";

// ------- 1. 抓取畫面上的欄位（要跟你 account.html 的 id 對齊） -------
const form = document.getElementById("profileForm");
const fullNameInput = document.getElementById("fullName");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const lineIdInput = document.getElementById("lineId");
const idNumberInput = document.getElementById("idNumber");
const citySelect = document.getElementById("city");
const jobInput = document.getElementById("job");
const addressInput = document.getElementById("address");
const expYearsInput = document.getElementById("experienceYears");
const unitCountInput = document.getElementById("unitCount");
const preferenceInput = document.getElementById("preference");
const noteInput = document.getElementById("note");
const btnBack = document.getElementById("btnBack");
const statusText = document.getElementById("statusText");

// ------- 2. 監聽登入狀態：沒登入就丟回 index.html -------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.log("[account] 未登入，導回登入頁");
    window.location.href = "index.html";
    return;
  }

  console.log("[account] 目前使用者 uid：", user.uid);

  // 有登入就：
  // 1) 從 Firestore 拉資料
  await loadProfileFromFirestore(user);
  // 2) 補上 localStorage 的資料（如果有的話）
  loadProfileFromLocal(user);
  // 3) 接上表單送出事件
  setupFormSubmit(user);
  // 4) 「返回個人簡介」按鈕
  setupBackButton();
});

// ------- 3. 從 Firestore 載入 profiles/{uid} -------
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
    fillForm(data);

    // 同步一份簡化版到 localStorage 給 profile.html 用
    const simpleProfile = {
      name: data.name || "",
      city: data.city || "",
      phone: data.phone || "",
    };
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(simpleProfile));
  } catch (err) {
    console.error("[account] 讀取 Firestore 失敗：", err);
  }
}

// ------- 4. 如果 Firestore 還沒有，就用 localStorage / Auth 補上 -------
function loadProfileFromLocal(user) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (raw) {
      const data = JSON.parse(raw);
      console.log("[account] 使用 localStorage 補資料：", data);

      // 只補「目前表單是空的」的欄位
      if (fullNameInput && !fullNameInput.value && data.name) {
        fullNameInput.value = data.name;
      }
      if (citySelect && !citySelect.value && data.city) {
        citySelect.value = data.city;
      }
      if (phoneInput && !phoneInput.value && data.phone) {
        phoneInput.value = data.phone;
      }
    } else {
      // 完全沒有資料，就用 Firebase Auth 的暱稱 / email / phone 當預設
      const defaultName =
        user.displayName || user.phoneNumber || user.email || "";
      if (fullNameInput && !fullNameInput.value && defaultName) {
        fullNameInput.value = defaultName;
      }
      if (emailInput && !emailInput.value && user.email) {
        emailInput.value = user.email;
      }
      if (phoneInput && !phoneInput.value && user.phoneNumber) {
        phoneInput.value = user.phoneNumber;
      }
    }
  } catch (err) {
    console.warn("[account] 解析 localStorage 失敗：", err);
  }
}

// ------- 5. 把 Firestore 的資料塞進欄位 -------
function fillForm(data) {
  if (!data) return;

  if (fullNameInput && data.name) fullNameInput.value = data.name;
  if (phoneInput && data.phone) phoneInput.value = data.phone;
  if (emailInput && data.email) emailInput.value = data.email;
  if (lineIdInput && data.lineId) lineIdInput.value = data.lineId;
  if (idNumberInput && data.idNumber) idNumberInput.value = data.idNumber;
  if (citySelect && data.city) citySelect.value = data.city;
  if (jobInput && data.job) jobInput.value = data.job;
  if (addressInput && data.address) addressInput.value = data.address;
  if (expYearsInput && typeof data.experienceYears !== "undefined")
    expYearsInput.value = data.experienceYears;
  if (unitCountInput && typeof data.unitCount !== "undefined")
    unitCountInput.value = data.unitCount;
  if (preferenceInput && data.preference)
    preferenceInput.value = data.preference;
  if (noteInput && data.note) noteInput.value = data.note;
}

// ------- 6. 表單送出：寫入 Firestore + localStorage -------
function setupFormSubmit(user) {
  if (!form) {
    console.warn("[account] 找不到 form#profileForm");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const profileData = {
      uid: user.uid,
      name: fullNameInput?.value.trim() || "",
      phone: phoneInput?.value.trim() || "",
      email: emailInput?.value.trim() || "",
      lineId: lineIdInput?.value.trim() || "",
      idNumber: idNumberInput?.value.trim() || "",
      city: citySelect?.value || "",
      job: jobInput?.value.trim() || "",
      address: addressInput?.value.trim() || "",
      experienceYears: expYearsInput?.value
        ? Number(expYearsInput.value)
        : null,
      unitCount: unitCountInput?.value ? Number(unitCountInput.value) : null,
      preference: preferenceInput?.value.trim() || "",
      note: noteInput?.value.trim() || "",
      updatedAt: serverTimestamp(),
    };

    try {
      const ref = doc(db, "profiles", user.uid);
      await setDoc(ref, profileData, { merge: true });

      // 也更新 localStorage（給 profile.html 用）
      const simpleProfile = {
        name: profileData.name,
        city: profileData.city,
        phone: profileData.phone,
      };
      localStorage.setItem(
        STORAGE_KEY_PROFILE,
        JSON.stringify(simpleProfile)
      );

      if (statusText) {
        statusText.textContent = "✅ 已儲存你的會員資料";
        statusText.style.color = "#16a34a";
      }

      console.log("[account] 儲存成功：", profileData);
    } catch (err) {
      console.error("[account] 儲存失敗：", err);
      if (statusText) {
        statusText.textContent = "❌ 儲存失敗，請稍後再試";
        statusText.style.color = "#b91c1c";
      }
    }
  });
}

// ------- 7. 返回個人簡介按鈕 -------
function setupBackButton() {
  if (!btnBack) return;
  btnBack.addEventListener("click", () => {
    window.location.href = "profile.html";
  });
}