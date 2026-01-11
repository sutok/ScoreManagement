# 次のステップ：Firebase実装フェーズ

設計フェーズが完了しました。以下のFirebase実装順序を推奨します。

## Phase 1: Firebase プロジェクト初期化

### 1.1 Firebase プロジェクト作成

**Firebase Console での作業**:
```
1. Firebase Console (https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名: 「bowling-score-management」（任意）
4. Google Analytics: 有効（推奨）
5. プロジェクト作成完了を待つ
```

### 1.2 Firebase CLI セットアップ

```bash
# Firebase CLI インストール
npm install -g firebase-tools

# Firebase ログイン
firebase login

# プロジェクトディレクトリで初期化
firebase init

# 選択するサービス:
# [x] Firestore
# [x] Hosting
# [ ] Functions（オプション、後で追加可能）

# プロジェクト選択:
# → 既存のプロジェクトを使用
# → bowling-score-management を選択

# Firestore設定:
# → firestore.rules: デフォルトのまま
# → firestore.indexes.json: デフォルトのまま

# Hosting設定:
# → public directory: frontend/dist
# → single-page app: Yes
# → GitHub自動デプロイ: No (後で設定)
```

### 1.3 React プロジェクト作成

```bash
# Vite + React + TypeScript プロジェクト作成
npm create vite@latest frontend -- --template react-ts

# ディレクトリ移動
cd frontend

# 依存関係インストール
npm install

# Firebase SDK インストール
npm install firebase react-firebase-hooks

# その他の必要なライブラリ
npm install react-router-dom zustand @tanstack/react-query react-hook-form zod
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled date-fns

# 開発依存関係
npm install -D @types/node
```

---

## Phase 2: Firebase サービス有効化

### 2.1 Firebase Authentication 設定

**Firebase Console での作業**:
```
1. Firebase Console → Authentication
2. 「始める」をクリック
3. 「Sign-in method」タブを選択
4. 「Google」を有効化:
   - プロジェクトのサポートメールを設定
   - 「保存」をクリック
```

### 2.2 Cloud Firestore 設定

**Firebase Console での作業**:
```
1. Firebase Console → Firestore Database
2. 「データベースを作成」をクリック
3. セキュリティルール:
   - 「本番モードで開始」を選択
4. ロケーション:
   - 「asia-northeast1 (Tokyo)」を選択（推奨）
5. 「有効にする」をクリック
```

### 2.3 Firebase Hosting 設定

**Firebase Console での作業**:
```
1. Firebase Console → Hosting
2. 「始める」をクリック
3. セットアップ手順に従う（既にfirebase initで完了済み）
```

### 2.4 環境変数設定

**Firebase 設定情報の取得**:
```
1. Firebase Console → プロジェクト設定（歯車アイコン）
2. 下にスクロール → 「マイアプリ」→「Webアプリを追加」
3. アプリのニックネーム: 「bowling-score-web」
4. Firebase Hosting: チェックを入れる
5. 「アプリを登録」をクリック
6. 表示される firebaseConfig をコピー
```

**frontend/.env.local 作成**:
```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**frontend/.env.example 作成**:
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## Phase 3: Firebase 初期実装

### 3.1 Firebase設定ファイル作成

**frontend/src/firebase/config.ts**:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 3.2 Firestore Security Rules設定

**firestore.rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザー情報
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // ゲーム
    match /games/{gameId} {
      allow read: if request.auth != null &&
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null &&
                              resource.data.userId == request.auth.uid;

      // フレーム
      match /frames/{frameId} {
        allow read, write: if request.auth != null &&
                             get(/databases/$(database)/documents/games/$(gameId)).data.userId == request.auth.uid;
      }
    }
  }
}
```

**デプロイ**:
```bash
firebase deploy --only firestore:rules
```

### 3.3 Firestore インデックス設定

**firestore.indexes.json**:
```json
{
  "indexes": [
    {
      "collectionGroup": "games",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "playedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "games",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "totalScore", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

**デプロイ**:
```bash
firebase deploy --only firestore:indexes
```

---

## Phase 4: Google認証機能実装

### 4.1 認証コンテキスト作成

**frontend/src/hooks/useAuth.ts**:
```typescript
import { useState, useEffect } from 'react';
import { User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return { user, loading, loginWithGoogle, logout };
};
```

### 4.2 Googleログインボタンコンポーネント

**frontend/src/components/auth/GoogleLoginButton.tsx**:
```typescript
import { Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../../hooks/useAuth';

export const GoogleLoginButton = () => {
  const { loginWithGoogle } = useAuth();

  return (
    <Button
      variant="contained"
      startIcon={<GoogleIcon />}
      onClick={loginWithGoogle}
      fullWidth
    >
      Googleでログイン
    </Button>
  );
};
```

### 4.3 ログインページ作成

**frontend/src/pages/LoginPage.tsx**:
```typescript
import { Box, Container, Typography } from '@mui/material';
import { GoogleLoginButton } from '../components/auth/GoogleLoginButton';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export const LoginPage = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/" replace />;

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          ボーリングスコア管理
        </Typography>
        <Box sx={{ mt: 4 }}>
          <GoogleLoginButton />
        </Box>
      </Box>
    </Container>
  );
};
```

### 4.4 認証ガード実装

**frontend/src/components/auth/ProtectedRoute.tsx**:
```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: Props) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};
```

---

## Phase 5: スコア記録機能実装

### 5.1 型定義

**frontend/src/types/game.ts**:
```typescript
export interface Frame {
  frameNumber: number;
  firstThrow: number | null;
  secondThrow: number | null;
  thirdThrow: number | null;
  frameScore: number;
  cumulativeScore: number;
  isStrike: boolean;
  isSpare: boolean;
}

