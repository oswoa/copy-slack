# Copy Slack

## 概要

本 WEB アプリはポートフォリオ用に作成された Slack の簡易コピーです。<br />
Next.js と Node.js (Socket.io) で構築されており、次の特徴を備えています。

### 主な技術的特徴

- **リアルタイム通信**: Socket.io によるリアルタイムメッセージング
- **S3 互換ストレージ**: MinIO によるプロフィール画像のオブジェクトストレージ対応（ローカルストレージへの切り替えも可）
- **型安全性**: TypeScript + Zod バリデーション
- **セキュアな認証**: bcrypt + httpOnly Cookie
- **コンポーネント駆動開発**: MUI を利用した UI 開発
- **自動テスト**: Vitest でテスト対応

## 今後の学習・改善方向

本プロジェクトは以下の機能追加・改善を想定しています：

- **スレッド機能**: Slack のようなメッセージスレッド機能
- **ファイル送信機能**: メッセージへのファイル添付・共有機能
- **検索機能**: メッセージの全文検索
- **通知機能**: リアルタイム通知の実装

## 機能比較表

| 大分類                 | 中分類         | 機能               | Copy Slack | Slack |
| :--------------------- | :------------- | :----------------- | :--------: | :---: |
| **ユーザ管理**         | 認証           | ユーザー認証       |     ✅     |  ✅   |
|                        |                | プロフィール管理   |     ✅     |  ✅   |
|                        |                | プロフィール画像   |     ✅     |  ✅   |
| **ワークスペース管理** | ワークスペース | ワークスペース作成 |     ✅     |  ✅   |
|                        |                | ワークスペース削除 |     ✅     |  ✅   |
|                        |                | ユーザー招待       |     ✅     |  ✅   |
|                        | チャネル       | チャネル作成       |     ✅     |  ✅   |
|                        |                | チャネル削除       |     ✅     |  ✅   |
| **ユーザ通信**         | メッセージ     | メッセージ送受信   |     ✅     |  ✅   |
|                        |                | メッセージ編集     |     ✅     |  ✅   |
|                        |                | メッセージ削除     |     ✅     |  ✅   |
|                        |                | リアルタイム更新   |     ✅     |  ✅   |
|                        |                | スレッド機能       |     ❌     |  ✅   |
|                        |                | DM 送受信          |     ❌     |  ✅   |
|                        |                | ファイル送信       |     ❌     |  ✅   |
| **その他**             | 拡張機能       | 通知機能           |     ❌     |  ✅   |
|                        |                | 検索機能           |     ❌     |  ✅   |

## 技術要素

| 大分類             | 中分類              | 項目                       | 内容                                        |
| :----------------- | :------------------ | :------------------------- | :------------------------------------------ |
| **フロントエンド** | コア技術            | 言語/フレームワーク        | Next.js 16.2.1 (React 19.2.3)               |
|                    |                     | UI フレームワーク          | Material-UI (MUI) 7.3.9                     |
|                    | 状態管理・フォーム  | 状態管理                   | React Context API                           |
|                    |                     | フォーム管理               | React Hook Form 7.72.0                      |
|                    |                     | バリデーション             | Zod 4.3.6                                   |
|                    | 認証                | 認証方式                   | Cookie ベース (httpOnly)                    |
|                    | 通信                | リアルタイム通信           | Socket.io-client 4.8.3                      |
|                    | テスト              | テストフレームワーク       | Vitest 4.1.2                                |
|                    |                     | ブラウザテスト             | Playwright 1.58.2                           |
|                    |                     | テスト用ライブラリ         | Testing Library (React 16.3.2)              |
|                    |                     | テスト用ユーティリティ     | Jest DOM 6.9.1, @testing-library/dom 10.4.1 |
|                    |                     | API モック                 | MSW (Mock Service Worker) 2.12.14           |
|                    |                     | UI コンポーネント カタログ | Storybook 10.3.3 + Addon (a11y, Vitest)     |
|                    | リント              | コード規約                 | ESLint 9 + ESLint Config Next 16.1.1        |
| **バックエンド**   | コア技術            | ランタイム                 | Node.js (Turbopack サポート版)              |
|                    |                     | フレームワーク             | Next.js API Routes 16.2.1                   |
|                    |                     | リアルタイム通信エンジン   | Socket.io 4.8.3                             |
|                    | DB                  | ORM                        | Prisma 6.19.2                               |
|                    |                     | データベース               | SQLite (sqlite3 6.0.1)                      |
|                    | ストレージ          | S3 クライアント            | @aws-sdk/client-s3 3.x                      |
|                    |                     | オブジェクトストレージ     | MinIO (S3 互換)                             |
|                    | 認証・セキュリティ  | パスワード暗号化           | bcrypt 6.0.0                                |
|                    | ID 生成アルゴリズム | UUID v7 (uuidv7 1.2.1)     |
| **開発環境**       | スクリプト          | 並列実行管理               | npm-run-all 4.1.5, cross-env 10.1.0         |
|                    |                     | 型チェック                 | TypeScript 5.9.3                            |
|                    | パスマッピング      | Vite パスマッピング        | vite-tsconfig-paths 6.1.1                   |

