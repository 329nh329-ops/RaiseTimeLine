(function () {
  const currentUser = requireLogin();
  if (!currentUser) return;

  renderHeader(currentUser);

  const params = new URLSearchParams(location.search);
  const targetUserId = Number(params.get("user")) || currentUser.id;
  let activeType = params.get("type") === "followers" ? "followers" : "following";

  document.getElementById("back-link").href = `profile.html?user=${targetUserId}`;

  const listEl = document.getElementById("user-list");
  const titleEl = document.getElementById("page-title");

  function render() {
    const db = loadDB();
    const targetUser = findUserById(db, targetUserId);
    if (!targetUser) {
      listEl.innerHTML = '<div class="empty-state">ユーザーが見つかりませんでした。</div>';
      return;
    }

    document.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.type === activeType);
    });
    titleEl.textContent = `${targetUser.username}さんの${activeType === "following" ? "フォロー中" : "フォロワー"}`;

    const users = activeType === "following" ? followingUsersOf(db, targetUserId) : followerUsersOf(db, targetUserId);

    listEl.innerHTML = "";
    if (users.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = activeType === "following" ? "まだ誰もフォローしていません。" : "まだフォロワーがいません。";
      listEl.appendChild(empty);
      return;
    }

    users.forEach((user) => {
      const row = document.createElement("a");
      row.className = "search-user-row";
      row.href = `profile.html?user=${user.id}`;
      row.innerHTML = `
        <img class="avatar" src="${user.iconImageUrl}" alt="">
        <div>
          <div class="username">${escapeHtml(user.username)}</div>
          <div class="bio">${escapeHtml(user.bio || "")}</div>
        </div>
      `;
      listEl.appendChild(row);
    });
  }

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      activeType = tab.dataset.type;
      const url = new URL(location.href);
      url.searchParams.set("type", activeType);
      history.replaceState(null, "", url);
      render();
    });
  });

  render();
})();
