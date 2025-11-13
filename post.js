// post.js – 「我要出租」頁面的即時預覽

// 簡單的金額格式化：15000 -> 15,000
const formatPrice = (numStr) => {
  if (!numStr) return "";
  const n = Number(numStr);
  if (!Number.isFinite(n) || n <= 0) return "";
  return n.toLocaleString("zh-TW");
};

const $ = (sel) => document.querySelector(sel);

const bindPreview = () => {
  const form = $("#post-form");
  if (!form) return; // 保險：如果不在 post.html 就不要跑

  const titleInput = $("#title");
  const areaSelect = $("#area");
  const typeSelect = $("#type");
  const priceInput = $("#price");
  const descInput = $("#desc");
  const imgUrlInput = $("#imgUrl");

  const previewEmpty = $("#preview-empty");
  const previewBlock = $("#preview-block");

  const previewTitle = $("#preview-title");
  const previewMeta = $("#preview-meta");
  const previewPrice = $("#preview-price");
  const previewDesc = $("#preview-desc");
  const previewImg = $("#preview-img");
  const tagArea = $("#tag-area");
  const tagType = $("#tag-type");

  const updatePreview = () => {
    const title = titleInput.value.trim();
    const area = areaSelect.value.trim();
    const type = typeSelect.value.trim();
    const priceRaw = priceInput.value.trim();
    const desc = descInput.value.trim();
    const imgUrl = imgUrlInput.value.trim();

    const hasMainInfo = title || priceRaw || area || type || desc || imgUrl;

    // 沒填任何東西 → 顯示空狀態
    if (!hasMainInfo) {
      previewEmpty.classList.remove("hidden");
      previewBlock.classList.add("hidden");
      return;
    }

    previewEmpty.classList.add("hidden");
    previewBlock.classList.remove("hidden");

    // 標題
    previewTitle.textContent = title || "還沒有標題，可以想一個吸引人的名稱";

    // 上方小字
    let metaParts = [];
    if (area) metaParts.push(area);
    if (type) metaParts.push(type);
    previewMeta.textContent = metaParts.length
      ? metaParts.join("・")
      : "尚未選擇區域與類型";

    // 價格
    const formatted = formatPrice(priceRaw);
    previewPrice.textContent = formatted ? `$${formatted} / 月` : "請輸入租金";

    // 描述
    previewDesc.textContent =
      desc ||
      "這裡會顯示物件的亮點描述，例如：鄰近捷運、採光好、可養寵物、附家具⋯⋯";

    // Tag
    tagArea.textContent = area || "尚未選區域";
    tagType.textContent = type || "尚未選類型";

    // 圖片
    if (imgUrl) {
      previewImg.src = imgUrl;
    } else {
      previewImg.src = "https://picsum.photos/id/1016/800/450";
    }
  };

  // 綁定即時更新
  [titleInput, areaSelect, typeSelect, priceInput, descInput, imgUrlInput].forEach(
    (el) => {
      if (!el) return;
      el.addEventListener("input", updatePreview);
      el.addEventListener("change", updatePreview);
    }
  );

  // 表單送出暫時只顯示提示
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    updatePreview();
    alert("目前先完成前端預覽，之後我們再一起接上 Firebase 真的把資料存起來。");
  });

  // 初始跑一次
  updatePreview();
};

document.addEventListener("DOMContentLoaded", bindPreview);