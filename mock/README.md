# RaiseTimeLine 静的プロトタイプ（Mock）

要件定義・機能一覧・画面設計ドキュメントに基づいた、HTML/CSS/JavaScriptのみで動作する静的プロトタイプ。実際のバックエンド・データベース・AWS S3は使用せず、ブラウザの`localStorage`をDB代わりに使ってダミーデータを保持する。

## 前提・制約

- 認証はメールアドレス・パスワードの平文比較のみで、実際のハッシュ化・セッション/JWT管理は行わない
- 画像投稿・アイコン画像は`FileReader`でBase64のdata URLとしてその場でプレビュー・保存するだけで、実際のS3アップロードは行わない
- 画面遷移は複数のHTMLファイル間の素朴なページ遷移（MPA）で構成しており、SPA的なルーティングは行わない
- あくまで見た目・操作感・機能網羅性の確認用であり、本実装の設計を制約するものではない

## 開き方

`mock/index.html` をブラウザで直接開くか、簡易HTTPサーバーで配信する。

```bash
cd mock
python3 -m http.server 8000
# http://localhost:8000 を開く
```

初回アクセス時にダミーユーザー・投稿・コメント・いいね・フォロー関係が自動的にセットされる。

テスト用ログイン情報: `akane@example.com` / `password`（他に `ryo@example.com` / `misaki@example.com` / `kenta@example.com`、パスワードは全員`password`）。

タイムライン画面下部の「モックデータをリセット」ボタンで、保存された`localStorage`のデータを初期状態に戻せる。

## 画面一覧

| ファイル | 画面 |
|---|---|
| index.html | ログイン |
| signup.html | サインアップ |
| timeline.html | タイムライン（全体／フォロー中） |
| post-detail.html | 投稿詳細（コメント一覧） |
| profile.html | プロフィール（`?user=<id>`で対象ユーザーを指定） |
| profile-edit.html | プロフィール編集 |
| search.html | 検索（投稿／ユーザー） |
