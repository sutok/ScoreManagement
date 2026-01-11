# Firebase アーキテクチャ設計

## 全体構成

```
┌─────────────────────┐
│  React Frontend     │
│  (Vite + TypeScript)│
└──────────┬──────────┘
           │ Firebase SDK
           │
┌──────────┴──────────────────────────────────┐
│           Firebase Services                  │
├──────────────────────────────────────────────┤
│  • Authentication (認証)                     │
│  • Cloud Firestore (データベース)            │
│  • Firebase Hosting (ホスティング)           │
│  • Cloud Functions (サーバーレス関数)        │
└──────────────────────────────────────────────┘
```

## Firebase サービス構成

### 1. Firebase Authentication

**対応プロバイダー**:
- **Phase 1**: Google認証
- **Phase 4**: Apple ID、Twitter、Microsoft

**認証フロー**:
```
1. ユーザーがログインボタンをクリック
2. Firebase Authentication UIでプロバイダー選択
3. プロバイダーで認証
4. Firebase IDトークン取得
5. アプリにログイン状態を保存
```

**ユーザー情報管理**:
- Firebase Auth の `displayName` を使用
- 追加情報は Firestore の `users` コレクションに保存

### 2. Cloud Firestore

**データベース構造** (NoSQLコレクション設計):

```
users (コレクション)
├── {userId} (ドキュメント)
    ├── displayName: string
    ├── email: string (nullable)
    ├── profileImageUrl: string (nullable)
    ├── createdAt: timestamp
    └── updatedAt: timestamp

games (コレクション)
├── {gameId} (ドキュメント)
    ├── userId: string (参照)
    ├── playedAt: timestamp
    ├── totalScore: number (0-300)
    ├── gameNumber: number
    ├── memo: string (nullable)
    ├── createdAt: timestamp
    ├── updatedAt: timestamp
    └── frames (サブコレクション)
        ├── {frameNumber} (ドキュメント)
            ├── frameNumber: number (1-10)
            ├── firstThrow: number (nullable)
            ├── secondThrow: number (nullable)
            ├── thirdThrow: number (nullable)
            ├── frameScore: number
            ├── cumulativeScore: number
            ├── isStrike: boolean
            └── isSpare: boolean
```

**Phase 2拡張**:
```
groups (コレクション)
├── {groupId} (ドキュメント)
    ├── name: string
    ├── description: string
    ├── createdBy: string (userId)
    ├── isPublic: boolean
    ├── createdAt: timestamp
    └── members (サブコレクション)
        ├── {userId} (ドキュメント)
            ├── role: string (owner/admin/member)
            └── joinedAt: timestamp
```

### 3. Firebase Hosting

**デプロイ構成**:
- React ビルド成果物を Firebase Hosting にデプロイ
- 自動HTTPS対応
- CDN配信
- カスタムドメイン対応可能

### 4. Cloud Functions (オプション)

**使用ケース**:
- スコア計算の検証
- 定期的なデータクリーンアップ
- プッシュ通知送信
- サーバーサイドバリデーション

## セキュリティルール

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ユーザー情報: 本人のみ読み書き可能
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // ゲーム: 本人のみ読み書き可能
    match /games/{gameId} {
      allow read: if request.auth != null &&
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null &&
                              resource.data.userId == request.auth.uid;

      // フレーム: 親ゲームの所有者のみアクセス可
      match /frames/{frameId} {
        allow read, write: if request.auth != null &&
                             get(/databases/$(database)/documents/games/$(gameId)).data.userId == request.auth.uid;
      }
    }

    // グループ (Phase 2)
    match /groups/{groupId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
                              resource.data.createdBy == request.auth.uid;

      // メンバー
      match /members/{userId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null &&
                       (request.auth.uid == userId ||
                        get(/databases/$(database)/documents/groups/$(groupId)).data.createdBy == request.auth.uid);
      }
    }
  }
}
```

## フロントエンド構成

### ディレクトリ構造

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── main.tsx                 # エントリーポイント
│   ├── App.tsx
│   ├── firebase/
│   │   ├── config.ts            # Firebase設定
│   │   ├── auth.ts              # 認証関連
│   │   └── firestore.ts         # Firestore操作
│   ├── components/
│   │   ├── auth/
│   │   │   └── GoogleLoginButton.tsx
│   │   ├── game/
│   │   │   ├── GameForm.tsx
│   │   │   ├── FrameInput.tsx
│   │   │   └── ScoreBoard.tsx
│   │   └── common/
│   │       └── Header.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── NewGamePage.tsx
│   │   └── HistoryPage.tsx
│   ├── hooks/
│   │   ├── useAuth.ts           # Firebase Auth フック
│   │   ├── useFirestore.ts      # Firestore フック
│   │   └── useGame.ts
│   ├── types/
│   │   ├── user.ts
│   │   ├── game.ts
│   │   └── frame.ts
│   └── utils/
│       └── scoreCalculator.ts
├── firebase.json                # Firebase設定
├── .firebaserc                  # プロジェクト設定
├── firestore.rules              # Firestoreルール
├── firestore.indexes.json       # Firestoreインデックス
└── package.json
```

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
  }
}
```

## 開発環境セットアップ

### 1. Firebase プロジェクト作成

```bash
# Firebase CLI インストール
npm install -g firebase-tools

# Firebase ログイン
firebase login

# プロジェクト初期化
firebase init

# 選択するサービス:
# - Firestore
# - Functions (オプション)
# - Hosting
# - Authentication
```

### 2. 環境変数設定

`.env.local`:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## デプロイ

```bash
# ビルド
npm run build

# Firebase にデプロイ
firebase deploy

# 特定のサービスのみ
firebase deploy --only hosting
firebase deploy --only firestore:rules
firebase deploy --only functions
```

## コスト見積もり (Firebase 無料枠)

**Spark Plan (無料)**:
- Authentication: 無制限
- Firestore: 1GB ストレージ、50K 読み取り/日、20K 書き込み/日
- Hosting: 10GB 転送/月
- Functions: 125K 呼び出し/月、40K GB秒/月

**想定使用量** (100ユーザー/日):
- Firestore 読み取り: ~10K/日 (余裕あり)
- Firestore 書き込み: ~5K/日 (余裕あり)
- Hosting: ~1GB/月 (余裕あり)

→ **無料枠で運用可能**

## Firebaseの利点

1. **サーバーレス**: バックエンド不要、インフラ管理不要
2. **リアルタイム**: Firestoreのリアルタイム同期
3. **スケーラブル**: 自動スケーリング
4. **セキュア**: Firebaseルールによる細かいアクセス制御
5. **認証統合**: 複数プロバイダーを簡単に統合
6. **低コスト**: 無料枠が充実
7. **高速開発**: SDKが充実、設定が簡単
