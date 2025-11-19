// profile.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ 用你目前在 script.js / account.js 一樣的設定
const firebaseConfig = {
  apiKey: "AIzaSyDap-cGTy0IKomhHbVQKB3Y-JLZk1pK42w",
  authDomain: "smilehouse-a68bc.firebaseapp.com",
  projectId: "smilehouse-a68bc",
  storageBucket: "smilehouse-a68bc.appspot.com",
  messagingSenderId: "542151591313",
  appId: "1:542151591313:web:e10b10e0b5a083fe75c630",
  measurementId: "G-0Q5LFE84ER"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

const $ = (id) => document.getElementById(id);

const nameEl  = $("displayName");
const phoneEl = $("phone");
const lineEl  = $("lineId");
const cityEl  = $("city");
const roleEl  = $("role");
const noteEl  = $("note");
const msgEl   = $("msg");
const backBtn = $("btn-back");
const saveBtn = $("btn-save");

let currentUid = null;

// ---------- 角色 pill 選擇 ----------
const rolePills = document.querySelectorAll(".role-pill");
rolePills.forEach((pill) => {
  pill.addEventListener("click", () => {
    rolePills.forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    roleEl.value = pill.dataset.role;
  });
});

function setRole(role) {
  if (!role) return;
  roleEl.value = role;
  rolePills.forEach(p => {
    p.classList.toggle("active", p.dataset.role === role);
  });
}

// ---------- 載入會員資料 ----------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "account.html"; // 未登入導回登入頁
    return;
  }

  currentUid = user.uid;
  console.log("[profile] 目前使用者 uid:", currentUid);

  try {
    const ref = doc(db, "users", currentUid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      nameEl.value  = data.displayName || "";
      phoneEl.value = data.phone || "";
      lineEl.value  = data.lineId || "";
      cityEl.value  = data.city || "";
      noteEl.value  = data.note || "";
      setRole(data.role || "");
      msgEl.textContent = "已載入之前儲存的資料";
    } else {
      msgEl.textContent = "第一次填寫基本資料，請完成後按「儲存資料」。";
    }
  } catch (err) {
    console.error("[profile] 讀取失敗：", err);
    msgEl.textContent = "讀取資料失敗：" + (err.message || "");
  }
});

// ---------- 儲存資料 ----------
saveBtn.addEventListener("click", async () => {
  if (!currentUid) return;

  const name = nameEl.value.trim();
  if (!name) {
    msgEl.textContent = "請至少填寫「姓名」";
    return;
  }

  const data = {
    displayName: name,
    phone: phoneEl.value.trim(),
    lineId: lineEl.value.trim(),
    city: cityEl.value.trim(),
    role: roleEl.value || "other",
    note: noteEl.value.trim(),
    updatedAt: serverTimestamp(),
  };

  try {
    const ref = doc(db, "users", currentUid);
    await setDoc(ref, data, { merge: true });
    msgEl.textContent = "儲存成功！即將返回個人簡介...";
    setTimeout(() => {
      window.location.href = "me.html";  // ⭐ 這裡換成你的「個人簡介首頁」檔名
    }, 800);
  } catch (err) {
    console.error("[profile] 儲存失敗：", err);
    msgEl.textContent = "儲存失敗：" + (err.message || "");
  }
});

// 返回按鈕
backBtn.addEventListener("click", () => {
  window.location.href = "me.html";  // 同上：你的個人簡介首頁
});