// account.js 會員資料寫入 Firestore
import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById("profileForm");
const statusText = document.getElementById("statusText");
const btnBack = document.getElementById("btnBack");

let currentUser = null;

// 欄位對照
const fields = {
  fullName: document.getElementById("fullName"),
  phone: document.getElementById("phone"),
  email: document.getElementById("email"),
  lineId: document.getElementById("lineId"),
  idNumber: document.getElementById("idNumber"),
  city: document.getElementById("city"),
  job: document.getElementById("job"),
  address: document.getElementById("address"),
  experienceYears: document.getElementById("experienceYears"),
  unitCount: document.getElementById("unitCount"),
  preference: document.getElementById("preference"),
  note: document.getElementById("note"),
};

// 從 Firestore 載入已存資料
async function loadProfile(uid) {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const data = snap.data();
    Object.keys(fields).forEach((key) => {
      if (data[key] !== undefined && fields[key]) {
        fields[key].value = data[key];
      }
    });

    statusText.textContent = "已載入之前儲存的資料。";
  } catch (err) {
    console.error("載入會員資料失敗：", err);
    statusText.textContent = "載入資料時發生錯誤。";
  }
}

// 儲存資料到 Firestore
async function saveProfile(uid, payload) {
  const ref = doc(db, "users", uid);
  await setDoc(ref, payload, { merge: true });
}

// 監聽登入狀態
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    statusText.textContent = "尚未登入，將返回登入頁面…";
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
    return;
  }

  currentUser = user;
  await loadProfile(user.uid);
});

// 表單送出
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) {
    alert("尚未登入，請重新登入後再試一次。");
    return;
  }

  statusText.textContent = "儲存中…";

  const payload = {};
  Object.keys(fields).forEach((key) => {
    payload[key] = fields[key].value.trim();
  });

  try {
    await saveProfile(currentUser.uid, payload);
    statusText.textContent = "已儲存成功！";
    alert("會員資料已更新完成。");
    // 儲存後導回個人簡介頁
    window.location.href = "profile.html";
  } catch (err) {
    console.error("儲存會員資料失敗：", err);
    statusText.textContent = "儲存發生錯誤，請稍後再試。";
    alert("儲存失敗，請稍後再試一次。");
  }
});

// 返回個人簡介
btnBack.addEventListener("click", () => {
  window.location.href = "profile.html";
});