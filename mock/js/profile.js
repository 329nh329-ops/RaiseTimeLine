(function () {
  const currentUser = requireLogin();
  if (!currentUser) return;

  renderHeader(currentUser);

  const params = new URLSearchParams(location.search);
  const profileUserId = Number(params.get("user")) || currentUser.id;
  const isOwnProfile = profileUserId === currentUser.id;

  const headerEl = document.getElementById("profile-header");
  const postList = document.getElementById("post-list");
  const template = document.getElementById("post-card-template");

  function renderProfileHeader() {
    const db = loadDB();
    const user = findUserById(db, profileUserId);
    if (!user) {
      headerEl.innerHTML = '<div class="empty-state">ユーザーが見つかりませんでした。</div>';
      return;
    }
    const following = isFollowing(db, currentUser.id, profileUserId);

    headerEl.innerHTML = `
      <div class="card profile-header">
        <div class="profile-header-top">
          <img class="avatar-large" src="${user.iconImageUrl}" alt="">
          ${isOwnProfile
            ? `<a href="profile-edit.html" class="btn-secondary">プロフィールを編集</a>`
            : `<button id="follow-btn" class="btn-secondary follow-button ${following ? "following" : ""}">${following ? "フォロー中" : "フォローする"}</button>`
          }
        </div>
        <div class="profile-username">${escapeHtml(user.username)}</div>
        ${user.bio ? `<p class="profile-bio">${escapeHtml(user.bio)}</p>` : ""}
        <div class="profile-stats">
          <a href="follow-list.html?user=${user.id}&type=following"><strong>${followingCountOf(db, user.id)}</strong> フォロー中</a>
          <a href="follow-list.html?user=${user.id}&type=followers"><strong>${followerCountOf(db, user.id)}</strong> フォロワー</a>
        </div>
      </div>
    `;

    if (!isOwnProfile) {
      document.getElementById("follow-btn").addEventListener("click", () => {
        const db2 = loadDB();
        toggleFollow(db2, currentUser.id, profileUserId);
        saveDB(db2);
        renderProfileHeader();
      });
    }
  }

  function renderPosts() {
    const db = loadDB();
    const posts = postsByUser(db, profileUserId);
    postList.innerHTML = "";

    if (posts.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "まだ投稿がありません。";
      postList.appendChild(empty);
      return;
    }

    posts.forEach((post) => {
      const author = findUserById(db, post.userId);
      const node = template.content.cloneNode(true);
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
        renderPosts();
      });

      node.querySelector(".comment-btn").addEventListener("click", () => {
        location.href = `post-detail.html?post=${post.id}`;
      });

      if (isOwnProfile) {
        const manage = node.querySelector(".post-manage");
        manage.hidden = false;
        manage.querySelector(".edit-btn").addEventListener("click", () => {
          const next = prompt("投稿を編集", post.body);
          if (next === null) return;
          const trimmed = next.trim();
          if (!trimmed) return;
          const db2 = loadDB();
          updatePost(db2, post.id, trimmed);
          saveDB(db2);
          renderPosts();
        });
        manage.querySelector(".delete-btn").addEventListener("click", () => {
          if (!confirm("この投稿を削除しますか？")) return;
          const db2 = loadDB();
          deletePost(db2, post.id);
          saveDB(db2);
          renderPosts();
        });
      }

      postList.appendChild(node);
    });
  }

  renderProfileHeader();
  renderPosts();
})();
