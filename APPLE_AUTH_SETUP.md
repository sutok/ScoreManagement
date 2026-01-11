# Apple ID 認証設定手順

Firebase ConsoleでApple ID認証を有効化する手順です。

## 手順

### 1. Firebase Consoleにアクセス

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. プロジェクト「bowlards」を選択

### 2. Authentication設定

1. 左メニューから **「Authentication」** を選択
2. **「Sign-in method」** タブをクリック
3. 「プロバイダを追加」または「新しいプロバイダを追加」をクリック

### 3. Apple IDを有効化

1. プロバイダ一覧から **「Apple」** を選択
2. **「有効にする」** トグルをONにする

### 4. 設定情報を確認

Apple認証には以下の設定が必要です（Web向けの基本設定では自動入力されます）：

- **OAuth リダイレクト URI**: 自動生成されます
  - 形式: `https://bowlards.firebaseapp.com/__/auth/handler`

### 5. 保存

1. **「保存」** ボタンをクリック
2. Apple IDが有効なプロバイダとして表示されることを確認

## 注意事項

### 本番環境での追加設定（オプション）

本格的な本番運用の場合は、Apple Developer Programへの登録と追加設定が必要です：

1. **Apple Developer Program** に登録（年間 $99）
2. **Services ID** の作成
3. **Key** の生成
4. Firebase ConsoleでServices IDとKeyを設定

ただし、Webアプリの基本的なテストや開発段階では、上記の簡易設定で動作します。

## 確認方法

1. アプリにアクセス: https://bowlards.web.app/login
2. 「Sign in with Apple」ボタンをクリック
3. Apple IDでのログインフローが開始されることを確認

## トラブルシューティング

### エラー: "invalid_request"
- Firebase Hostingのドメインが正しく設定されているか確認
- OAuth リダイレクト URI が正しいか確認

### ポップアップがブロックされる
- ブラウザのポップアップブロック設定を確認
- HTTPSで接続されているか確認（localhostまたはhttps://）

## 参考リンク

- [Firebase Authentication - Apple](https://firebase.google.com/docs/auth/web/apple)
- [Apple Developer - Sign in with Apple](https://developer.apple.com/sign-in-with-apple/)