## 主要な API エンドポイント

| カテゴリ           | メソッド | エンドポイント                    | 説明                               |
| :----------------- | :------- | :-------------------------------- | :--------------------------------- |
| **認証**           | `POST`   | `/api/login`                      | ログイン                           |
|                    | `POST`   | `/api/logout`                     | ログアウト                         |
|                    | `POST`   | `/api/signup`                     | 新規ユーザー登録                   |
| **ユーザー**       | `GET`    | `/api/users`                      | ユーザー検索                       |
|                    | `GET`    | `/api/users/[userId]`             | ユーザー情報取得                   |
|                    | `PATCH`  | `/api/users/[userId]/profile`     | プロフィール更新・画像アップロード |
| **ワークスペース** | `GET`    | `/api/workspaces`                 | ワークスペース一覧取得             |
|                    | `GET`    | `/api/workspaces/[workspaceId]`   | ワークスペース詳細取得             |
|                    | `POST`   | `/api/workspaces`                 | ワークスペース新規作成             |
|                    | `POST`   | `/api/workspaces/[wsId]/[userId]` | ユーザー招待                       |
|                    | `PUT`    | `/api/workspaces/[workspaceId]`   | ワークスペース名編集               |
|                    | `DELETE` | `/api/workspaces/[workspaceId]`   | ワークスペース削除                 |
| **チャネル**       | `GET`    | `/api/channels`                   | チャネル一覧取得                   |
|                    | `GET`    | `/api/channels/[channelId]`       | チャネル詳細取得                   |
|                    | `POST`   | `/api/channels`                   | チャネル新規作成                   |
|                    | `PUT`    | `/api/channels/[channelId]`       | チャネル名編集                     |
|                    | `DELETE` | `/api/channels/[channelId]`       | チャネル削除                       |
| **メッセージ**     | `GET`    | `/api/posts`                      | 投稿履歴取得                       |
|                    | `POST`   | `/api/posts`                      | 新規投稿（Socket.io と併用）       |
|                    | `PUT`    | `/api/posts/[postId]`             | 投稿内容編集                       |
|                    | `DELETE` | `/api/posts/[postId]`             | 投稿削除                           |

## テーブル定義

`prisma/tables.pu`で ER 図（PlantUML）を確認できます。

## 起動方法

### 前提条件

- **Node.js**: 18 以上
- **Docker / Docker Compose**: MinIO を使う場合（`STORAGE_TYPE=s3`）

### 環境変数

`.env.example` をコピーして `.env` を作成し、必要に応じて編集してください。

```bash
cp .env.example .env
```

| 変数名                    | 説明                                                            | デフォルト値            |
| :------------------------ | :-------------------------------------------------------------- | :---------------------- |
| `NEXT_PUBLIC_PORT`        | Next.js サーバのポート                                          | `3000`                  |
| `NEXT_PUBLIC_SOCKET_PORT` | Socket.io サーバのポート                                        | `3001`                  |
| `STORAGE_TYPE`            | 画像保存先（`local` または `s3`）                               | `local`                 |
| `DATABASE_URL`            | SQLite ファイルパス（`STORAGE_TYPE=local` 時）                  | `file:./dev.db`         |
| `AWS_REGION`              | AWS リージョン（`STORAGE_TYPE=s3` 時）                          | `ap-northeast-1`        |
| `AWS_ACCESS_KEY_ID`       | AWS アクセスキー（MinIO の場合は `MINIO_ROOT_USER`）            | `minioadmin`            |
| `AWS_SECRET_ACCESS_KEY`   | AWS シークレットキー（MinIO の場合は `MINIO_ROOT_PASSWORD`）    | `minioadmin`            |
| `S3_ENDPOINT`             | S3 エンドポイント URL（MinIO の場合は `http://localhost:9000`） | `http://localhost:9000` |
| `S3_BUCKET_NAME`          | S3 バケット名                                                   | `copy-slack-images`     |

### MinIO 起動（`STORAGE_TYPE=s3` の場合のみ）

```bash
docker compose up -d
```

MinIO コンソール (`http://localhost:9001`) でバケットの状態を確認できます。

### インストール

```bash
npm install
```

### 開発・運用コマンド

