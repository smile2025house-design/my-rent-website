// agent.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ 跟其他頁面一樣的 Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyDap-cGTy0IKomhHbVQKB3Y-JLZk1pK42w",
  authDomain: "smilehouse-a68bc.firebaseapp.com",
  projectId: "smilehouse-a68bc",
  storageBucket: "smilehouse-a68bc.firebasestorage.app",
  messagingSenderId: "542151591313",
  appId: "1:542151591313:web:e10b10e0b5a083fe75c630",
  measurementId: "G-0Q5LFE84ER"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM 元件
const headerSubEl = document.getElementById("header-sub");
const agentNameEl = document.getElementById("agent-name");
const btnLogout = document.getElementById("btn-logout");
const badgeRoleEl = document.getElementById("badge-role");
const badgeCityEl = document.getElementById("badge-city");
const msgEl = document.getElementById("msg");

// 打卡
const btnCheckin = document.getElementById("btn-checkin");
const attendanceStatusEl = document.getElementById("attendance-status");
const attendanceListEl = document.getElementById("attendance-list");

// 案件表單
const formListing = document.getElementById("form-listing");
const listingTitleEl = document.getElementById("listing-title");
const listingCityEl = document.getElementById("listing-city");
const listingDistrictEl = document.getElementById("listing-district");
const listingRentEl = document.getElementById("listing-rent");
const listingLandlordIdEl = document.getElementById("listing-landlord-id");
const listingStatusEl = document.getElementById("listing-status");
const listingNoteEl = document.getElementById("listing-note");

const tableListingsBodyEl = document.getElementById("table-listings-body");

function setMsg(text) {
  if (msgEl) msgEl.textContent = text;
}

function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatTime(date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// 當前業務資訊
let currentUser = null;
let currentUserDoc = null;

// 監聽登入狀態
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // 尚未登入 → 回登入頁
    window.location.href = "login.html";
    return;
  }

  currentUser = user;

  headerSubEl.textContent = user.email || "已登入";
  agentNameEl.textContent = user.displayName || "好想租屋業務";

  setMsg("正在讀取業務資料…");

  try {
    // 讀取 Firestore users/{uid}
    const snap = await getDocs(
      query(
        collection(db, "users"),
        where("email", "==", user.email || "___NOEMAIL___")
      )
    );

    let data = null;
    snap.forEach((doc) => {
      data = doc.data();
    });

    // 如果用 email 找不到，就算了，用 basic 資料
    if (!data) {
      data = { role: "agent" };
    }
    currentUserDoc = data;

    const role = data.role || "agent";
    const city = data.city || "未設定";

    if (badgeRoleEl) badgeRoleEl.textContent = `角色：${role === "agent" ? "業務 / 代管專員" : role}`;
    if (badgeCityEl) badgeCityEl.textContent = `服務區域：${city}`;

    // 簡單檢查權限：不是 agent 或 admin 的就回會員中心
    if (role !== "agent" && role !== "admin") {
      setMsg("您的身份不是業務，將返回會員中心。");
      setTimeout(() => {
        window.location.href = "account.html";
      }, 1500);
      return;
    }

    setMsg("歡迎，" + (user.displayName || "業務") + "。");

    // 載入今日打卡、案件列表
    await Promise.all([
      loadTodayAttendance(user.uid),
      loadMyListings(user.uid),
    ]);
  } catch (err) {
    console.error("[agent] 讀取使用者資料錯誤", err);
    setMsg("讀取業務資料時發生錯誤：" + (err.message || ""));
  }
});

