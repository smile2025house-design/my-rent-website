// buy.js
// 控制「好想置產」頁面的主功能切換行為

function setupMainTabs() {
  const rentTab = document.getElementById("tab-rent");
  const buyTab = document.getElementById("tab-buy");
  const serviceTab = document.getElementById("tab-service");

  // 好想租屋：回到首頁
  if (rentTab) {
    rentTab.addEventListener("click", () => {
      window.location.href = "home.html";
    });
  }

  // 好想置產：目前就在本頁，點擊時只做錨點滾動
  if (buyTab) {
    buyTab.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 委託代管：導向 manage.html
  if (serviceTab) {
    serviceTab.addEventListener("click", () => {
      window.location.href = "manage.html";
    });
  }
}

// 立即執行
setupMainTabs();