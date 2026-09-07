(function () {
  const currentUser = requireLogin();
  if (!currentUser) return;

  const usernameInput = document.getElementById("username");
  const bioInput = document.getElementById("bio");
  const bioCount = document.getElementById("bio-count");
  const iconPreview = document.getElementById("icon-preview");
  const iconInput = document.getElementById("icon-input");
  const errorEl = document.getElementById("edit-error");

  let pendingIconDataUrl = currentUser.iconImageUrl;

  usernameInput.value = currentUser.username;
  bioInput.value = currentUser.bio || "";
  bioCount.textContent = bioInput.value.length;
  iconPreview.src = currentUser.iconImageUrl;

  bioInput.addEventListener("input", () => {
    bioCount.textContent = bioInput.value.length;
  });

  iconInput.addEventListener("change", () => {
    const file = iconInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      pendingIconDataUrl = reader.result;
      iconPreview.src = pendingIconDataUrl;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("profile-edit-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    if (!username) {
      errorEl.textContent = "ユーザー名を入力してください。";
      errorEl.hidden = false;
      return;
    }
    const db = loadDB();
    const user = findUserById(db, currentUser.id);
    user.username = username;
    user.bio = bioInput.value.trim();
    user.iconImageUrl = pendingIconDataUrl;
    saveDB(db);
    location.href = `profile.html?user=${user.id}`;
  });
})();
