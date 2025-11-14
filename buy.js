// buy.js — 置產指南資料內容

// 分類資料
const guides = {
  guide: [
    {
      title: "買房流程一次看懂",
      desc: "從看房、議價、簽約到交屋，每個環節都要注意什麼？帶你完整了解流程。"
    },
    {
      title: "首購族注意事項",
      desc: "收入評估、頭期款規劃、購屋補助與稅費一次整理給你。"
    }
  ],
  loan: [
    {
      title: "房貸怎麼申請？",
      desc: "一次看懂銀行評分、申貸文件與貸款種類比較。"
    },
    {
      title: "等額本息 vs 本金攤還",
      desc: "利息差異？怎麼選最省？用簡單例子讓你馬上懂。"
    }
  ],
  tax: [
    {
      title: "買房要付哪些稅？",
      desc: "契稅、印花稅、代書費、地政士費用全解析。"
    },
    {
      title: "房地合一2.0",
      desc: "持有期間稅率、適用對象與節稅注意事項。"
    }
  ],
  check: [
    {
      title: "看房 10 大檢查重點",
      desc: "採光、潮濕、漏水、格局、噪音、管線設備要如何檢查？"
    },
    {
      title: "實價登錄怎麼看？",
      desc: "比價、談價的重要工具，帶你看懂關鍵數字。"
    }
  ]
};

// ======= 渲染內容 =======

const contentArea = document.getElementById("contentArea");
const tabButtons = document.querySelectorAll(".tab-btn");

function renderCards(type) {
  contentArea.innerHTML = "";
  guides[type].forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
    `;
    contentArea.appendChild(card);
  });
}

// 預設載入第 1 類
renderCards("guide");

// Tab 切換
tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".tab-btn.active")?.classList.remove("active");
    btn.classList.add("active");
    const type = btn.dataset.tab;
    renderCards(type);
  });
});