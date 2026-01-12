# 電話番号認証（SMS OTP）設定手順

Firebase ConsoleでPhone Number認証を有効化する手順です。

## 手順

### 1. Firebase Consoleにアクセス

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. プロジェクト「bowlards」を選択

### 2. Authentication設定

1. 左メニューから **「Authentication」** を選択
2. **「Sign-in method」** タブをクリック
3. 「プロバイダを追加」または「新しいプロバイダを追加」をクリック

### 3. Phone（電話）を有効化

1. プロバイダ一覧から **「Phone」** を選択
2. **「有効にする」** トグルをONにする
3. **「保存」** をクリック

### 4. テスト用電話番号の追加（オプション）

開発・テスト段階では、実際のSMSを送信せずにテストできるテスト用電話番号を設定できます。

1. Authentication → Sign-in method → Phone
2. 「テスト用の電話番号」セクションを展開
3. 電話番号と認証コードのペアを追加
   - 例: `+81 90 1234 5678` / `123456`
4. **「保存」** をクリック

### 5. 承認済みドメインの確認

1. Authentication → Settings → Authorized domains
2. 以下のドメインが登録されていることを確認
   - `bowlards.web.app`
   - `bowlards.firebaseapp.com`
   - ローカル開発用: `localhost` （注: Phone認証は本番ドメインでのみ動作）

## 使い方

### アプリでのログインフロー

1. アプリにアクセス: https://bowlards.web.app/login
2. 電話番号を国際形式で入力（例: `+819012345678`）
3. 「電話番号でログイン」ボタンをクリック
4. SMSで受信した6桁の認証コードを入力
5. 「確認」をクリックしてログイン完了

### 電話番号の形式

- **国際形式（E.164）** で入力する必要があります
- 日本の場合: `+81` + 市外局番（0を除く）+ 電話番号
  - 例: `090-1234-5678` → `+819012345678`
  - 例: `03-1234-5678` → `+81312345678`

### reCAPTCHAについて

- スパム防止のため、reCAPTCHAが自動的に実行されます
- 通常は不可視（invisible）モードで動作し、ユーザーに表示されません
- 疑わしいアクティビティが検出された場合のみ、画像認証が表示されます

## コストについて

### Firebase Authentication（電話番号）

- **無料枠**: 10,000認証/月まで無料
- **超過分**: $0.06/認証

### SMS送信コスト

SMS送信はFirebase Authentication経由で行われ、地域により料金が異なります。

**日本の場合:**
- 約 $0.10〜/SMS

**その他の主要国:**
- アメリカ: $0.0075/SMS
- 中国: $0.07/SMS
- インド: $0.02/SMS

詳細は [Firebase料金](https://firebase.google.com/pricing) を参照してください。

## トラブルシューティング

### エラー: "auth/invalid-phone-number"
- 電話番号が国際形式（E.164）になっているか確認
- `+` から始まっているか確認
- 国コードが正しいか確認（日本は `+81`）

### エラー: "auth/too-many-requests"
- 同じ電話番号で短時間に複数回リクエストした場合に発生
- しばらく時間を置いてから再試行してください

### エラー: "auth/quota-exceeded"
- SMS送信の上限に達しました
- Firebase Consoleで使用状況を確認してください

### SMSが届かない
- 電話番号が正しいか確認
- 携帯電話の電波状況を確認
- SMSブロック設定を確認
- テスト用電話番号を使用してテスト

### localhostで動作しない
- 電話番号認証は本番ドメイン（HTTPS）でのみ動作します
- `https://bowlards.web.app` でテストしてください
- または、テスト用電話番号を使用してください

### reCAPTCHAエラー
- ブラウザのポップアップブロックを無効化
- プライベートブラウジングモードを使用している場合は通常モードで試す
- ブラウザのキャッシュをクリア

## セキュリティのベストプラクティス

### SMS送信地域の制限（推奨）

不正使用を防ぐため、SMS送信可能な地域を制限できます。

1. Firebase Console → Authentication → Settings
2. 「SMS regions」セクションで地域を選択
3. 日本のみに制限する場合: `Japan` を選択

### アプリ検証（App Check）の有効化（推奨）

Firebase App Checkを有効化することで、不正なクライアントからのリクエストを防げます。

1. Firebase Console → App Check
2. アプリを登録
3. reCAPTCHA Enterprise を設定

## 参考リンク

- [Firebase Authentication - Phone](https://firebase.google.com/docs/auth/web/phone-auth)
- [Firebase料金](https://firebase.google.com/pricing)
- [reCAPTCHA](https://www.google.com/recaptcha/about/)
