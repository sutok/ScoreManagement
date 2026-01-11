# 技術スタック - Firebase構成

## 推奨構成: Firebase + React

### 選定理由

1. **サーバーレス**: バックエンドAPI不要、インフラ管理不要
2. **高速な開発**: Firebase SDKで認証・データベース・ホスティングを一元管理
3. **自動スケーリング**: トラフィック増加に自動対応
4. **無料枠が充実**: 小規模〜中規模なら無料で運用可能
5. **リアルタイム同期**: Firestoreのリアルタイムデータ同期
6. **複数認証対応**: Google、Apple、Twitter、Microsoftを簡単に統合

---

## Firebase サービス構成

### Firebase Authentication

**バージョン**: Firebase JS SDK 10.7+

**Phase 1 - Google認証**:
- Google Sign-In
- Firebase UI for Web（オプション）

**Phase 4 - 複数プロバイダー**:
- Apple Sign-In
- Twitter (X) Sign-In
- Microsoft Sign-In

### Cloud Firestore

**データベースタイプ**: NoSQLドキュメントデータベース

**主要機能**:
- リアルタイム同期
- オフライン対応
- セキュリティルール
- 複合インデックス

### Firebase Hosting

**機能**:
- 自動HTTPS
- CDN配信
- カスタムドメイン対応
- 自動デプロイ（GitHub Actions連携可能）

### Cloud Functions（オプション）

**使用ケース**:
- スコア計算の検証
- データクリーンアップ
- 通知送信

---

## フロントエンド: React + TypeScript

### バージョン
- **Node.js**: 20 LTS
- **React**: 18.2+
- **TypeScript**: 5.0+
- **Vite**: 5.0+ （ビルドツール）

### 主要ライブラリ

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",

    "firebase": "^10.7.0",
    "react-firebase-hooks": "^5.1.1",

    "zustand": "^4.4.7",
    "@tanstack/react-query": "^5.17.0",
    "react-hook-form": "^7.49.3",
    "zod": "^3.22.4",

    "@mui/material": "^5.15.3",
    "@mui/icons-material": "^5.15.3",
    "date-fns": "^3.0.6"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "eslint": "^8.56.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

### ディレクトリ構成

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── main.tsx                 # エントリーポイント
│   ├── App.tsx                  # ルートコンポーネント
│   ├── firebase/
│   │   ├── config.ts            # Firebase設定
│   │   ├── auth.ts              # 認証関連ヘルパー
│   │   └── firestore.ts         # Firestore操作ヘルパー
│   ├── components/
│   │   ├── auth/
│   │   │   └── GoogleLoginButton.tsx
│   │   ├── game/
│   │   │   ├── GameForm.tsx
│   │   │   ├── FrameInput.tsx
│   │   │   └── ScoreBoard.tsx
│   │   └── common/
│   │       ├── Header.tsx
│   │       └── Loading.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── NewGamePage.tsx
│   │   ├── GameDetailPage.tsx
│   │   └── HistoryPage.tsx
│   ├── hooks/
│   │   ├── useAuth.ts           # Firebase Auth フック
│   │   ├── useFirestore.ts      # Firestore フック
│   │   └── useGame.ts
│   ├── types/
│   │   ├── user.ts
│   │   ├── game.ts
│   │   └── frame.ts
│   ├── utils/
│   │   ├── scoreCalculator.ts
│   │   └── constants.ts
│   └── styles/
│       └── theme.ts             # MUIテーマ
├── .env.local                   # 環境変数（gitignore）
├── .env.example                 # 環境変数サンプル
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 開発環境セットアップ

### 1. Firebase プロジェクト作成

```
1. Firebase Console (https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名: 「bowling-score-management」（任意）
4. Google Analytics: オプション（推奨: 有効）
5. プロジェクト作成完了
```

### 2. Firebase サービス有効化

#### Authentication
```
1. Firebase Console → Authentication
2. 「始める」をクリック
3. Sign-in method タブ
4. Google を有効化
5. プロジェクトのサポートメールを設定
6. 保存
```

#### Firestore
```
1. Firebase Console → Firestore Database
2. 「データベースを作成」
3. 本番モードで開始
4. ロケーション: asia-northeast1（東京）推奨
5. 有効化
```

