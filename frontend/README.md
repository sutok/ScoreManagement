# ボーリングスコア管理 - フロントエンド

React + TypeScript + Firebase で構築されたボーリングスコア記録・管理アプリケーション

## 技術スタック

- **React**: 18.2+
- **TypeScript**: 5.0+
- **ビルドツール**: Vite 5.0+
- **UIフレームワーク**: Material-UI (MUI) 5.15+
- **状態管理**: Zustand 4.4+
- **データフェッチ**: TanStack Query 5.17+
- **フォーム**: React Hook Form 7.49+ + Zod 3.22+
- **Firebase**: 10.7+
  - Firebase Authentication
  - Cloud Firestore
- **ルーティング**: React Router 6.21+

## セットアップ

### 前提条件

- Node.js 20 LTS以上
- npm または yarn

### インストール

```bash
# 依存関係のインストール
npm install
```

### 開発サーバー起動

```bash
# ローカル開発サーバー起動
npm run dev
```

アクセス: http://localhost:5173

### Firebaseエミュレーター連携

ローカル開発では、Firebaseエミュレーターに自動接続します：

1. **プロジェクトルートでエミュレーター起動**:
   ```bash
   cd ..
   ./start-emulators.sh
   ```

2. **フロントエンド開発サーバー起動**（別ターミナル）:
   ```bash
   cd frontend
   npm run dev
   ```

**エミュレーターURL**:
- Emulator UI: http://localhost:4000
- Firestore: http://localhost:8080
- Authentication: http://localhost:9099

## プロジェクト構造

```
frontend/
├── src/
│   ├── firebase/           # Firebase設定
│   │   └── config.ts       # Firebase初期化・エミュレーター設定
│   ├── components/         # Reactコンポーネント
│   │   ├── auth/           # 認証関連コンポーネント
│   │   ├── game/           # ゲーム関連コンポーネント
│   │   └── common/         # 共通コンポーネント
│   ├── pages/              # ページコンポーネント
│   ├── hooks/              # カスタムフック
│   ├── types/              # TypeScript型定義
│   │   ├── user.ts
│   │   └── game.ts
│   ├── utils/              # ユーティリティ関数
│   ├── styles/             # スタイル・テーマ
│   ├── App.tsx             # ルートコンポーネント
│   └── main.tsx            # エントリーポイント
├── .env.local              # 環境変数（ローカル開発用）
├── .env.example            # 環境変数テンプレート
└── package.json
```

## 環境変数

`.env.local` ファイルで設定：

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**ローカル開発時**: エミュレーター用のダミー値が設定済み

## ビルド

```bash
# 本番ビルド
npm run build

# ビルド成果物のプレビュー
npm run preview
```

ビルド成果物は `dist/` ディレクトリに生成されます。

## Linting & フォーマット

```bash
# ESLint実行
npm run lint
```

## 開発ガイドライン

### コンポーネント作成

- 関数コンポーネントを使用
- TypeScriptの型定義を必須
- Propsの型定義を明確に

### 状態管理

- ローカル状態: `useState`
- グローバル状態: Zustand
- サーバー状態: TanStack Query

### スタイリング

- Material-UIのコンポーネントを優先
- `sx` プロップでスタイリング
- テーマ設定は `src/styles/` で管理

## 次のステップ

1. ✅ プロジェクトセットアップ完了
2. ⏳ 認証機能実装
3. ⏳ スコア記録機能実装
4. ⏳ 履歴管理機能実装

詳細は `/claudedocs/next_steps.md` を参照
