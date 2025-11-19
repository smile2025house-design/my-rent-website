// account.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  GoogleAuthProvider,
  OAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ 和其他檔案同一組 firebaseConfig
const firebaseConfig = {
  apiKey: "AIzaSyDap-cGTy0IKomhHbVQKB3Y-JLZk1pK42w",
  authDomain: "smilehouse-a68bc.firebaseapp.com",
  projectId: "smilehouse-a68bc",
  storageBucket: "smilehouse-a68bc.appspot.com",
  messagingSenderId: "542151591313",
  appId: "1:542151591313:web:e10b10e0b5a083fe75c630",
  measurementId: "G-0Q5LFE84ER"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

const $ = (id) => document.getElementById(id);

const emailPanel   = $("email-panel");
const btnEmailTgl  = $("btn-email-toggle");
const btnEmailClose = $("btn-email-close");
const emailEl      = $("email");
const pwdEl        = $("password");

const btnEmailLogin    = $("btn-email-login");
const btnEmailRegister = $("btn-email-register");

const btnApple   = $("btn-apple");
const btnGoogle  = $("btn-google");
const btnLine    = $("btn-line");
const btnGuest   = $("btn-guest");

const btnPhonePlaceholder = $("btn-phone-placeholder");

// ---------- 共用：登入後要做的事 ----------
async function afterLogin(user) {
  if (!user) return;

  const uid = user.uid;
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // 第一次登入：建立基本 user 資料
    await setDoc(ref, {
      displayName: user.displayName || "",
      email: user.email || "",
      createdAt: serverTimestamp(),
      provider: (user.providerData[0] && user.providerData[0].providerId) || "unknown",
    }, { merge: true });

    // 導向填寫基本資料
    window.location.href = "profile.html";
  } else {
    // 已有資料 → 直接到個人簡介首頁
    window.location.href = "me.html"; // 依照你實際檔名調整
  }
}

// 若已登入，直接導去 me.html
onAuthStateChanged(auth, (user) => {
  if (user) {
    afterLogin(user);
  }
});

// ---------- 手機號碼目前只當樣式，提醒用戶 ----------
btnPhonePlaceholder.addEventListener("click", () => {
  alert("目前先使用 Email / Apple / Google / LINE / 訪客登入，之後我們再加上手機號碼登入。");
});

// ---------- Email 面板顯示 / 隱藏 ----------
btnEmailTgl.addEventListener("click", () => {
  emailPanel.style.display = "block";
});
btnEmailClose.addEventListener("click", () => {
  emailPanel.style.display = "none";
});

// ---------- Email 登入 ----------
btnEmailLogin.addEventListener("click", async () => {
  const email = (emailEl.value || "").trim();
  const pwd   = (pwdEl.value || "").trim();
  if (!email || !pwd) {
    alert("請輸入 Email 與密碼");
    return;
  }
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pwd);
    await afterLogin(cred.user);
  } catch (err) {
    console.error("[email login] error", err);
    alert("Email 登入失敗：" + (err.message || ""));
  }
});

// ---------- Email 註冊 ----------
btnEmailRegister.addEventListener("click", async () => {
  const email = (emailEl.value || "").trim();
  const pwd   = (pwdEl.value || "").trim();
  if (!email || !pwd) {
    alert("請輸入 Email 與密碼");
    return;
  }
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pwd);
    await afterLogin(cred.user);
  } catch (err) {
    console.error("[email register] error", err);
    alert("Email 註冊失敗：" + (err.message || ""));
  }
});

// ---------- Google 登入 ----------
btnGoogle.addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    await afterLogin(cred.user);
  } catch (err) {
    console.error("[google] error", err);
    alert("Google 登入失敗：" + (err.message || ""));
  }
});

// ---------- Apple 登入（需先在 Firebase Console 開啟 Apple provider） ----------
btnApple.addEventListener("click", async () => {
  try {
    const provider = new OAuthProvider("apple.com");
    const cred = await signInWithPopup(auth, provider);
    await afterLogin(cred.user);
  } catch (err) {
    console.error("[apple] error", err);
    alert("Apple 登入失敗：" + (err.message || ""));
  }
});

// ---------- LINE 登入（使用 OIDC，自訂 providerId：oidc.line） ----------
btnLine.addEventListener("click", async () => {
  try {
    const provider = new OAuthProvider("oidc.line");
    const cred = await signInWithPopup(auth, provider);
    await afterLogin(cred.user);
  } catch (err) {
    console.error("[line] error", err);
    alert("LINE 登入失敗：" +
      "請先在 Firebase Authentication → Sign-in method → 新增 OIDC Provider（Provider ID 設為 oidc.line）再試一次。\n錯誤訊息：" +
      (err.message || ""));
  }
});

// ---------- 訪客登入 ----------
btnGuest.addEventListener("click", async () => {
  try {
    const cred = await signInAnonymously(auth);
    await afterLogin(cred.user);
  } catch (err) {
    console.error("[guest] error", err);
    alert("訪客登入失敗：" + (err.message || ""));
  }
});