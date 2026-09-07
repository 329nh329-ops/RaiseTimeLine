(function () {
  const currentUser = requireLogin();
  if (!currentUser) return;

  renderHeader(currentUser);

  const resultList = document.getElementById("result-list");
  const postTemplate = document.getElementById("post-card-template");
  const searchInput = document.getElementById("search-input");

  let activeTab = "posts";
  let keyword = "";

  function renderPostResults() {
    const db = loadDB();
    const posts = searchPosts(db, keyword);
    resultList.innerHTML = "";

    if (!keyword) {
      resultList.innerHTML = '<div class="empty-state">キーワードを入力して検索してください。</div>';
      return;
    }
    if (posts.length === 0) {
      resultList.innerHTML = '<div class="empty-state">該当する投稿が見つかりませんでした。</div>';
      return;
    }

    posts.forEach((post) => {
      const author = findUserById(db, post.userId);
      const node = postTemplate.content.cloneNode(true);
      node.querySelector(".post-card").dataset.postId = post.id;

      const avatarLink = node.querySelector(".post-avatar-link");
      avatarLink.href = `profile.html?user=${author.id}`;
      node.querySelector(".post-avatar").src = author.iconImageUrl;

      const usernameLink = node.querySelector(".post-username-link");
      usernameLink.href = `profile.html?user=${author.id}`;
      usernameLink.textContent = author.username;

      node.querySelector(".time").textContent = timeAgo(post.createdAt);
      const textEl = node.querySelector(".post-text");
      textEl.innerHTML = "";
      const link = document.createElement("a");
      link.className = "post-link";
      link.href = `post-detail.html?post=${post.id}`;
      link.textContent = post.body;
      textEl.appendChild(link);

      if (post.imageUrl) {
        const img = node.querySelector(".post-image");
        img.src = post.imageUrl;
        img.hidden = false;
      }

      node.querySelector(".comment-count").textContent = commentCountOfPost(db, post.id);
      const likeBtn = node.querySelector(".like-btn");
      const liked = isPostLikedBy(db, post.id, currentUser.id);
      likeBtn.classList.toggle("liked", liked);
      likeBtn.querySelector(".like-count").textContent = likeCountOfPost(db, post.id);
      likeBtn.firstChild.textContent = liked ? "♥ " : "♡ ";
      likeBtn.addEventListener("click", () => {
        const db2 = loadDB();
        togglePostLike(db2, post.id, currentUser.id);
        saveDB(db2);
        renderPostResults();
      });
      node.querySelector(".comment-btn").addEventListener("click", () => {
        location.href = `post-detail.html?post=${post.id}`;
      });

      resultList.appendChild(node);
    });
  }

  function renderUserResults() {
    const db = loadDB();
    const users = searchUsers(db, keyword);
    resultList.innerHTML = "";

    if (!keyword) {
      resultList.innerHTML = '<div class="empty-state">キーワードを入力して検索してください。</div>';
      return;
    }
    if (users.length === 0) {
      resultList.innerHTML = '<div class="empty-state">該当するユーザーが見つかりませんでした。</div>';
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
      resultList.appendChild(row);
    });
  }

  function render() {
    if (activeTab === "posts") renderPostResults();
    else renderUserResults();
  }

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeTab = tab.dataset.tab;
      render();
    });
  });

  document.getElementById("search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    keyword = searchInput.value;
    render();
  });

  render();
})();
