// 讀取現有房源（如果 localStorage 有資料就讀取，否則使用預設）
let houses = JSON.parse(localStorage.getItem("houses")) || [
  { title: "台北市中山區雅房", price: 12000, img: "https://picsum.photos/400/300?random=1" },
  { title: "新北板橋套房", price: 15000, img: "https://picsum.photos/400/300?random=2" },
  { title: "高雄近捷運電梯大樓", price: 18000, img: "https://picsum.photos/400/300?random=3" }
];

const houseList = document.getElementById("house-list");

function renderHouses(list) {
  houseList.innerHTML = "";
  list.forEach(house => {
    const card = document.createElement("div");
    card.className = "house-card";
    card.innerHTML = `
      <img src="${house.img}" alt="${house.title}">
      <div class="house-info">
        <h3>${house.title}</h3>
        <p class="price">$${house.price}/月</p>
      </div>
    `;
    houseList.appendChild(card);
  });
}

// 初次載入
renderHouses(houses);

// 搜尋功能
document.getElementById("search").addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase();
  const filtered = houses.filter(h => h.title.toLowerCase().includes(keyword));
  renderHouses(filtered);
});

// 新增房源功能
document.getElementById("house-form").addEventListener("submit", (e) => {
  e.preventDefault(); // 不要整頁重整
  const title = document.getElementById("title").value.trim();
  const price = document.getElementById("price").value.trim();
  const img = document.getElementById("img").value.trim();

  if (!title || !price || !img) {
    alert("請完整填寫所有欄位");
    return;
  }

  const newHouse = { title, price: Number(price), img };
  houses.push(newHouse);

  // 存到瀏覽器（像小型資料庫）
  localStorage.setItem("houses", JSON.stringify(houses));

  // 重新渲染畫面
  renderHouses(houses);

  // 清空表單
  e.target.reset();
});