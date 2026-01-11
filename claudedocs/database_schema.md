# Firestore データベース設計

## コレクション構造概要

```
users (コレクション)
├── {userId} (ドキュメント)

games (コレクション)
├── {gameId} (ドキュメント)
    └── frames (サブコレクション)
        ├── {frameNumber} (ドキュメント)

groups (コレクション) ※Phase 2
├── {groupId} (ドキュメント)
    └── members (サブコレクション)
        ├── {userId} (ドキュメント)
```

---

## Phase 1（MVP）のコレクション設計

### users コレクション

**ドキュメントID**: Firebase Authentication UID

**フィールド**:

| フィールド名 | データ型 | 必須 | 説明 |
|------------|---------|------|------|
| displayName | string | ✅ | 表示名 |
| email | string | ❌ | メールアドレス（Google提供、参照用） |
| profileImageUrl | string | ❌ | プロフィール画像URL（Google提供） |
| isActive | boolean | ✅ | アカウント有効フラグ（デフォルト: true） |
| lastLoginAt | timestamp | ❌ | 最終ログイン日時 |
| createdAt | timestamp | ✅ | 作成日時（サーバータイムスタンプ） |
| updatedAt | timestamp | ✅ | 更新日時（サーバータイムスタンプ） |

**セキュリティルール**:
```javascript
match /users/{userId} {
  // 本人のみ読み書き可能
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if request.auth != null && request.auth.uid == userId;
}
```

**インデックス**: 自動生成インデックスで対応可能

**サンプルドキュメント**:
```javascript
{
  displayName: "田中太郎",
  email: "tanaka@example.com",
  profileImageUrl: "https://lh3.googleusercontent.com/...",
  isActive: true,
  lastLoginAt: Timestamp(2025-01-11 14:30:00),
  createdAt: Timestamp(2025-01-01 10:00:00),
  updatedAt: Timestamp(2025-01-11 14:30:00)
}
```

---

### games コレクション

**ドキュメントID**: 自動生成（Firestore Auto ID）

**フィールド**:

| フィールド名 | データ型 | 必須 | 説明 |
|------------|---------|------|------|
| userId | string | ✅ | プレイヤーのユーザーID（Firebase UID参照） |
| playedAt | timestamp | ✅ | プレイ日時 |
| totalScore | number | ✅ | 合計スコア（0〜300） |
| gameNumber | number | ✅ | 同日のゲーム番号（デフォルト: 1） |
| memo | string | ❌ | メモ・コメント |
| createdAt | timestamp | ✅ | 作成日時（サーバータイムスタンプ） |
| updatedAt | timestamp | ✅ | 更新日時（サーバータイムスタンプ） |

**複合インデックス**:
```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "games",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "playedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

**セキュリティルール**:
```javascript
match /games/{gameId} {
  // 本人のゲームのみ読み取り可能
  allow read: if request.auth != null &&
                 resource.data.userId == request.auth.uid;

  // 作成時はuserIdが本人であることを確認
  allow create: if request.auth != null &&
                   request.resource.data.userId == request.auth.uid &&
                   request.resource.data.totalScore >= 0 &&
                   request.resource.data.totalScore <= 300;

  // 更新・削除は本人のみ
  allow update, delete: if request.auth != null &&
                          resource.data.userId == request.auth.uid;
}
```

**サンプルドキュメント**:
```javascript
{
  userId: "firebase-uid-123",
  playedAt: Timestamp(2025-01-11 14:30:00),
  totalScore: 180,
  gameNumber: 1,
  memo: "調子良かった！",
  createdAt: Timestamp(2025-01-11 14:30:00),
  updatedAt: Timestamp(2025-01-11 15:00:00)
}
```

---

### games/{gameId}/frames サブコレクション

**ドキュメントID**: フレーム番号（1〜10の文字列）

**フィールド**:

| フィールド名 | データ型 | 必須 | 説明 |
|------------|---------|------|------|
| frameNumber | number | ✅ | フレーム番号（1〜10） |
| firstThrow | number | ❌ | 1投目のピン数（0〜10） |
| secondThrow | number | ❌ | 2投目のピン数（0〜10） |
| thirdThrow | number | ❌ | 3投目のピン数（10フレームのみ、0〜10） |
| frameScore | number | ✅ | このフレームのスコア（0〜30） |
| cumulativeScore | number | ✅ | 累積スコア（0〜300） |
| isStrike | boolean | ✅ | ストライクフラグ |
| isSpare | boolean | ✅ | スペアフラグ |
| createdAt | timestamp | ✅ | 作成日時 |

**セキュリティルール**:
```javascript
match /games/{gameId}/frames/{frameId} {
  // 親ゲームの所有者のみアクセス可
  allow read, write: if request.auth != null &&
                       get(/databases/$(database)/documents/games/$(gameId)).data.userId == request.auth.uid;
}
```

**バリデーションルール**（アプリケーションレベル）:
- frameNumber: 1〜10
- firstThrow + secondThrow <= 10（10フレーム以外）
- thirdThrow: 10フレームのみ許可
- frameScore: 0〜30
- cumulativeScore: 0〜300

**サンプルドキュメント**:
```javascript
// フレーム1（ストライク）
{
  frameNumber: 1,
  firstThrow: 10,
  secondThrow: null,
  thirdThrow: null,
  frameScore: 20,
  cumulativeScore: 20,
  isStrike: true,
  isSpare: false,
  createdAt: Timestamp(2025-01-11 14:31:00)
}

