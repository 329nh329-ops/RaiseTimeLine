/* ログイン・サインアップ・ログアウトの共通処理 */

function handleLoginForm() {
  const form = document.getElementById("login-form");
  const errorEl = document.getElementById("login-error");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const db = loadDB();
    const user = findUserByEmail(db, email);

    if (!user || user.passwordHash !== password) {
      errorEl.textContent = "メールアドレスまたはパスワードが正しくありません。";
      errorEl.hidden = false;
      return;
    }
    setCurrentUserId(user.id);
    location.href = "timeline.html";
  });
}

function handleSignupForm() {
  const form = document.getElementById("signup-form");
  const errorEl = document.getElementById("signup-error");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !email || !password) {
      errorEl.textContent = "すべての項目を入力してください。";
      errorEl.hidden = false;
      return;
    }

    const db = loadDB();
    if (findUserByEmail(db, email)) {
      errorEl.textContent = "このメールアドレスは既に登録されています。";
      errorEl.hidden = false;
      return;
    }

    createUser(db, { email, password, username });
    saveDB(db);
    location.href = "index.html?registered=1";
  });
}

function initLogoutButton() {
  const btn = document.getElementById("logout-button");
  if (!btn) return;
  btn.addEventListener("click", () => {
    clearCurrentUserId();
    location.href = "index.html";
  });
}

/* ヘッダーの自分のアイコン等、ログイン中ユーザーに応じた共通要素を描画する */
function renderHeader(currentUser) {
  const iconLink = document.getElementById("header-my-icon");
  if (iconLink && currentUser) {
    iconLink.href = `profile.html?user=${currentUser.id}`;
    const img = iconLink.querySelector("img");
    if (img) {
      img.src = currentUser.iconImageUrl;
      img.alt = currentUser.username;
    }
  }
  initLogoutButton();
}
