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

// 從 Firestore 載入房源，分配到四個區塊
async function loadListings() {
  try {
    const snap = await getDocs(collection(db, "listings"));
    const all = [];
    snap.forEach((doc) => {
      all.push({ id: doc.id, ...doc.data() });
    });

    // 這裡簡單用順序分配，你目前有 7 筆就會依照順序塞進去
    const groups = {
      new: [],
      "hot-rent": [],
      "hot-sale": [],
      project: [],
    };

    all.forEach((item, index) => {
      if (index < 4) {
        groups.new.push(item);
      } else if (index < 8) {
        groups["hot-rent"].push(item);
      } else if (index < 12) {
        groups["hot-sale"].push(item);
      } else {
        groups.project.push(item);
      }
    });

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
    desc: "節慶送禮首選，職人日曬熟成，冷凍真空包裝。",
    location: "屏東縣・東港鎮",
    price: 1880,
    img: "./karasumi.jpg", // 或改成你的圖片網址
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