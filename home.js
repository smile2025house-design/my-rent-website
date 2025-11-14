// home.js
import { db } from "./firebase.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

    // 如果完全沒有資料，就直接結束（避免報錯）
    if (!all.length) {
      console.log("目前 Firestore 沒有 listings 資料");
      return;
    }

    // 這裡設定每個區塊希望顯示的「最多筆數」
    const groups = {
      new: pickItemsWithWrap(all, 0, 4),       // 本月 NEW 上架
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
    img: "./products/karasumi.png", // 或改成你的圖片網址
  },
  // 之後如果有其他廠商想上架，可以在這裡再加物件
  // {
  //   title: "XXX 聯名禮盒",
  //   desc: "限量聯名，好吃又好看。",
  //   location: "台北市・信義區",
  //   price: 980,
  //   img: "https://你的圖片網址",
  // },
];

function renderGifts() {
  const track = document.querySelector('.listing-track[data-section="gift"]');
  if (!track) return;
  track.innerHTML = "";

  giftItems.forEach((item) => {
    track.appendChild(createListingCard(item, "gift"));
  });
}

// 執行
loadListings();
renderGifts();