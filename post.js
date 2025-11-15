// post.js
import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById("postForm");
const statusBox = document.getElementById("statusBox");

auth.onAuthStateChanged((user) => {
  if (!user) {
    alert("請先登入後再發佈內容！");
    window.location.href = "index.html";
    return;
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("title").value.trim();
      const content = document.getElementById("content").value.trim();

      if (!title || !content) {
        alert("請填寫完整內容");
        return;
      }

      try {
        await addDoc(collection(db, "posts"), {
          title,
          content,
          uid: user.uid,
          createdAt: serverTimestamp(),
        });

        statusBox.textContent = "✅ 已成功發佈！";
        form.reset();
      } catch (err) {
        console.error("發佈失敗：", err);
        statusBox.textContent = "❌ 發佈失敗，請稍後再試。";
      }
    });
  }
});