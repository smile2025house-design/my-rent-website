// orders.js
import { db } from "./firebase.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 依照狀態決定 Badge 的文字與顏色 class
function getStatusInfo(status) {
  const s = (status || "").toLowerCase();

  if (s === "confirmed" || s === "已確認") {
    return { label: "已確認", className: "status-confirmed" };
  }
  if (s === "cancelled" || s === "已取消") {
    return { label: "已取消", className: "status-cancelled" };
  }
  // 預設：待確認
  return { label: "待確認", className: "status-pending" };
}

// 產生一張預約卡片
function createAppointmentCard(appt) {
  const card = document.createElement("article");
  card.className = "order-card";

  const { label, className } = getStatusInfo(appt.status);

  const title =
    appt.listingTitle ||
    appt.listingName ||
    appt.listingId ||
    "帶看房源（待補房源名稱）";

  const dateText = appt.date || appt.visitDate || "-";
  const timeText = appt.timeSlot || appt.time || "-";
  const fee = typeof appt.fee === "number" ? appt.fee : 200;

  card.innerHTML = `
    <header class="order-card-header">
      <div class="order-title">${title}</div>
      <span class="status-badge ${className}">${label}</span>
    </header>
    <div class="order-card-body">
      <div class="order-row">
        <span class="label">日期</span>
        <span class="value">${dateText}</span>
      </div>
      <div class="order-row">
        <span class="label">時段</span>
        <span class="value">${timeText}</span>
      </div>
      <div class="order-row">
        <span class="label">帶看費用</span>
        <span class="value value-strong">NT$${fee}</span>
      </div>
    </div>
  `;

  return card;
}

// 從 Firestore 載入 appointments
async function loadAppointments() {
  const listEl = document.getElementById("appointmentsList");
  const emptyEl = document.getElementById("appointmentsEmpty");
  if (!listEl) return;

  listEl.innerHTML = "";
  if (emptyEl) emptyEl.style.display = "none";

  try {
    const snap = await getDocs(collection(db, "appointments"));
    const items = [];

    snap.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });

    // 可以在這裡依日期排序（字串格式為 YYYY-MM-DD 時會很直覺）
    items.sort((a, b) => {
      const da = (a.date || "").localeCompare(b.date || "");
      if (da !== 0) return da;
      return (a.timeSlot || "").localeCompare(b.timeSlot || "");
    });

    if (items.length === 0) {
      if (emptyEl) emptyEl.style.display = "block";
      return;
    }

    items.forEach((appt) => {
      const card = createAppointmentCard(appt);
      listEl.appendChild(card);
    });
  } catch (err) {
    console.error("讀取 appointments 失敗：", err);
    if (emptyEl) {
      emptyEl.textContent = "載入預約資料時發生錯誤，請稍後再試。";
      emptyEl.style.display = "block";
    }
  }
}

// 之後如果要加入「取消預約」、「重新安排時間」可以在這裡加事件監聽器

loadAppointments();