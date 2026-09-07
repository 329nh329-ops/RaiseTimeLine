(function () {
  const currentUser = requireLogin();
  if (!currentUser) return;

  renderHeader(currentUser);

  document.getElementById("post-form-avatar").src = currentUser.iconImageUrl;

  let activeTab = "all";
  let pendingImageDataUrl = null;

  const postList = document.getElementById("post-list");
  const template = document.getElementById("post-card-template");

  function renderPosts() {
    const db = loadDB();
    const posts = activeTab === "all" ? allPosts(db) : followingPosts(db, currentUser.id);

    postList.innerHTML = "";
    if (posts.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent =
        activeTab === "all" ? "まだ投稿がありません。" : "フォロー中のユーザーの投稿がありません。気になるユーザーをフォローしてみましょう。";
      postList.appendChild(empty);
      return;
    }

    posts.forEach((post) => {
      const author = findUserById(db, post.userId);
      const node = template.content.cloneNode(true);
      const card = node.querySelector(".post-card");
      card.dataset.postId = post.id;

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

      if (post.userId === currentUser.id) {
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

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeTab = tab.dataset.tab;
      renderPosts();
    });
  });

  const bodyInput = document.getElementById("post-body");
  const charCount = document.getElementById("post-char-count");
  bodyInput.addEventListener("input", () => {
    charCount.textContent = bodyInput.value.length;
  });

  const imageInput = document.getElementById("post-image-input");
  const imagePreview = document.getElementById("post-image-preview");
  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      pendingImageDataUrl = reader.result;
      imagePreview.src = pendingImageDataUrl;
      imagePreview.hidden = false;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("post-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const body = bodyInput.value.trim();
    if (!body) return;
    const db = loadDB();
    createPost(db, { userId: currentUser.id, body, imageUrl: pendingImageDataUrl });
    saveDB(db);

    bodyInput.value = "";
    charCount.textContent = "0";
    pendingImageDataUrl = null;
    imagePreview.hidden = true;
    imagePreview.src = "";
    imageInput.value = "";

    renderPosts();
  });

  document.getElementById("reset-mock-data").addEventListener("click", () => {
    if (!confirm("モックデータを初期状態にリセットします。よろしいですか？")) return;
    resetDB();
    location.href = "index.html";
  });

  renderPosts();
})();
