// home.js
import { db } from "./firebase.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/** 將價格轉成加上逗號的字串 */
function formatPrice(num) {
  if (typeof num !== "number") return num || "";
  return num.toLocaleString("zh-TW");
}

/** 建立一張房源卡片 DOM */
function createCard(item, badgeText = "旅客精選") {
  const card = document.createElement("article");
  card.className = "listing-card";

  const locationText = item.location || "地點未填寫";
  const descText = item.desc || "";

  card.innerHTML = `
    <div class="listing-img-wrap">
      <img src="${item.img || "https://picsum.photos/seed/house/800/500"}" alt="${item.title || "出租房源"}" />
      <span class="badge">${badgeText}</span>
      <button class="wish-btn" type="button">🤍</button>
    </div>
    <div class="listing-body">
      <div class="listing-title">${item.title || "未命名房源"}</div>
      <div class="listing-meta">${locationText}・${descText}</div>
      <div class="listing-price">$${formatPrice(item.price)} <span>/ 月</span></div>
    </div>
  `;
  return card;
}

/** 把資料渲染到某一個區塊 */
function renderSection(sectionKey, items, badgeText) {
  const container = document.querySelector(
    `.listing-track[data-section="${sectionKey}"]`
  );
  if (!container) return;

  container.innerHTML = "";
  items.forEach((item) => {
    const card = createCard(item, badgeText);
    container.appendChild(card);
  });
}

/** 主要載入流程 */
async function loadListings() {
  try {
    const snap = await getDocs(collection(db, "listings"));
    const all = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Firestore listings 筆數：", all.length);

    if (!all.length) return;

    // 這裡先簡單用「分段切片」方式分配到四個區塊
    const newList = all.slice(0, 4);
    const hotRent = all.slice(2, 6);
    const hotSale = all.slice(4, 8);
    const projects = all.slice(6, 10);

    renderSection("new", newList, "本月新上架");
    renderSection("hot-rent", hotRent, "熱門精選");
    renderSection("hot-sale", hotSale, "投資熱區");
    renderSection("project", projects, "新建案推薦");
  } catch (err) {
    console.error("讀取 listings 失敗：", err);
  }
}

/** 簡單處理上排 tab 狀態（目前只做樣式） */
function setupTabs() {
  const tabs = $$(".main-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      // 之後如果要切換不同內容，可以在這裡接功能
    });
  });
}

/** 定位按鈕（沿用你之前的概念，先簡單顯示提示文字） */
function setupLocationButton() {
  const btnLocate = $("#btn-locate");
  const note = $("#searchNote");
  if (!btnLocate || !note) return;

  btnLocate.addEventListener("click", () => {
    note.textContent = "定位功能尚在規劃中，目前先為你顯示全台灣房源。";
  });
}

/** 初始化 */
setupTabs();
setupLocationButton();
loadListings();