// 讀取今日打卡紀錄
async function loadTodayAttendance(agentId) {
  const todayStr = getTodayStr();

  const q = query(
    collection(db, "attendance"),
    where("agentId", "==", agentId),
    where("date", "==", todayStr),
    orderBy("createdAt", "asc")
  );

  const snap = await getDocs(q);

  attendanceListEl.innerHTML = "";

  if (snap.empty) {
    attendanceStatusEl.textContent = "今日尚未打卡。";
    return;
  }

  let firstTime = null;
  snap.forEach((docSnap) => {
    const d = docSnap.data();
    const ts = d.createdAt?.toDate ? d.createdAt.toDate() : new Date();
    const timeStr = formatTime(ts);
    if (!firstTime) firstTime = timeStr;

    const li = document.createElement("li");
    li.textContent = `${timeStr} - 上班打卡`;
    attendanceListEl.appendChild(li);
  });

  attendanceStatusEl.textContent = `今日已打卡，上班時間約為 ${firstTime}`;
}

// 上班打卡
if (btnCheckin) {
  btnCheckin.addEventListener("click", async () => {
    if (!currentUser) {
      window.location.href = "login.html";
      return;
    }

    try {
      const todayStr = getTodayStr();
      const now = new Date();
      setMsg("打卡中…");

      await addDoc(collection(db, "attendance"), {
        agentId: currentUser.uid,
        agentName: currentUser.displayName || "",
        date: todayStr,
        type: "checkIn",
        createdAt: serverTimestamp(),
        createdAtLocal: now.toISOString(), // 方便檢視
      });

      setMsg("打卡完成 ✔︎");
      await loadTodayAttendance(currentUser.uid);
    } catch (err) {
      console.error("[agent] 打卡失敗", err);
      setMsg("打卡失敗：" + (err.message || ""));
    }
  });
}

// 讀取我承辦的案件（listings.agentId == 我的 uid）
async function loadMyListings(agentId) {
  const q = query(
    collection(db, "listings"),
    where("agentId", "==", agentId),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  tableListingsBodyEl.innerHTML = "";

  if (snap.empty) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="4">目前尚未有你承辦的案件。</td>`;
    tableListingsBodyEl.appendChild(tr);
    return;
  }

  snap.forEach((docSnap) => {
    const d = docSnap.data();
    const tr = document.createElement("tr");

    const cityDistrict = (d.city || "") + (d.district ? " " + d.district : "");
    const rentText = d.monthlyRent
      ? d.monthlyRent.toLocaleString() + " 元"
      : "-";

    const status = d.status || "draft";
    let statusClass = "draft";
    if (status === "rented") statusClass = "rented";
    if (status === "published") statusClass = "published";

    tr.innerHTML = `
      <td>${d.title || "(未命名案件)"}</td>
      <td>${cityDistrict || "-"}</td>
      <td>${rentText}</td>
      <td><span class="tag-status ${statusClass}">${status}</span></td>
    `;

    tableListingsBodyEl.appendChild(tr);
  });
}

// 新增案件（房源）
if (formListing) {
  formListing.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!currentUser) {
      window.location.href = "login.html";
      return;
    }

    const title = listingTitleEl.value.trim();
    const city = listingCityEl.value;
    const district = listingDistrictEl.value.trim();
    const rent = Number(listingRentEl.value || "0");
    const landlordId = listingLandlordIdEl.value.trim();
    const status = listingStatusEl.value || "published";
    const note = listingNoteEl.value.trim();

    if (!title || !city) {
      alert("請至少填寫物件名稱與城市。");
      return;
    }

    try {
      setMsg("新增案件中…");

      await addDoc(collection(db, "listings"), {
        title,
        city,
        district,
        monthlyRent: rent,
        landlordId: landlordId || null,
        agentId: currentUser.uid,
        agentName: currentUser.displayName || "",
        status,
        note,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setMsg("案件已建立 ✔︎");
      formListing.reset();

      // 預設狀態恢復為刊登中
      listingStatusEl.value = "published";

      await loadMyListings(currentUser.uid);
    } catch (err) {
      console.error("[agent] 新增案件失敗", err);
      setMsg("新增案件失敗：" + (err.message || ""));
    }
  });
}

// 登出
if (btnLogout) {
  btnLogout.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "login.html";
    } catch (err) {
      console.error("[agent] 登出錯誤", err);
      alert("登出失敗：" + (err.message || ""));
    }
  });
}