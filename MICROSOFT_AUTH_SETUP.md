# Microsoft アカウント認証設定手順

Firebase ConsoleでMicrosoftアカウント認証を有効化する手順です。

## 手順

### 1. Firebase Consoleにアクセス

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. プロジェクト「bowlards」を選択

### 2. Authentication設定

1. 左メニューから **「Authentication」** を選択
2. **「Sign-in method」** タブをクリック
3. 「プロバイダを追加」または「新しいプロバイダを追加」をクリック

### 3. Microsoftを有効化

1. プロバイダ一覧から **「Microsoft」** を選択
2. **「有効にする」** トグルをONにする

### 4. 設定情報を確認

Microsoft認証には以下の設定が必要です（Web向けの基本設定では自動入力されます）：

- **OAuth リダイレクト URI**: 自動生成されます
  - 形式: `https://bowlards.firebaseapp.com/__/auth/handler`

### 5. 保存

1. **「保存」** ボタンをクリック
2. Microsoftが有効なプロバイダとして表示されることを確認

## 注意事項

### 本番環境での追加設定（オプション）

本格的な本番運用の場合は、Azure Active Directoryへの登録と追加設定が必要です：

1. **Azure Portal** でアプリケーションを登録
2. **アプリケーション（クライアント）ID** を取得
3. **クライアントシークレット** を生成
4. Firebase ConsoleでクライアントIDとシークレットを設定

ただし、Webアプリの基本的なテストや開発段階では、上記の簡易設定で動作します。

## 確認方法

1. アプリにアクセス: https://bowlards.web.app/login
2. 「Microsoftでログイン」ボタンをクリック
3. Microsoftアカウントでのログインフローが開始されることを確認

## トラブルシューティング

### エラー: "invalid_request"
- Firebase Hostingのドメインが正しく設定されているか確認
- OAuth リダイレクト URI が正しいか確認

### ポップアップがブロックされる
- ブラウザのポップアップブロック設定を確認
- HTTPSで接続されているか確認（localhostまたはhttps://）

### エラー: "unauthorized_client"
- Azure Portalでのアプリケーション登録が必要な場合があります
- リダイレクトURIがAzure側にも登録されているか確認

## 参考リンク

- [Firebase Authentication - Microsoft](https://firebase.google.com/docs/auth/web/microsoft-oauth)
- [Microsoft identity platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
