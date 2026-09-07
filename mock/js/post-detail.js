(function () {
  const currentUser = requireLogin();
  if (!currentUser) return;

  renderHeader(currentUser);

  const params = new URLSearchParams(location.search);
  const postId = Number(params.get("post"));

  const targetEl = document.getElementById("post-detail-target");
  const commentList = document.getElementById("comment-list");
  const commentTemplate = document.getElementById("comment-card-template");

  document.getElementById("comment-form-avatar").src = currentUser.iconImageUrl;

  function renderTarget() {
    const db = loadDB();
    const post = db.posts.find((p) => p.id === postId);
    if (!post) {
      targetEl.innerHTML = '<div class="empty-state">投稿が見つかりませんでした。削除された可能性があります。</div>';
      document.getElementById("comment-form").hidden = true;
      commentList.innerHTML = "";
      return;
    }
    const author = findUserById(db, post.userId);
    const liked = isPostLikedBy(db, post.id, currentUser.id);

    targetEl.innerHTML = `
      <div class="card post-detail-target">
        <div class="post-card">
          <a href="profile.html?user=${author.id}"><img class="avatar" src="${author.iconImageUrl}" alt=""></a>
          <div class="post-card-body">
            <div class="post-meta">
              <a class="username" href="profile.html?user=${author.id}">${escapeHtml(author.username)}</a>
              <span class="time">${timeAgo(post.createdAt)}</span>
            </div>
            <div class="post-text">${escapeHtml(post.body)}</div>
            ${post.imageUrl ? `<img class="post-image" src="${post.imageUrl}">` : ""}
            <div class="post-actions">
              <button class="action-button ${liked ? "liked" : ""}" id="target-like-btn">${liked ? "♥" : "♡"} <span>${likeCountOfPost(db, post.id)}</span></button>
              ${post.userId === currentUser.id ? `
                <div class="post-manage">
                  <button class="link-button" id="target-edit-btn">編集</button>
                  <button class="link-button danger" id="target-delete-btn">削除</button>
                </div>` : ""}
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById("target-like-btn").addEventListener("click", () => {
      const db2 = loadDB();
      togglePostLike(db2, post.id, currentUser.id);
      saveDB(db2);
      renderTarget();
    });

    if (post.userId === currentUser.id) {
      document.getElementById("target-edit-btn").addEventListener("click", () => {
        const next = prompt("投稿を編集", post.body);
        if (next === null) return;
        const trimmed = next.trim();
        if (!trimmed) return;
        const db2 = loadDB();
        updatePost(db2, post.id, trimmed);
        saveDB(db2);
        renderTarget();
      });
      document.getElementById("target-delete-btn").addEventListener("click", () => {
        if (!confirm("この投稿を削除しますか？")) return;
        const db2 = loadDB();
        deletePost(db2, post.id);
        saveDB(db2);
        location.href = "timeline.html";
      });
    }
  }

  function renderComments() {
    const db = loadDB();
    const comments = commentsOfPost(db, postId);
    commentList.innerHTML = "";
    if (comments.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "まだコメントがありません。";
      commentList.appendChild(empty);
      return;
    }

    comments.forEach((comment) => {
      const author = findUserById(db, comment.userId);
      const node = commentTemplate.content.cloneNode(true);
      node.querySelector(".comment-card").dataset.commentId = comment.id;

      const avatarLink = node.querySelector(".comment-avatar-link");
      avatarLink.href = `profile.html?user=${author.id}`;
      node.querySelector(".comment-avatar").src = author.iconImageUrl;

      const usernameLink = node.querySelector(".comment-username-link");
      usernameLink.href = `profile.html?user=${author.id}`;
      usernameLink.textContent = author.username;

      node.querySelector(".time").textContent = timeAgo(comment.createdAt);
      node.querySelector(".comment-text").textContent = comment.body;

      const likeBtn = node.querySelector(".comment-like-btn");
      const liked = isCommentLikedBy(db, comment.id, currentUser.id);
      likeBtn.classList.toggle("liked", liked);
      likeBtn.firstChild.textContent = liked ? "♥ " : "♡ ";
      likeBtn.querySelector(".like-count").textContent = likeCountOfComment(db, comment.id);
      likeBtn.addEventListener("click", () => {
        const db2 = loadDB();
        toggleCommentLike(db2, comment.id, currentUser.id);
        saveDB(db2);
        renderComments();
      });

      if (comment.userId === currentUser.id) {
        const manage = node.querySelector(".post-manage");
        manage.hidden = false;
        manage.querySelector(".edit-btn").addEventListener("click", () => {
          const next = prompt("コメントを編集", comment.body);
          if (next === null) return;
          const trimmed = next.trim();
          if (!trimmed) return;
          const db2 = loadDB();
          updateComment(db2, comment.id, trimmed);
          saveDB(db2);
          renderComments();
        });
        manage.querySelector(".delete-btn").addEventListener("click", () => {
          if (!confirm("このコメントを削除しますか？")) return;
          const db2 = loadDB();
          deleteComment(db2, comment.id);
          saveDB(db2);
          renderComments();
          renderTarget();
        });
      }

      commentList.appendChild(node);
    });
  }

  document.getElementById("comment-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const textarea = document.getElementById("comment-body");
    const body = textarea.value.trim();
    if (!body) return;
    const db = loadDB();
    createComment(db, { postId, userId: currentUser.id, body });
    saveDB(db);
    textarea.value = "";
    renderComments();
    renderTarget();
  });

  renderTarget();
  renderComments();
})();