export interface Game {
  id: string;
  userId: string;
  playedAt: Date;
  totalScore: number;
  gameNumber: number;
  memo?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.2 スコア計算ロジック

**frontend/src/utils/scoreCalculator.ts**:
```typescript
import { Frame } from '../types/game';

export const calculateScore = (frames: Frame[]): number => {
  let totalScore = 0;

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];

    if (frame.isStrike && i < 9) {
      // ストライク: 10 + 次の2投
      totalScore += 10 + getNextTwoThrows(frames, i);
    } else if (frame.isSpare && i < 9) {
      // スペア: 10 + 次の1投
      totalScore += 10 + getNextOneThrow(frames, i);
    } else {
      // オープンまたは10フレーム
      totalScore += frame.frameScore;
    }
  }

  return totalScore;
};

// 実装の詳細は省略
```

### 5.3 Firestore操作ヘルパー

**frontend/src/firebase/firestore.ts**:
```typescript
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './config';
import { Game, Frame } from '../types/game';

export const createGame = async (userId: string, frames: Frame[], memo?: string) => {
  const gamesRef = collection(db, 'games');

  const gameData = {
    userId,
    playedAt: Timestamp.now(),
    totalScore: frames[9].cumulativeScore,
    gameNumber: 1,
    memo: memo || null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const gameDoc = await addDoc(gamesRef, gameData);

  // フレームを追加
  for (const frame of frames) {
    const framesRef = collection(db, 'games', gameDoc.id, 'frames');
    await addDoc(framesRef, {
      ...frame,
      createdAt: Timestamp.now(),
    });
  }

  return gameDoc.id;
};

export const getGames = async (userId: string) => {
  const gamesRef = collection(db, 'games');
  const q = query(
    gamesRef,
    where('userId', '==', userId),
    orderBy('playedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Game[];
};
```

### 5.4 ゲーム入力フォーム

**frontend/src/components/game/GameForm.tsx**:
```typescript
import { useState } from 'react';
import { Box, Button, TextField } from '@mui/material';
import { FrameInput } from './FrameInput';
import { Frame } from '../../types/game';
import { useAuth } from '../../hooks/useAuth';
import { createGame } from '../../firebase/firestore';

export const GameForm = () => {
  const { user } = useAuth();
  const [frames, setFrames] = useState<Frame[]>(initializeFrames());
  const [memo, setMemo] = useState('');

  const handleSubmit = async () => {
    if (!user) return;

    await createGame(user.uid, frames, memo);
    // 成功メッセージ表示、リダイレクトなど
  };

  return (
    <Box>
      {frames.map((frame, index) => (
        <FrameInput
          key={index}
          frame={frame}
          onChange={(updatedFrame) => {
            const newFrames = [...frames];
            newFrames[index] = updatedFrame;
            setFrames(newFrames);
          }}
        />
      ))}
      <TextField
        label="メモ"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        fullWidth
        multiline
      />
      <Button onClick={handleSubmit}>保存</Button>
    </Box>
  );
};
```

---

## Phase 6: 履歴管理機能実装

### 6.1 ゲーム履歴ページ

**frontend/src/pages/HistoryPage.tsx**:
```typescript
import { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { getGames } from '../firebase/firestore';
import { Game } from '../types/game';

export const HistoryPage = () => {
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    if (user) {
      getGames(user.uid).then(setGames);
    }
  }, [user]);

  return (
    <Container>
      <Typography variant="h4">ゲーム履歴</Typography>
      <List>
        {games.map((game) => (
          <ListItem key={game.id}>
            {game.playedAt.toLocaleDateString()} - スコア: {game.totalScore}
          </ListItem>
        ))}
      </List>
    </Container>
  );
};
```

---

## Phase 7: ルーティング設定

### 7.1 React Router設定

**frontend/src/App.tsx**:
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { NewGamePage } from './pages/NewGamePage';
import { HistoryPage } from './pages/HistoryPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-game"
          element={
            <ProtectedRoute>
              <NewGamePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## Phase 8: ローカルテスト

### 8.1 Firebase エミュレータ起動

```bash
# エミュレータ初期化（初回のみ）
firebase init emulators

# エミュレータ起動
firebase emulators:start
```

**アクセス**:
- Firestore UI: http://localhost:4000
- Auth UI: http://localhost:4000/auth

### 8.2 開発サーバー起動

```bash
cd frontend
npm run dev
```

**アクセス**: http://localhost:5173

### 8.3 動作確認

```
1. Googleログイン動作確認
2. ゲーム作成・保存動作確認
3. 履歴表示動作確認
4. Firestore UIでデータ確認
```

---

## Phase 9: デプロイ

### 9.1 ビルド

```bash
cd frontend
npm run build
```

### 9.2 Firebase にデプロイ

```bash
# プロジェクトルートで実行
firebase deploy

# または特定のサービスのみ
firebase deploy --only hosting
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 9.3 デプロイ確認

```
1. Firebase Console → Hosting
2. デプロイされたURLにアクセス
3. 本番環境での動作確認
```

---

## Phase 10: GitHub Actions 自動デプロイ設定（オプション）

### 10.1 Firebase サービスアカウント作成

```bash
# サービスアカウントキー生成
firebase init hosting:github
```

### 10.2 GitHub Secrets 設定

```
1. GitHub リポジトリ → Settings → Secrets
2. FIREBASE_SERVICE_ACCOUNT を追加
3. 生成されたサービスアカウントキーを貼り付け
```

### 10.3 GitHub Actions ワークフロー

**.github/workflows/firebase-deploy.yml**:
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
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
```

---

## Phase 11: Phase 2 実装（グループ・ランキング機能）

### 11.1 Groups コレクション作成

```typescript
// frontend/src/firebase/firestore.ts
export const createGroup = async (userId: string, name: string, description?: string) => {
  const groupsRef = collection(db, 'groups');

  const groupData = {
    name,
    description: description || null,
    createdBy: userId,
    isPublic: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const groupDoc = await addDoc(groupsRef, groupData);

  // 作成者をメンバーに追加
  const membersRef = collection(db, 'groups', groupDoc.id, 'members');
  await setDoc(doc(membersRef, userId), {
    role: 'owner',
    joinedAt: Timestamp.now(),
    createdAt: Timestamp.now(),
  });

  return groupDoc.id;
};
```

---

## Phase 12: Phase 4 実装（複数認証プロバイダー対応）

### 12.1 各プロバイダー有効化

**Firebase Console での作業**:
```
1. Firebase Console → Authentication → Sign-in method
2. Apple ID を有効化
3. Twitter を有効化
4. Microsoft を有効化
```

### 12.2 認証機能拡張

```typescript
// frontend/src/hooks/useAuth.ts
import { OAuthProvider } from 'firebase/auth';

export const useAuth = () => {
  // ... 既存のコード

  const loginWithApple = async () => {
    const provider = new OAuthProvider('apple.com');
    await signInWithPopup(auth, provider);
  };

  const loginWithTwitter = async () => {
    const provider = new OAuthProvider('twitter.com');
    await signInWithPopup(auth, provider);
  };

  const loginWithMicrosoft = async () => {
    const provider = new OAuthProvider('microsoft.com');
    await signInWithPopup(auth, provider);
  };

  return {
    user,
    loading,
    loginWithGoogle,
    loginWithApple,
    loginWithTwitter,
    loginWithMicrosoft,
    logout,
  };
};
```

---

## 推奨実装順序まとめ

```
Phase 1: Firebase プロジェクト初期化（1日）
    ↓
Phase 2: Firebase サービス有効化（半日）
    ↓
Phase 3: Firebase 初期実装（半日）
    ↓
Phase 4: Google認証機能実装（1日）
    ↓
Phase 5: スコア記録機能実装（2-3日） ← コア機能
    ↓
Phase 6: 履歴管理機能実装（1日）
    ↓
Phase 7: ルーティング設定（半日）
    ↓
Phase 8: ローカルテスト（1日）
    ↓
Phase 9: デプロイ（半日）
    ↓
Phase 10: GitHub Actions 設定（オプション、半日）
```

**MVP合計見積もり**: 約1-2週間（1人開発の場合）

### 将来的な拡張

```
Phase 11: グループ・ランキング機能（2-3日）
    ↓
Phase 12: 複数認証プロバイダー対応（1-2日）
```

---

## 次のアクション

Firebase構成への移行が完了しました。次に進める選択肢：

1. **Phase 1から順次実装開始**
   - Firebase プロジェクト作成から段階的に進める

2. **コア機能のプロトタイプ作成**
   - スコア記録機能のみ先に実装してテスト

3. **設計の最終確認**
   - ドキュメントレビューと追加の質問事項確認

実装を開始する準備ができましたら、お知らせください！
