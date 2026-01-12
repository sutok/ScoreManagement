# ボーラード/ボーリングスコア管理アプリ

Firebase + React で構築するボーラード・ボーリングスコア記録・管理アプリケーション

## 技術スタック

- **フロントエンド**: React 18 + TypeScript + Vite
- **バックエンド**: Firebase (サーバーレス)
  - Firebase Authentication (Google認証)
  - Cloud Firestore (NoSQLデータベース)
  - Firebase Hosting
- **UI**: Material-UI (MUI)

## ローカル開発環境セットアップ

### 前提条件

- Node.js 20 LTS以上
- Firebase CLI（インストール済み）

### Firebase エミュレーターの起動

ローカル開発では、本番Firebaseプロジェクトなしで開発できます：

```bash
# エミュレーター起動
./start-emulators.sh

# または
firebase emulators:start
```

**エミュレーターアクセスURL**:
- Emulator UI: http://localhost:4000
- Firestore Emulator: http://localhost:8080
- Authentication Emulator: http://localhost:9099

### フロントエンド開発サーバー起動（次のステップ）

```bash
# React プロジェクト作成後
cd frontend
npm install
npm run dev
```

## プロジェクト構成

```
.
├── firebase.json              # Firebase設定
├── .firebaserc                # Firebaseプロジェクト設定
├── firestore.rules            # Firestoreセキュリティルール
├── firestore.indexes.json     # Firestoreインデックス
├── start-emulators.sh         # エミュレーター起動スクリプト
├── claudedocs/                # 設計ドキュメント
│   ├── CLAUDE.md              # プロジェクト概要
│   ├── requirements.md        # 要件定義
│   ├── tech_stack.md          # 技術スタック
│   ├── database_schema.md     # Firestoreデータ設計
│   ├── architecture.md        # アーキテクチャ設計
│   └── next_steps.md          # 実装手順
└── frontend/                  # React アプリ（作成予定）
```

## 開発フェーズ

### Phase 1: MVP（実装予定）
- ✅ プロジェクト設計完了
- ✅ Firebase エミュレーター設定完了
- ⏳ React プロジェクト作成
- ⏳ Google認証実装
- ⏳ スコア記録機能
- ⏳ 履歴管理機能

### Phase 2: グループ機能（将来）
- グループ作成・管理
- グループ内ランキング

### Phase 4: 複数認証対応（将来）
- Apple ID認証
- Twitter認証
- Microsoft認証

## ドキュメント

詳細な設計ドキュメントは `claudedocs/` ディレクトリを参照してください：

- [要件定義](claudedocs/requirements.md)
- [技術スタック詳細](claudedocs/tech_stack.md)
- [Firestoreデータ設計](claudedocs/database_schema.md)
- [システムアーキテクチャ](claudedocs/architecture.md)
- [実装手順](claudedocs/next_steps.md)

## ライセンス

Private Project
