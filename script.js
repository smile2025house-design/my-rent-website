// script.js
// 1. 底部導覽列 active 狀態（單純用 URL 判斷）
(function setActiveNav() {
  const path = window.location.pathname.split("/").pop() || "home.html";
  const links = document.querySelectorAll(".bottom-nav .nav-item");

  links.forEach(link => {
    const href = link.getAttribute("href");
    if (!href) return;
    if (href === path) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
})();

// 2. 角色登入入口（roles.html 會用到）
window.goToRole = function (role) {
  // 先跳到 login.html，登入後依身分導向對應後台
  const params = new URLSearchParams();
  params.set("role", role);
  window.location.href = "login.html?" + params.toString();
};