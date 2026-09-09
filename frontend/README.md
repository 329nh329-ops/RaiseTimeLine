# RaiseTimeLine フロントエンド

React + TypeScript + Vite + Tailwind CSSによるフロントエンド。現時点では認証フロー（サインアップ・ログイン・ログイン後の仮画面）のみを実装している。タイムライン等の本格的な画面は今後実装する。

## セットアップ

```bash
npm install
npm run dev
```

`http://localhost:5173` にアクセスする。`/api` へのリクエストは `vite.config.ts` の設定により `http://localhost:8080`（バックエンド）にプロキシされるため、事前にバックエンド（[backend/README省略、ルートのREADME.md参照]）とPostgreSQLを起動しておくこと。

## 画面

| パス | 画面 |
|---|---|
| `/login` | ログイン |
| `/signup` | サインアップ |
| `/welcome` | ログイン後の仮画面（認証確認用。今後タイムライン等に置き換え予定） |

未ログイン状態で `/welcome` にアクセスするとログイン画面にリダイレクトされる。

## 品質チェック

```bash
npm run lint    # oxlint
npm run build   # 型チェック（tsc）+ ビルド
```
