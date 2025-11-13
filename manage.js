// manage.js — 專業代管：把房東填單資料寫進 Firestore「management_requests」

import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $ = (sel) => document.querySelector(sel);

const nameEl        = $("#ownerName");
const phoneEl       = $("#contactPhone");
const emailEl       = $("#contactEmail");
const cityEl        = $("#areaCity");
const distEl        = $("#areaDistrict");
const addrEl        = $("#fullAddress");
const typeEl        = $("#houseType");
const rentEl        = $("#expectRent");
const needPhotoEl   = $("#needPhoto");
const needManageEl  = $("#needFullManage");
const noteEl        = $("#extraNote");
const submitBtn     = $("#submitManage");
const msgBox        = $("#msgBox");

/** 顯示提示訊息 */
function showMsg(text, isOk = true) {
  if (!msgBox) return;
  msgBox.textContent = text;
  msgBox.style.display = "block";
  msgBox.className = "msg " + (isOk ? "ok" : "err");
}

/** 簡單欄位檢查 */
function validate() {
  if (!nameEl.value.trim())  return "請填寫您的姓名";
  if (!phoneEl.value.trim()) return "請填寫聯絡電話";
  if (!cityEl.value.trim())  return "請填寫縣市";
  if (!addrEl.value.trim())  return "請填寫至少大概路段";
  return "";
}

/** 按下送出代管需求 */
if (submitBtn) {
  submitBtn.addEventListener("click", async () => {
    const err = validate();
    if (err) {
      showMsg(err, false);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "送出中…";

    try {
      const user = auth.currentUser;
      const payload = {
        ownerName:      nameEl.value.trim(),
        contactPhone:   phoneEl.value.trim(),
        contactEmail:   emailEl.value.trim() || null,
        city:           cityEl.value.trim(),
        district:       distEl.value.trim() || null,
        fullAddress:    addrEl.value.trim(),
        houseType:      typeEl.value || null,
        expectRent:     rentEl.value.trim() || null,
        needPhoto:      needPhotoEl.value || "未選擇",
        needManage:     needManageEl.value || "未選擇",
        extraNote:      noteEl.value.trim() || null,
        fromUserId:     user ? user.uid : null,
        fromUserEmail:  user ? (user.email || null) : null,
        status:         "新建立",    // 之後你可以在後台改為：已聯繫 / 進行中 / 結案
        createdAt:      serverTimestamp()
      };

      await addDoc(collection(db, "management_requests"), payload);

      showMsg("已成功送出代管需求，我們會盡快與你聯繫。");
      // 清空表單
      nameEl.value = "";
      phoneEl.value = "";
      emailEl.value = "";
      cityEl.value = "";
      distEl.value = "";
      addrEl.value = "";
      typeEl.value = "";
      rentEl.value = "";
      needPhotoEl.value = "未選擇";
      needManageEl.value = "未選擇";
      noteEl.value = "";

    } catch (e) {
      console.error("新增代管需求失敗", e);
      showMsg("送出失敗，請稍後再試或改用 LINE / 電話聯繫。", false);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "送出代管需求";
    }
  });
}