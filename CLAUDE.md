# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

ボーラード/ボーリングゲームの得点記録システム

### 設計ドキュメント

プロジェクトの詳細な設計は `claudedocs/` ディレクトリに格納されています：

- **要件定義**: `claudedocs/requirements.md` - 機能要件、非機能要件、成功指標
- **Firebaseアーキテクチャ**: `claudedocs/firebase_architecture.md` - Firebase構成、セキュリティルール、デプロイ
- **Firestoreデータモデル**: `claudedocs/database_schema.md` - コレクション設計、セキュリティルール
- **技術スタック**: `claudedocs/tech_stack.md` - Firebase + React技術構成
- **次のステップ**: `claudedocs/next_steps.md` - 実装フェーズ、推奨順序

### MVP（最小実行可能製品）スコープ

**Phase 1 機能（現在の目標）**:
- 個人ユーザー向けWebアプリケーション（**Firebase全面採用**）
- ユーザー認証（**Firebase Authentication - Google**）
  - Firebase Authによる認証管理
  - アプリ内で管理するユーザー情報は**表示名のみ**
- フレームごとのボーリングスコア記録（10フレーム、自動計算）
  - Cloud Firestoreにデータ保存
- 履歴管理・検索機能
  - Firestoreクエリによる検索・フィルタリング
- Firebase Hostingでデプロイ

**Phase 2以降（将来的な拡張）**:
- 友人・グループ機能（スコア共有）
- グループ内ランキング
- 統計・分析機能
- **Phase 4: 複数認証プロバイダー対応**
  - Firebase Authで Apple ID、Twitter、Microsoft を追加
  - 1アカウントに複数の認証方法を紐付け可能

## 言語設定

**重要**: このプロジェクトでは、すべての出力を日本語で行うこと。

## 技術スタック

### Firebase 全面採用

**使用するFirebaseサービス**:
- **Firebase Authentication**: ユーザー認証（Google、Apple、Twitter、Microsoft）
- **Cloud Firestore**: NoSQLデータベース（リアルタイム同期）
- **Firebase Hosting**: Webアプリケーションホスティング（自動HTTPS、CDN）
- **Cloud Functions**: サーバーレス関数（オプション、必要に応じて）

**フロントエンド**:
- React 18+ with TypeScript
- Vite（ビルドツール）
- Material-UI（UIコンポーネント）
- Zustand（状態管理）

**メリット**:
- ✅ バックエンドAPI不要（サーバーレス）
- ✅ インフラ管理不要
- ✅ 自動スケーリング
- ✅ リアルタイム同期
- ✅ 無料枠で運用可能
- ✅ 高速開発

## 認証設計

### Firebase Authentication（Phase 1）

- **認証方式**: Firebase Authentication（Google プロバイダー）
- **ユーザー識別**: Firebase UID
- **管理情報**:
  - Firebase Auth の `displayName`
  - Firestore `users` コレクションに追加情報を保存
- **セッション管理**: Firebase SDK が自動管理

### 複数認証プロバイダー対応（Phase 4）

**対応プロバイダー**:
- Google（Phase 1から対応）
- Apple ID
- Twitter（X）
- Microsoft

**設計方針**:
- Firebase Authentication が複数プロバイダーを自動的に管理
- 1つのFirebase UIDに複数のプロバイダーをリンク可能
- アカウントリンク機能を使用
- 追加のテーブル不要（Firebase Authが管理）

### ユーザー情報管理方針

**Firebase Authが管理**:
- UID（一意識別子）
- プロバイダー情報（Google、Apple等）
- メールアドレス
- プロフィール画像URL

**Firestoreで管理**:
- `displayName`: ユーザーが設定する表示名（必須）
- `createdAt`: アカウント作成日時
- `updatedAt`: 更新日時

**管理しない情報**:
- パスワード（Firebaseに委譲）
- 個人情報（住所、電話番号など）

## データベースアーキテクチャ（Cloud Firestore）

### Phase 1（MVP）のコレクション構造

**users (コレクション)**
- ユーザー情報を管理
- ドキュメントID = Firebase UID

**games (コレクション)**
- ボーリングゲームの基本情報を管理
- `userId` フィールドでユーザーを参照

**games/{gameId}/frames (サブコレクション)**
- 各フレームの投球結果を管理
- 親ゲームに紐づくサブコレクション

### Phase 2以降の拡張

**Phase 2: スコア共有・ランキング**
- **groups (コレクション)**: 友人グループ・サークル情報を管理
- **groups/{groupId}/members (サブコレクション)**: グループメンバー管理

**Phase 4: 複数認証プロバイダー対応**
- Firebase Authentication が自動的に管理
- 追加のコレクション不要
- アカウントリンク機能を使用

## インフラストラクチャ (Firebase)

### Firebase プロジェクト設定

**Firebase Console**: https://console.firebase.google.com/

**初期設定手順**:
1. Firebase プロジェクトを作成
2. Firebase Authentication を有効化（Googleプロバイダー）
3. Cloud Firestore を有効化（本番モード）
4. Firebase Hosting を有効化

**Firebase CLI**:
```bash
# Firebase CLI インストール
npm install -g firebase-tools

# ログイン
firebase login

# プロジェクト初期化
firebase init

# デプロイ
firebase deploy
```

## 開発環境

### Node.js環境

```bash
# Node.js 20 LTS を使用
node --version  # v20.x.x

# npm バージョン確認
npm --version
```

## プロジェクト構造方針

```
score_management/
├── frontend/              # React + Firebase フロントエンド
│   ├── src/
│   │   ├── firebase/      # Firebase設定・操作
│   │   ├── components/    # Reactコンポーネント
│   │   ├── pages/         # ページコンポーネント
│   │   ├── hooks/         # カスタムフック
│   │   └── utils/         # ユーティリティ
│   └── public/
├── functions/             # Cloud Functions（オプション）
├── claudedocs/            # 設計ドキュメント
├── firebase.json          # Firebase設定
├── firestore.rules        # Firestoreセキュリティルール
└── firestore.indexes.json # Firestoreインデックス
```

## 開発方針

### コミット前の確認

1. 変更内容を確認: `git diff`
2. ステータス確認: `git status`
3. 機能ブランチで作業 (main/masterブランチで直接作業しない)

### セキュリティ

- `.env`ファイル、認証情報ファイルは絶対にコミットしない
- 機密情報が含まれる可能性がある場合は警告する
