// home.js
import { db } from "./firebase.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 上排主功能 Tab 點擊行為（header 那一排）
function setupMainTabs() {
  const rentTab = document.getElementById("tab-rent");
  const buyTab = document.getElementById("tab-buy");
  const serviceTab = document.getElementById("tab-service");

  // 「好想租屋」：回到首頁
  if (rentTab) {
    rentTab.addEventListener("click", () => {
      window.location.href = "home.html";
    });
  }

  // 「好想置產」：導到 buy.html（房產指南）
  if (buyTab) {
    buyTab.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "buy.html";
    });
  }

  // 「委託代管」：導到 manage.html
  if (serviceTab) {
    serviceTab.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "manage.html";
    });
  }
}

/**
 * 把「頁面上所有寫著『好想置產』的按鈕 / 連結」
 * 統一改成：點了就去 buy.html
 *（避免舊的 alert / 開發中邏輯還殘留）
 */
function forceAllBuyLinksToBuyPage() {
  const candidates = document.querySelectorAll("a, button, div, span");

  candidates.forEach((el) => {
    const text = (el.textContent || "").trim();
    if (!text.includes("好想置產")) return;

    // 避免重複綁定，多加一個旗標
    if (el.dataset.buyBound === "1") return;
    el.dataset.buyBound = "1";

    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = "buy.html";
    });
  });
}

// 產生共用卡片
function createListingCard(item, sectionKey) {
  const card = document.createElement("article");
  card.className = "listing-card";

  let badgeText = "旅客精選";
  if (sectionKey === "new") badgeText = "本月新上架";
  if (sectionKey === "hot-rent") badgeText = "熱門精選";
  if (sectionKey === "hot-sale") badgeText = "投資熱區";
  if (sectionKey === "project") badgeText = "新建案推薦";
  if (sectionKey === "gift") badgeText = "合作好物";

  const unit = sectionKey === "gift" ? " / 盒" : " / 月";

  const location = item.location || "";
  const desc = item.desc || "";

  card.innerHTML = `
    <div class="listing-img-wrap">
      <img src="${item.img}" alt="${item.title || ""}" />
      <span class="badge">${badgeText}</span>
      <button class="wish-btn" type="button" aria-label="加入心願單">♡</button>
    </div>
    <div class="listing-body">
      <div class="listing-title">${item.title || ""}</div>
      <div class="listing-meta">${location}．${desc}</div>
      <div class="listing-price">
        $${Number(item.price || 0).toLocaleString()}
        <span>${unit}</span>
      </div>
    </div>
  `;

  return card;
}

/**
 * 從陣列 all 裡面「輪流」取出幾筆資料
 * - start: 起始偏移量
 * - count: 想要顯示幾筆
 * 總筆數不夠時，會用 % 取餘數作循環，不會出現空區塊
 */
function pickItemsWithWrap(all, start, count) {
  const result = [];
  if (!all.length) return result;

  const len = all.length;
  const realCount = Math.min(count, len); // 不要超過實際筆數

  for (let i = 0; i < realCount; i++) {
    const index = (start + i) % len;
    result.push(all[index]);
  }
  return result;
}

// 從 Firestore 載入房源，分配到四個區塊
async function loadListings() {
  try {
    const snap = await getDocs(collection(db, "listings"));
    const all = [];
    snap.forEach((doc) => {
      all.push({ id: doc.id, ...doc.data() });
    });

    if (!all.length) {
      console.log("目前 Firestore 沒有 listings 資料");
      return;
    }

    const groups = {
      new: pickItemsWithWrap(all, 0, 4),        // 本月 NEW 上架
      "hot-rent": pickItemsWithWrap(all, 2, 4), // 熱門精選房源
      "hot-sale": pickItemsWithWrap(all, 4, 4), // HOT 地產買賣
      project: pickItemsWithWrap(all, 6, 4),    // 新建案推薦
    };

    Object.entries(groups).forEach(([key, items]) => {
      const track = document.querySelector(
        `.listing-track[data-section="${key}"]`
      );
      if (!track) return;
      track.innerHTML = "";
      items.forEach((item) => {
        track.appendChild(createListingCard(item, key));
      });
    });

    console.log("Firestore listings 筆數：", all.length);
  } catch (err) {
    console.error("讀取 listings 失敗：", err);
  }
}

// 烏魚子／伴手禮區：先用固定資料
const giftItems = [
  {
    title: "烏魚號頂級烏魚子禮盒",
    desc: "節慶送禮首選，職人手工日曬熟成，冷凍真空包裝。",
    location: "高雄市・茄萣區",
    price: 1880,
    img: "./products/karasumi.png",
  },
];

// 渲染合作好物
function renderGifts() {
  const track = document.querySelector('.listing-track[data-section="gift"]');
  if (!track) return;
  track.innerHTML = "";

  giftItems.forEach((item) => {
    track.appendChild(createListingCard(item, "gift"));
  });
}

// ---- 執行入口 ----
// 執行
setupMainTabs();
loadListings();
renderGifts();