# Googleログイン トラブルシューティング

**問題**: ポップアップが立ち上がってもすぐに消えてしまう
**発生場所**: ローカルエミュレーター、本番環境（https://bowlards.web.app）

---

## 🔍 確認すべきFirebase Console設定

### 1. Googleプロバイダーの有効化確認

**URL**: https://console.firebase.google.com/project/bowlards/authentication/providers

#### 確認項目：
- [ ] **Google** が「有効」になっているか
- [ ] **サポートメール**が設定されているか
- [ ] ステータスが緑色（有効）になっているか

#### 設定方法：
1. 「Google」をクリック
2. 「有効にする」をON
3. サポートメールを選択
4. 「保存」をクリック

---

### 2. 承認済みドメインの確認

**URL**: https://console.firebase.google.com/project/bowlards/authentication/settings

#### 確認項目：
- [ ] `bowlards.web.app` が承認済みドメインに含まれているか
- [ ] `localhost` が承認済みドメインに含まれているか（ローカル開発用）

#### 追加方法（必要な場合）：
1. 「承認済みドメイン」タブを開く
2. 「ドメインを追加」をクリック
3. `localhost` または `bowlards.web.app` を入力
4. 「追加」をクリック

**注意**: Firebase Hostingを使用している場合、`bowlards.web.app` は自動的に追加されているはずです。

---

### 3. OAuth同意画面の設定確認

**URL**: https://console.cloud.google.com/apis/credentials/consent

#### 確認項目：
- [ ] OAuth同意画面が設定されているか
- [ ] 公開ステータスが「テスト」または「本番」になっているか
- [ ] テストユーザーが追加されているか（テストモードの場合）

#### 設定方法：
1. プロジェクト「bowlards」を選択
2. OAuth同意画面を設定
3. 必要に応じてテストユーザーを追加

---

## 🧪 診断手順

### ステップ1: エラーメッセージの確認

更新したコードでは、ログインボタンをクリックしたときにエラーが表示されます。

1. ローカル環境または本番環境でログインを試行
2. 表示されるエラーメッセージを確認
3. ブラウザのコンソールも確認（F12キー → Consoleタブ）

#### よくあるエラーコード：

**`auth/popup-closed-by-user`**
- **意味**: ユーザーがポップアップを閉じた
- **対処**: 正常な動作。ユーザーが意図的に閉じた場合は問題なし

**`auth/unauthorized-domain`**
- **意味**: 現在のドメインが承認されていない
- **対処**: Firebase Console → Authentication → Settings → 承認済みドメインに追加

**`auth/operation-not-allowed`**
- **意味**: Googleプロバイダーが有効化されていない
- **対処**: Firebase Console → Authentication → Sign-in method → Googleを有効化

**`auth/popup-blocked`**
- **意味**: ブラウザがポップアップをブロックしている
- **対処**: ポップアップ許可 or リダイレクト方式に変更

**`auth/admin-restricted-operation`**
- **意味**: OAuth設定が不完全
- **対処**: Google Cloud ConsoleでOAuth同意画面を設定

---

### ステップ2: ブラウザコンソールの確認

1. ブラウザでF12キーを押す
2. 「Console」タブを開く
3. ログインボタンをクリック
4. 表示されるエラーメッセージをすべてコピー

特に以下の情報を確認：
- エラーコード（`auth/...`）
- エラーメッセージの詳細
- Networkタブでの通信エラー

---

### ステップ3: ローカルエミュレーターの確認

#### エミュレーター起動確認：
```bash
firebase emulators:start
```

#### 確認項目：
- [ ] Authentication Emulator: `http://localhost:9099`
- [ ] Firestore Emulator: `http://localhost:8080`
- [ ] エミュレーターUIが起動しているか

#### ローカル環境特有の問題：
- エミュレーターではGoogleログインは**実際のGoogleアカウント**を使用します
- ポップアップがブロックされている可能性があります

---

## 🔧 解決策

### 解決策1: リダイレクト方式に変更

ポップアップがブロックされる場合、リダイレクト方式を使用できます。

**メリット**:
- ポップアップブロッカーの影響を受けない
- モバイルブラウザで安定動作

**デメリット**:
- ページ全体がリダイレクトされる
- ログイン後に元のページに戻る処理が必要

リダイレクト方式への変更が必要な場合は、お知らせください。

---

### 解決策2: ポップアップ許可の確認

ブラウザの設定で `bowlards.web.app` と `localhost` のポップアップを許可してください。

#### Chrome:
1. アドレスバーの右端のアイコンをクリック
2. 「ポップアップとリダイレクト」を「許可」に変更

#### Safari:
1. 環境設定 → Webサイト → ポップアップウインドウ
2. `bowlards.web.app` を「許可」に設定

---

### 解決策3: OAuth同意画面の設定

Google Cloud Consoleで設定が必要な場合があります。

**URL**: https://console.cloud.google.com/apis/credentials/consent?project=bowlards

1. プロジェクト「bowlards」を選択
2. 「OAuth同意画面」を設定
3. 「公開ステータス」を「本番」に変更（または「テスト」の場合はテストユーザーを追加）

---

## 📊 現在の設定確認コマンド

```bash
# Firebase設定確認
firebase projects:list

# 現在のプロジェクト
cat .firebaserc

# 環境変数確認
cat frontend/.env.local
cat frontend/.env.production
```

---

## 🆘 次のステップ

1. **ログインボタンをクリック**してエラーメッセージを確認
2. **ブラウザコンソール**を開いてエラーコードを確認
3. **Firebase Console**で上記の設定を確認
4. **エラーコードと詳細**を報告してください

エラーメッセージがあれば、具体的な解決策を提示できます。

---

**更新日**: 2026-01-11
**ステータス**: 調査中
