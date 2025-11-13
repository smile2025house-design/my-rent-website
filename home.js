// home.js －－ 首頁搜尋 / 定位邏輯（不動登入）

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const citySelect   = $("#search-city");
const keywordInput = $("#search-keyword");
const note         = $("#search-note");
const btnLocation  = $("#btn-location");
const btnSearch    = $("#btn-search");

/** 簡單的卡片篩選：依城市＋關鍵字 */
function filterCards() {
  const city = citySelect.value.trim();
  const kw   = keywordInput.value.trim().toLowerCase();

  $$(".card").forEach(card => {
    const cardCity  = card.dataset.city || "";
    const cardTitle = (card.dataset.title || "").toLowerCase();
    const matchCity = !city || cardCity.includes(city);
    const matchKw   = !kw || cardTitle.includes(kw);

    card.style.display = (matchCity && matchKw) ? "block" : "none";
  });
}

/** 點擊搜尋按鈕 */
if (btnSearch) {
  btnSearch.addEventListener("click", () => {
    filterCards();
  });
}

/** 用目前位置推測城市，並套用篩選 */
if (btnLocation) {
  btnLocation.addEventListener("click", () => {
    if (!navigator.geolocation) {
      note.textContent = "這個裝置不支援定位功能。";
      return;
    }

    note.textContent = "正在取得你的位置…";

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      try {
        // 簡單用 OpenStreetMap 的反向地理編碼（不用 API Key）
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2&accept-language=zh-TW`;
        const res = await fetch(url, {
          headers: {
            "User-Agent": "my-rent-website-2025-demo" // 避免被擋
          }
        });
        const data = await res.json();
        const addr = data.address || {};

        // 盡量從 address 裡找出「縣市名稱」
        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.county ||
          "";

        if (city) {
          citySelect.value = city.includes("台北") ? "台北市"
                            : city.includes("新北") ? "新北市"
                            : city.includes("台南") ? "台南市"
                            : "";
          note.textContent = `已為你定位：${city} 附近。`;
        } else {
          note.textContent = "已取得座標，但無法判斷城市，顯示全部房源。";
          citySelect.value = "";
        }

        filterCards();
      } catch (err) {
        console.error("定位解析失敗", err);
        note.textContent = "定位成功，但解析地址時發生錯誤。";
      }
    }, (err) => {
      console.error("定位失敗", err);
      if (err.code === 1) {
        note.textContent = "你拒絕了定位權限，可手動選擇城市。";
      } else {
        note.textContent = "目前無法取得定位，可手動選擇城市。";
      }
    }, {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 600000
    });
  });
}

// 也可以讓使用者改變縣市時自動篩選
if (citySelect) {
  citySelect.addEventListener("change", filterCards);
}