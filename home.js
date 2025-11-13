// home.js
import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const listingList = document.querySelector("#listing-list");
const citySelect = document.querySelector("#citySelect");
const keywordInput = document.querySelector("#keywordInput");
const locateBtn = document.querySelector("#btn-locate");
const searchBtn = document.querySelector("#btn-search");
const note = document.querySelector("#searchNote");

let allListings = []; // 先全部抓下來，之後在前端做篩選

// 把 Firestore 的房源載入進來
async function loadListings() {
  if (!listingList) return;

  try {
    const q = query(collection(db, "listings"), orderBy("price", "asc"));
    const snap = await getDocs(q);

    console.log("Firestore listings 筆數：", snap.size);

    allListings = [];
    snap.forEach((doc) => {
      allListings.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    if (!allListings.length) {
      listingList.innerHTML =
        '<p class="empty-note">目前尚無房源，歡迎成為第一個上架的屋主。</p>';
      return;
    }

    renderListings(allListings);
  } catch (err) {
    console.error("讀取 listings 失敗：", err);
    listingList.innerHTML =
      '<p class="empty-note">載入房源時發生錯誤，請稍後再試。</p>';
  }
}

// 依照目前條件，把卡片畫出來
function renderListings(list) {
  if (!listingList) return;

  if (!list.length) {
    listingList.innerHTML =
      '<p class="empty-note">沒有符合條件的房源，請放寬搜尋條件試試看。</p>';
    return;
  }

  listingList.innerHTML = "";

  list.forEach((item) => {
    const priceNum =
      typeof item.price === "number" ? item.price : Number(item.price || 0);
    const priceText = priceNum
      ? priceNum.toLocaleString("zh-TW")
      : String(item.price || "");

    const card = document.createElement("article");
    card.className = "listing-card";
    card.innerHTML = `
      <div class="listing-img-wrap">
        <img src="${item.img}" alt="${item.title || "出租房源"}" />
        <div class="badge">旅客精選</div>
        <button class="fav-btn" type="button">♡</button>
      </div>
      <div class="listing-body">
        <h3>${item.title || "未命名房源"}</h3>
        <div class="meta">
          ${item.location || "未填寫地點"} · ${item.desc || ""}
        </div>
        <div class="price">
          <strong>$${priceText}</strong> / 月
        </div>
      </div>
    `;
    listingList.appendChild(card);
  });
}

// 依照城市 + 關鍵字做前端篩選
function applyFilter() {
  let filtered = [...allListings];

  const city = citySelect?.value || "";
  const keyword = (keywordInput?.value || "").trim();

  if (city && city !== "全台灣") {
    filtered = filtered.filter((x) => (x.location || "").includes(city));
  }

  if (keyword) {
    const k = keyword.toLowerCase();
    filtered = filtered.filter((x) => {
      const text =
        `${x.title || ""} ${x.desc || ""} ${x.location || ""}`.toLowerCase();
      return text.includes(k);
    });
  }

  renderListings(filtered);
}

// 監聽下拉與輸入框
citySelect?.addEventListener("change", applyFilter);
keywordInput?.addEventListener("input", () => {
  // 打字時不要太吵，就單純篩選
  applyFilter();
});
searchBtn?.addEventListener("click", applyFilter);

// 使用我的位置（這裡維持原本簡化版，只是更新提示文字）
locateBtn?.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("此瀏覽器不支援定位功能");
    return;
  }
  note.textContent = "正在為你取得附近房源…";
  navigator.geolocation.getCurrentPosition(
    () => {
      note.textContent = "已根據你的所在位置顯示附近房源（目前示意用，尚未串接真實地圖）。";
    },
    () => {
      note.textContent = "目前無法取得定位，你仍然可以手動選擇城市與關鍵字搜尋。";
    }
  );
});

// 初始化
loadListings();