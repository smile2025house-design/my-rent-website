// post.js － 我要出租頁面（表單 + 預覽 + 縣市 / 區選單）
// 目前只做前端顯示，尚未真的寫入 Firestore。

import "./firebase.js"; // 先載入 Firebase 設定，之後要用 Firestore 時就可以直接用

// ====== 台灣地區資料：縣市 -> 區 ======
// 先幫你把「六都」都列進來，其它縣市你之後可以照格式往下加。
const TAIWAN_AREAS = {
  "台北市": [
    "中正區","大同區","中山區","松山區","大安區","萬華區",
    "信義區","士林區","北投區","內湖區","南港區","文山區"
  ],
  "新北市": [
    "板橋區","新莊區","中和區","永和區","土城區","樹林區","三峽區",
    "鶯歌區","三重區","蘆洲區","五股區","泰山區","新店區","深坑區",
    "石碇區","坪林區","烏來區","八里區","淡水區","三芝區","石門區",
    "金山區","萬里區","汐止區","瑞芳區","貢寮區","雙溪區","平溪區"
  ],
  "桃園市": [
    "桃園區","中壢區","平鎮區","八德區","楊梅區","蘆竹區",
    "大溪區","龍潭區","龜山區","大園區","觀音區","新屋區","復興區"
  ],
  "台中市": [
    "中區","東區","南區","西區","北區","北屯區","西屯區","南屯區",
    "太平區","大里區","霧峰區","烏日區","豐原區","大雅區","潭子區",
    "大肚區","清水區","沙鹿區","梧棲區","神岡區","后里區","東勢區",
    "新社區","石岡區","外埔區","大安區","大甲區","和平區"
  ],
  "台南市": [
    "中西區","東區","南區","北區","安平區","安南區",
    "永康區","歸仁區","新化區","左鎮區","玉井區","楠西區","南化區",
    "仁德區","關廟區","龍崎區","官田區","麻豆區","佳里區","西港區",
    "七股區","將軍區","學甲區","北門區","新營區","後壁區","白河區",
    "東山區","六甲區","下營區","柳營區","鹽水區","善化區","大內區",
    "山上區","新市區","安定區"
  ],
  "高雄市": [
    "新興區","前金區","苓雅區","鹽埕區","鼓山區","旗津區","前鎮區","三民區",
    "楠梓區","小港區","左營區","仁武區","大社區","岡山區","路竹區","阿蓮區",
    "田寮區","燕巢區","橋頭區","梓官區","彌陀區","永安區","湖內區","鳳山區",
    "大寮區","林園區","鳥松區","大樹區","旗山區","美濃區","六龜區","內門區",
    "杉林區","甲仙區","桃源區","那瑪夏區","茂林區","茄萣區"
  ]
  // 之後如果你要加「基隆市、宜蘭縣、花蓮縣…」，
  // 就照上面的格式往下加即可。
};

// ====== 抓取表單與預覽元素 ======
const $ = (sel) => document.querySelector(sel);

const titleInput    = $("#title");
const citySelect    = $("#city");
const districtSelect= $("#district");
const typeSelect    = $("#type");
const rentInput     = $("#rent");
const descInput     = $("#desc");
const imageInput    = $("#image");
const submitBtn     = $("#submit");

// 預覽區
const previewTitle   = $("#preview-title");
const previewRegion  = $("#preview-region");
const previewType    = $("#preview-type");
const previewRent    = $("#preview-rent");
const previewImg     = $("#preview-img");

// ====== 初始化縣市 / 區選單 ======
function initCityOptions() {
  // 把 TAIWAN_AREAS 的 key（縣市名稱）依照字母排序後塞進 <select>
  const cities = Object.keys(TAIWAN_AREAS);
  cities.sort();

  for (const city of cities) {
    const opt = document.createElement("option");
    opt.value = city;
    opt.textContent = city;
    citySelect.appendChild(opt);
  }
}

function updateDistrictOptions() {
  const city = citySelect.value;
  districtSelect.innerHTML = ""; // 先清空

  if (!city || !TAIWAN_AREAS[city]) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "請先選縣市";
    districtSelect.appendChild(opt);
    return;
  }

  const first = document.createElement("option");
  first.value = "";
  first.textContent = "請選擇區 / 鄉 / 鎮";
  districtSelect.appendChild(first);

  for (const dist of TAIWAN_AREAS[city]) {
    const opt = document.createElement("option");
    opt.value = dist;
    opt.textContent = dist;
    districtSelect.appendChild(opt);
  }
}

// ====== 更新右側預覽卡片 ======
function updatePreview() {
  const title = titleInput.value.trim() || "還沒有標題，請先輸入物件名稱";
  const city  = citySelect.value;
  const dist  = districtSelect.value;
  const type  = typeSelect.value;
  const rent  = rentInput.value.trim();
  const desc  = descInput.value.trim();
  const img   = imageInput.value.trim();

  previewTitle.textContent = title;

  if (city && dist) {
    previewRegion.textContent = `${city} ${dist}`;
  } else if (city) {
    previewRegion.textContent = city;
  } else {
    previewRegion.textContent = "區域會顯示在這裡";
  }

  previewType.textContent = type ? type : "物件類型 / 特色";
  previewRent.textContent = rent ? `\$${Number(rent).toLocaleString()} / 月` : "請輸入租金";

  if (img) {
    previewImg.src = img;
  }
}

// ====== 綁定事件 ======
initCityOptions();
updateDistrictOptions();
updatePreview();

citySelect.addEventListener("change", () => {
  updateDistrictOptions();
  updatePreview();
});
districtSelect.addEventListener("change", updatePreview);
titleInput.addEventListener("input", updatePreview);
typeSelect.addEventListener("change", updatePreview);
rentInput.addEventListener("input", updatePreview);
descInput.addEventListener("input", updatePreview);
imageInput.addEventListener("input", updatePreview);

submitBtn.addEventListener("click", () => {
  alert("目前先做到『前端表單＋預覽』，\n之後我們再一起把資料真的存到 Firebase。");
});