/*
 * RaiseTimeLine 静的プロトタイプ用のダミーデータ層。
 * サーバー・DBは存在しないため、localStorage をDB代わりに使い、
 * データベース設計.md のER図に準拠したオブジェクト構造をそのままJSONで保持する。
 * パスワードは平文比較であり、実運用のハッシュ化・セッション管理は行わない。
 */

const DB_KEY = "raiseTimeLineMockDB";
const SESSION_KEY = "raiseTimeLineMockCurrentUserId";

const ICONS = {
  1: "https://api.dicebear.com/7.x/thumbs/svg?seed=akane",
  2: "https://api.dicebear.com/7.x/thumbs/svg?seed=ryo",
  3: "https://api.dicebear.com/7.x/thumbs/svg?seed=misaki",
  4: "https://api.dicebear.com/7.x/thumbs/svg?seed=kenta",
};

function buildInitialData() {
  const now = Date.now();
  const minutesAgo = (m) => new Date(now - m * 60 * 1000).toISOString();

  return {
    nextIds: { user: 5, post: 9, comment: 6, likeOnPost: 1, likeOnComment: 1, follow: 1 },
    users: [
      {
        id: 1,
        email: "akane@example.com",
        passwordHash: "password",
        username: "akane",
        bio: "コーヒーとコードが好きです。",
        iconImageUrl: ICONS[1],
        createdAt: minutesAgo(60 * 24 * 10),
      },
      {
        id: 2,
        email: "ryo@example.com",
        passwordHash: "password",
        username: "ryo_dev",
        bio: "フロントエンドエンジニア。React多め。",
        iconImageUrl: ICONS[2],
        createdAt: minutesAgo(60 * 24 * 8),
      },
      {
        id: 3,
        email: "misaki@example.com",
        passwordHash: "password",
        username: "misaki",
        bio: "旅行と写真が趣味です📷",
        iconImageUrl: ICONS[3],
        createdAt: minutesAgo(60 * 24 * 5),
      },
      {
        id: 4,
        email: "kenta@example.com",
        passwordHash: "password",
        username: "kenta",
        bio: "",
        iconImageUrl: ICONS[4],
        createdAt: minutesAgo(60 * 24 * 2),
      },
    ],
    posts: [
      { id: 1, userId: 1, body: "RaiseTimeLineの開発始めました。まずは要件定義から。", imageUrl: null, createdAt: minutesAgo(300), updatedAt: minutesAgo(300) },
      { id: 2, userId: 2, body: "Reactの新しいフックを試してみている。便利。", imageUrl: null, createdAt: minutesAgo(240), updatedAt: minutesAgo(240) },
      { id: 3, userId: 3, body: "今日の空がきれいだった。", imageUrl: "https://picsum.photos/seed/sky/600/360", createdAt: minutesAgo(180), updatedAt: minutesAgo(180) },
      { id: 4, userId: 1, body: "画面設計が固まってきた。次はDB設計かな。", imageUrl: null, createdAt: minutesAgo(150), updatedAt: minutesAgo(150) },
      { id: 5, userId: 4, body: "初めての投稿です。よろしくお願いします！", imageUrl: null, createdAt: minutesAgo(120), updatedAt: minutesAgo(120) },
      { id: 6, userId: 2, body: "コーヒーブレイク☕", imageUrl: "https://picsum.photos/seed/coffee/600/360", createdAt: minutesAgo(90), updatedAt: minutesAgo(90) },
      { id: 7, userId: 3, body: "週末は旅行に行く予定。楽しみ。", imageUrl: null, createdAt: minutesAgo(45), updatedAt: minutesAgo(45) },
      { id: 8, userId: 1, body: "検索機能の仕様を詰めています。", imageUrl: null, createdAt: minutesAgo(10), updatedAt: minutesAgo(10) },
    ],
    comments: [
      { id: 1, postId: 1, userId: 2, body: "楽しみにしてます！", createdAt: minutesAgo(280), updatedAt: minutesAgo(280) },
      { id: 2, postId: 1, userId: 3, body: "応援してます〜", createdAt: minutesAgo(270), updatedAt: minutesAgo(270) },
      { id: 3, postId: 3, userId: 1, body: "きれいですね！", createdAt: minutesAgo(170), updatedAt: minutesAgo(170) },
      { id: 4, postId: 6, userId: 4, body: "美味しそう！", createdAt: minutesAgo(80), updatedAt: minutesAgo(80) },
      { id: 5, postId: 5, userId: 1, body: "ようこそRaiseTimeLineへ！", createdAt: minutesAgo(110), updatedAt: minutesAgo(110) },
    ],
    likesOnPosts: [
      { id: 1, postId: 1, userId: 3, createdAt: minutesAgo(280) },
      { id: 2, postId: 1, userId: 4, createdAt: minutesAgo(275) },
      { id: 3, postId: 3, userId: 1, createdAt: minutesAgo(170) },
      { id: 4, postId: 3, userId: 2, createdAt: minutesAgo(165) },
      { id: 5, postId: 6, userId: 1, createdAt: minutesAgo(85) },
    ],
    likesOnComments: [
      { id: 1, commentId: 1, userId: 1, createdAt: minutesAgo(270) },
    ],
    follows: [
      { id: 1, followerId: 1, followingId: 2, createdAt: minutesAgo(60 * 24 * 3) },
      { id: 2, followerId: 1, followingId: 3, createdAt: minutesAgo(60 * 24 * 2) },
      { id: 3, followerId: 2, followingId: 1, createdAt: minutesAgo(60 * 24 * 1) },
      { id: 4, followerId: 3, followingId: 1, createdAt: minutesAgo(60 * 12) },
      { id: 5, followerId: 4, followingId: 1, createdAt: minutesAgo(60 * 6) },
    ],
  };
}

function loadDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const initial = buildInitialData();
    localStorage.setItem(DB_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    const initial = buildInitialData();
    localStorage.setItem(DB_KEY, JSON.stringify(initial));
    return initial;
  }
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function resetDB() {
  localStorage.removeItem(DB_KEY);
  localStorage.removeItem(SESSION_KEY);
}

/* ---------- セッション（ログイン状態）---------- */

function getCurrentUserId() {
  const id = localStorage.getItem(SESSION_KEY);
  return id ? Number(id) : null;
}

function setCurrentUserId(id) {
  localStorage.setItem(SESSION_KEY, String(id));
}

function clearCurrentUserId() {
  localStorage.removeItem(SESSION_KEY);
}

function getCurrentUser() {
  const id = getCurrentUserId();
  if (!id) return null;
  const db = loadDB();
  return db.users.find((u) => u.id === id) || null;
}

/* 未ログインなら画面設計.md 11章の共通要素に従いログイン画面へリダイレクトする */
function requireLogin() {
  if (!getCurrentUserId()) {
    location.href = "index.html";
    return null;
  }
  return getCurrentUser();
}

/* ---------- ユーザー ---------- */

function findUserById(db, id) {
  return db.users.find((u) => u.id === id) || null;
}

function findUserByEmail(db, email) {
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

function createUser(db, { email, password, username }) {
  const user = {
    id: db.nextIds.user++,
    email,
    passwordHash: password,
    username,
    bio: "",
    iconImageUrl: `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(username)}`,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  return user;
}

/* ---------- フォロー ---------- */

function isFollowing(db, followerId, followingId) {
  return db.follows.some((f) => f.followerId === followerId && f.followingId === followingId);
}

function followingIdsOf(db, userId) {
  return db.follows.filter((f) => f.followerId === userId).map((f) => f.followingId);
}

function followerCountOf(db, userId) {
  return db.follows.filter((f) => f.followingId === userId).length;
}

function followingCountOf(db, userId) {
  return db.follows.filter((f) => f.followerId === userId).length;
}

function followingUsersOf(db, userId) {
  return followingIdsOf(db, userId)
    .map((id) => findUserById(db, id))
    .filter(Boolean);
}

function followerUsersOf(db, userId) {
  return db.follows
    .filter((f) => f.followingId === userId)
    .map((f) => findUserById(db, f.followerId))
    .filter(Boolean);
}

function toggleFollow(db, followerId, followingId) {
  if (followerId === followingId) return; // 自分自身のフォローは禁止（DB設計.md 補足）
  const existing = db.follows.find((f) => f.followerId === followerId && f.followingId === followingId);
  if (existing) {
    db.follows = db.follows.filter((f) => f !== existing);
  } else {
    db.follows.push({ id: db.nextIds.follow++, followerId, followingId, createdAt: new Date().toISOString() });
  }
}

/* ---------- 投稿 ---------- */

function postsSortedDesc(db, list) {
  return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function allPosts(db) {
  return postsSortedDesc(db, db.posts);
}

function followingPosts(db, userId) {
  const ids = new Set(followingIdsOf(db, userId));
  return postsSortedDesc(db, db.posts.filter((p) => ids.has(p.userId)));
}

function postsByUser(db, userId) {
  return postsSortedDesc(db, db.posts.filter((p) => p.userId === userId));
}

function createPost(db, { userId, body, imageUrl }) {
  const now = new Date().toISOString();
  const post = { id: db.nextIds.post++, userId, body, imageUrl: imageUrl || null, createdAt: now, updatedAt: now };
  db.posts.push(post);
  return post;
}

function updatePost(db, postId, body) {
  const post = db.posts.find((p) => p.id === postId);
  if (!post) return null;
  post.body = body;
  post.updatedAt = new Date().toISOString();
  return post;
}

function deletePost(db, postId) {
  db.posts = db.posts.filter((p) => p.id !== postId);
  // 投稿削除時、紐づくコメント・いいねもCASCADE削除する（データベース設計.md準拠）
  const commentIds = db.comments.filter((c) => c.postId === postId).map((c) => c.id);
  db.comments = db.comments.filter((c) => c.postId !== postId);
  db.likesOnPosts = db.likesOnPosts.filter((l) => l.postId !== postId);
  db.likesOnComments = db.likesOnComments.filter((l) => !commentIds.includes(l.commentId));
}

function likeCountOfPost(db, postId) {
  return db.likesOnPosts.filter((l) => l.postId === postId).length;
}

function isPostLikedBy(db, postId, userId) {
  return db.likesOnPosts.some((l) => l.postId === postId && l.userId === userId);
}

function togglePostLike(db, postId, userId) {
  const existing = db.likesOnPosts.find((l) => l.postId === postId && l.userId === userId);
  if (existing) {
    db.likesOnPosts = db.likesOnPosts.filter((l) => l !== existing);
  } else {
    db.likesOnPosts.push({ id: db.nextIds.likeOnPost++, postId, userId, createdAt: new Date().toISOString() });
  }
}

function commentCountOfPost(db, postId) {
  return db.comments.filter((c) => c.postId === postId).length;
}

/* ---------- コメント ---------- */

function commentsOfPost(db, postId) {
  return [...db.comments.filter((c) => c.postId === postId)].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );
}

function createComment(db, { postId, userId, body }) {
  const now = new Date().toISOString();
  const comment = { id: db.nextIds.comment++, postId, userId, body, createdAt: now, updatedAt: now };
  db.comments.push(comment);
  return comment;
}

function updateComment(db, commentId, body) {
  const comment = db.comments.find((c) => c.id === commentId);
  if (!comment) return null;
  comment.body = body;
  comment.updatedAt = new Date().toISOString();
  return comment;
}

function deleteComment(db, commentId) {
  db.comments = db.comments.filter((c) => c.id !== commentId);
  db.likesOnComments = db.likesOnComments.filter((l) => l.commentId !== commentId);
}

function likeCountOfComment(db, commentId) {
  return db.likesOnComments.filter((l) => l.commentId === commentId).length;
}

function isCommentLikedBy(db, commentId, userId) {
  return db.likesOnComments.some((l) => l.commentId === commentId && l.userId === userId);
}

function toggleCommentLike(db, commentId, userId) {
  const existing = db.likesOnComments.find((l) => l.commentId === commentId && l.userId === userId);
  if (existing) {
    db.likesOnComments = db.likesOnComments.filter((l) => l !== existing);
  } else {
    db.likesOnComments.push({ id: db.nextIds.likeOnComment++, commentId, userId, createdAt: new Date().toISOString() });
  }
}

/* ---------- 検索 ---------- */

function searchPosts(db, keyword) {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return [];
  return postsSortedDesc(db, db.posts.filter((p) => p.body.toLowerCase().includes(kw)));
}

function searchUsers(db, keyword) {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return [];
  return db.users.filter((u) => u.username.toLowerCase().includes(kw));
}

/* ---------- 表示ユーティリティ ---------- */

function timeAgo(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}時間前`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}日前`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
