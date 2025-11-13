// home.js
import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const listWrap = document.getElementById("listWrap");

// 讀取房源
async function loadRooms() {
  const q = query(collection(db, "rooms"), orderBy("created", "desc"));
  const snap = await getDocs(q);

  let html = "";
  snap.forEach(doc => {
    const r = doc.data();

    html += `
      <div class="card">
        <img src="${r.imageUrl || "https://picsum.photos/600/400"}" />
        <div class="card-body">
          <div class="card-title">${r.title}</div>
          <div class="card-desc">${r.city}・${r.desc}</div>
          <div class="card-price">$${r.rent} / 月</div>
        </div>
      </div>
    `;
  });

  listWrap.innerHTML = html;
}

loadRooms();

// 搜尋（前端簡易版）
document.getElementById("searchBtn").onclick = () => {
  const key = document.getElementById("searchInput").value.trim();
  if (!key) return alert("請輸入關鍵字");

  alert("（示範用）搜尋功能即將推出： " + key);
};