#### Hosting
```
1. Firebase Console → Hosting
2. 「始める」をクリック
3. 手順に従ってセットアップ
```

### 3. Firebase CLI セットアップ

```bash
# Firebase CLI インストール
npm install -g firebase-tools

# Firebase ログイン
firebase login

# プロジェクトディレクトリで初期化
firebase init

# 選択するサービス:
# - Firestore
# - Hosting
# - (オプション) Functions

# プロジェクト選択:
# → 既存のプロジェクトを使用
# → bowling-score-management を選択

# Firestore設定:
# → firestore.rules: デフォルト
# → firestore.indexes.json: デフォルト

# Hosting設定:
# → public directory: frontend/dist
# → single-page app: Yes
# → GitHub自動デプロイ: No (後で設定可能)
```

### 4. React プロジェクト作成

```bash
# Vite + React + TypeScript プロジェクト作成
npm create vite@latest frontend -- --template react-ts

# ディレクトリ移動
cd frontend

# 依存関係インストール
npm install

# Firebase SDK インストール
npm install firebase react-firebase-hooks

# その他のライブラリ
npm install react-router-dom zustand @tanstack/react-query react-hook-form zod @mui/material @mui/icons-material date-fns
```

### 5. 環境変数設定

`frontend/.env.local` を作成:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**Firebase設定の取得方法**:
```
1. Firebase Console → プロジェクト設定（歯車アイコン）
2. 下にスクロール → アプリ → Webアプリを追加
3. アプリのニックネーム: 「bowling-score-web」
4. Firebase Hosting: チェック
5. 「アプリを登録」
6. 表示される firebaseConfig をコピー
```

### 6. 開発サーバー起動

```bash
# フロントエンド開発サーバー
cd frontend
npm run dev

# アクセス: http://localhost:5173
```

---

## ビルド・デプロイ

### ローカルビルド

```bash
cd frontend
npm run build
# dist/ ディレクトリにビルド成果物が生成
```

### Firebaseにデプロイ

```bash
# プロジェクトルートで実行
firebase deploy

# 特定のサービスのみ
firebase deploy --only hosting
firebase deploy --only firestore:rules
```

### 自動デプロイ（GitHub Actions）

`.github/workflows/firebase-deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: cd frontend && npm ci

      - name: Build
        run: cd frontend && npm run build

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

---

## 開発ツール推奨

### エディタ
- **VS Code** + 拡張機能:
  - ESLint
  - Prettier
  - Firebase Explorer
  - TypeScript Vue Plugin (Volar)
  - Tailwind CSS IntelliSense

### Firebase エミュレータ（開発時）

```bash
# エミュレータインストール
firebase init emulators

# エミュレータ起動
firebase emulators:start

# アクセス:
# - Firestore UI: http://localhost:4000
# - Auth UI: http://localhost:4000/auth
```

### デバッグツール
- **React DevTools** (ブラウザ拡張)
- **Firebase DevTools** (Firebaseコンソール)

---

## コスト見積もり

### Firebase 無料枠 (Spark Plan)

| サービス | 無料枠 | 想定使用量 (100ユーザー/日) |
|----------|--------|----------------------------|
| Authentication | 無制限 | 100 認証/日 ✅ |
| Firestore 読み取り | 50K/日 | ~10K/日 ✅ |
| Firestore 書き込み | 20K/日 | ~5K/日 ✅ |
| Firestore ストレージ | 1GB | ~100MB ✅ |
| Hosting転送 | 10GB/月 | ~1GB/月 ✅ |
| Functions呼び出し | 125K/月 | 使用しない場合0 ✅ |

**結論**: 無料枠で十分運用可能 💰

---

## Firebase vs 従来構成の比較

| 項目 | Firebase | FastAPI + PostgreSQL |
|------|----------|---------------------|
| バックエンド開発 | 不要 | 必要（数日） |
| インフラ管理 | 不要 | 必要 |
| 認証実装 | SDK提供 | 自前実装 |
| データベース | Firestore（NoSQL） | PostgreSQL（RDB） |
| リアルタイム | 標準対応 | 追加実装必要 |
| スケーリング | 自動 | 手動設定 |
| コスト（小規模） | 無料 | サーバー費用 |
| 開発スピード | ⚡超高速 | 🐢標準 |

**Firebase採用のメリット**: 開発期間を半分以下に短縮可能！