| 用途                     | コマンド            | 備考                                             |
| :----------------------- | :------------------ | :----------------------------------------------- |
| **開発モード起動**       | `npm run dev`       | Next.js(3000) / Socket.io(3001) 同時起動         |
| **ビルド**               | `npm run build`     | 本番用ビルドの生成                               |
| **本番モード起動**       | `npm start`         | 本番ビルド(3000) / Socket.io(3001) 同時起動      |
| **Storybook 起動**       | `npm run storybook` | コンポーネントカタログ表示 (6006)                |
| **テスト実行**           | `npm run test`      | Vitest によるテスト実行                          |
| **DB 管理 (Studio)**     | `npm run studio`    | ブラウザで DB の中身を確認                       |
| **DB リセット・反映**    | `npm run push`      | スキーマの強制反映（**データは初期化されます**） |
| **コード整形・チェック** | `npm run lint`      | ESLint による静的解析                            |

## 使い方

### 1. ログイン

デフォルトで下記ユーザが登録されています

- サンプルユーザ 1: `user1 / password`
- サンプルユーザ 2: `user2 / password`

1. 登録済みのユーザ ID とパスワードを入力してログイン
2. 自動的に所属するワークスペースに遷移する

### 2. ユーザー登録

1. `http://localhost:3000/login` にアクセス
2. **「こちら」** をクリックして登録画面へ
3. ユーザ ID、メールアドレス、パスワードを入力
    - メールアドレスを実際に使う訳ではないため、ダミーで構いません
4. 登録ボタンをクリック
5. ユーザに紐づくワークスペースが作成され、自動的に遷移します

### 3. ワークスペース操作

複数のワークスペースを作成し、それぞれで異なるメンバーと通信できます。

- **左側サイドバー**: ワークスペース一覧
    - ワークスペースアイコンをクリックで切り替え
    - `＋` アイコンで新規ワークスペース作成
    - `⋯` メニューで詳細操作

### 4. チャネル操作

ワークスペース内で、複数のチャネルを作成し、トピック別に管理できます。

- **チャネルリスト**: 現在のワークスペースに属するチャネル
    - `＋` アイコンでチャネル作成
    - チャネル名をクリックで選択
    - `⋯` メニューで編集/削除

### 5. メッセージ送受信

チャネル内で、リアルタイムにメッセージを送受信できます。

- チャネルを選択するとメッセージ一覧が表示
- 下部の入力欄にメッセージを入力して送信
- 送信されたメッセージは、リアルタイムで全ユーザーに表示される
- メッセージは編集・削除も可能

### 6. ユーザー招待

1. チャネルリスト下部の `ユーザを招待する` ボタンをクリック
2. 招待するユーザー名を検索
3. ユーザー選択して招待確定
4. ユーザーがワークスペースに追加される

### 7. プロフィール管理

1. 左側サイドバー下部のユーザーアイコンをクリック
2. プロフィールダイアログで以下が可能：
    - プロフィール画像をアップロード
    - 表示名を変更
    - メールアドレスを変更
    - ログアウト

## ディレクトリ構造

```
.
├── prisma/
│   ├── schema.prisma      # DB スキーマ（Prisma）
│   ├── tables.pu          # ER図（PlantUML）
│   ├── migrations/        # DB マイグレーション履歴
│   └── dev.db             # SQLite データベースファイル
├── src/
│   ├── app/
│   │   ├── api/           # API Routes（Next.js）
│   │   ├── (auth)/        # 認証が必要なページ
│   │   ├── (public)/      # 公開ページ（ログイン、登録）
│   │   ├── common/        # 共通コンポーネント・ユーティリティ
│   │   ├── constants/     # 定数（エラーコード、メッセージ等）
│   │   ├── context/       # React Context
│   │   ├── error/         # エラーページ
│   │   ├── lib/           # 初期化処理等
│   │   └── layout.tsx     # ルートレイアウト
│   ├── infrastructures/   # データベース（Prisma等）との接続・操作の実装
│   │   └── storage/       # ストレージ実装（ローカル / S3）
│   ├── model/             # アプリケーション内で扱うデータ表現（エンティティ）の定義
│   ├── repositories/      # データの取得・保存（永続化）の抽象化
│   ├── services/          # アプリケーション固有のビジネスロジック・ユースケースの実装
│   ├── stories/           # Storybook コンポーネント
│   ├── tests/             # テストファイル
│   └── proxy.ts           # プロキシ設定
├── compose.yml            # Docker Compose（MinIO）
├── minio-init.sh          # MinIO バケット初期化スクリプト
├── eslint.config.mjs      # ESLint 設定
├── next.config.ts         # Next.js 設定
├── package.json           # プロジェクト設定・依存関係
├── prisma.config.ts       # Prisma 設定ファイル
├── README.md              # このファイル
├── socket-server.ts       # Socket.io サーバー
├── tsconfig.json          # TypeScript 設定
├── vitest.config.ts       # Vitest 設定
└── vitest.setup.ts        # Vitest セットアップ
```