// フレーム2（スペア）
{
  frameNumber: 2,
  firstThrow: 7,
  secondThrow: 3,
  thirdThrow: null,
  frameScore: 15,
  cumulativeScore: 35,
  isStrike: false,
  isSpare: true,
  createdAt: Timestamp(2025-01-11 14:32:00)
}

// フレーム10（ストライク + 追加投球）
{
  frameNumber: 10,
  firstThrow: 10,
  secondThrow: 10,
  thirdThrow: 9,
  frameScore: 29,
  cumulativeScore: 180,
  isStrike: true,
  isSpare: false,
  createdAt: Timestamp(2025-01-11 14:40:00)
}
```

---

## Phase 2: グループ・ランキング機能

### groups コレクション

**ドキュメントID**: 自動生成（Firestore Auto ID）

**フィールド**:

| フィールド名 | データ型 | 必須 | 説明 |
|------------|---------|------|------|
| name | string | ✅ | グループ名 |
| description | string | ❌ | グループ説明 |
| createdBy | string | ✅ | 作成者のユーザーID（Firebase UID） |
| isPublic | boolean | ✅ | 公開グループフラグ（デフォルト: false） |
| createdAt | timestamp | ✅ | 作成日時 |
| updatedAt | timestamp | ✅ | 更新日時 |

**セキュリティルール**:
```javascript
match /groups/{groupId} {
  // 認証済みユーザーは全て読み取り可能
  allow read: if request.auth != null;

  // 認証済みユーザーは作成可能
  allow create: if request.auth != null;

  // 作成者のみ更新・削除可能
  allow update, delete: if request.auth != null &&
                          resource.data.createdBy == request.auth.uid;
}
```

---

### groups/{groupId}/members サブコレクション

**ドキュメントID**: ユーザーID（Firebase UID）

**フィールド**:

| フィールド名 | データ型 | 必須 | 説明 |
|------------|---------|------|------|
| role | string | ✅ | 役割（owner/admin/member） |
| joinedAt | timestamp | ✅ | 加入日時 |
| createdAt | timestamp | ✅ | 作成日時 |

**セキュリティルール**:
```javascript
match /groups/{groupId}/members/{userId} {
  // 認証済みユーザーは読み取り可能
  allow read: if request.auth != null;

  // 本人またはグループ作成者のみ書き込み可能
  allow write: if request.auth != null &&
                 (request.auth.uid == userId ||
                  get(/databases/$(database)/documents/groups/$(groupId)).data.createdBy == request.auth.uid);
}
```

**サンプルドキュメント**:
```javascript
{
  role: "owner",
  joinedAt: Timestamp(2025-01-11 15:00:00),
  createdAt: Timestamp(2025-01-11 15:00:00)
}
```

---

## Phase 4: 複数認証プロバイダー対応

### Firebase Authenticationによる対応

**重要**: Firebaseでは、複数の認証プロバイダーは**Firebase Authentication**が自動的に管理します。`oauth_accounts`テーブルは不要です。

**Firebase Authenticationの機能**:
- 1ユーザーが複数の認証プロバイダーを紐付け可能
- Google、Apple、Twitter、Microsoftをネイティブサポート
- プロバイダー情報は`Firebase Console > Authentication > Users`で確認可能
- アプリケーション側では追加のデータベース設計不要

**実装方法**:
```javascript
// フロントエンドで各プロバイダーのサインインメソッドを呼ぶだけ
import { signInWithPopup, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';

// Google認証
const googleProvider = new GoogleAuthProvider();
await signInWithPopup(auth, googleProvider);

// Apple認証
const appleProvider = new OAuthProvider('apple.com');
await signInWithPopup(auth, appleProvider);

// Twitter認証
const twitterProvider = new OAuthProvider('twitter.com');
await signInWithPopup(auth, twitterProvider);

// Microsoft認証
const microsoftProvider = new OAuthProvider('microsoft.com');
await signInWithPopup(auth, microsoftProvider);
```

**認証プロバイダーのリンク**:
```javascript
// 既にログイン済みのユーザーに新しいプロバイダーを追加
import { linkWithPopup } from 'firebase/auth';

const currentUser = auth.currentUser;
const newProvider = new OAuthProvider('apple.com');
await linkWithPopup(currentUser, newProvider);
```

---

## データ整合性・バリデーション

### ボーリングスコア計算ルール

**通常フレーム（1〜9）**:
- ストライク: 10 + 次の2投の合計
- スペア: 10 + 次の1投
- オープン: 2投の合計

**10フレーム**:
- ストライク: 3投可能
- スペア: 3投可能
- オープン: 2投のみ

**最大スコア**: 300点（パーフェクトゲーム）

### アプリケーションレベルでのバリデーション

**ゲーム作成時**:
1. 10個のフレームドキュメントを同時作成（バッチ書き込み）
2. 各フレームの初期値を設定

**フレーム入力時**:
1. クライアント側でスコア計算
2. Firestoreに保存
3. オプション: Cloud Functionsで検証

**累積スコアの整合性**:
- クライアント側で計算・検証
- 保存時にFirestore Security Rulesで範囲チェック

---

## Firestore インデックス設定

### 複合インデックスが必要なクエリ

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

**インデックスの用途**:
1. ユーザーのゲーム履歴を日付順に取得
2. ユーザーのゲームをスコア順に取得（ベストゲーム表示など）

---

## データモデリングのベストプラクティス

### サブコレクション vs 配列フィールド

**framesをサブコレクションにした理由**:
- ✅ 各フレームを個別に更新可能（効率的）
- ✅ セキュリティルールを細かく設定可能
- ✅ 10フレーム分のデータ量でも問題なし
- ❌ 配列フィールドにすると、1フレーム更新で全体を再書き込み

### ドキュメント参照 vs データ埋め込み

**userIdを文字列で保存する理由**:
- ✅ シンプルで高速なクエリ
- ✅ ユーザー情報の変更がゲームデータに影響しない
- ✅ セキュリティルールで簡単に検証可能

---

## データ移行（Phase 1 → Phase 4）

### Firebase Authenticationの場合

**Phase 1（Google認証のみ）**:
- Firebase Authenticationで自動管理
- ユーザーはGoogle認証でログイン

**Phase 4（複数プロバイダー追加）**:
- **データ移行不要**
- Firebase Authenticationが自動的に複数プロバイダーを管理
- 既存ユーザーは引き続きGoogle認証で利用可能
- 新しいプロバイダーをリンクするだけ

---

## サンプルクエリ

### ゲーム履歴取得（日付降順、ページネーション）

```javascript
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const gamesRef = collection(db, 'games');
const q = query(
  gamesRef,
  where('userId', '==', currentUserId),
  orderBy('playedAt', 'desc'),
  limit(20)
);

const querySnapshot = await getDocs(q);
const games = querySnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

### ベストスコア取得

```javascript
const q = query(
  gamesRef,
  where('userId', '==', currentUserId),
  orderBy('totalScore', 'desc'),
  limit(1)
);

const querySnapshot = await getDocs(q);
const bestGame = querySnapshot.docs[0].data();
```

### ゲーム詳細取得（フレーム含む）

```javascript
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

// ゲーム本体を取得
const gameDoc = await getDoc(doc(db, 'games', gameId));
const game = gameDoc.data();

// フレームを取得
const framesRef = collection(db, 'games', gameId, 'frames');
const framesSnapshot = await getDocs(framesRef);
const frames = framesSnapshot.docs.map(doc => doc.data()).sort((a, b) => a.frameNumber - b.frameNumber);
```

---

## セキュリティ設計

### Firestore Security Rules 全体

**firestore.rules**:
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

---

## まとめ

### PostgreSQL → Firestoreの主な変更点

| PostgreSQL | Firestore |
|-----------|-----------|
| テーブル | コレクション |
| 行（Row） | ドキュメント |
| 外部キー | ドキュメント参照 or サブコレクション |
| JOIN | 複数クエリまたはデータ埋め込み |
| SQL制約 | Security Rules + アプリ検証 |
| インデックス | 複合インデックス（自動生成 + 手動設定） |
| トランザクション | バッチ書き込み、トランザクション |

### Firebaseのメリット

1. **oauth_accountsテーブル不要**: Firebase Authが自動管理
2. **リアルタイム同期**: データ変更を即座に反映
3. **オフライン対応**: ローカルキャッシュで動作
4. **セキュリティルール**: データベースレベルでアクセス制御
5. **スケーラブル**: 自動スケーリング、管理不要
