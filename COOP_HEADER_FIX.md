# COOP Header Configuration

**実装日**: 2026-01-11
**問題**: Cross-Origin-Opener-Policy警告がコンソールに表示される
**ステータス**: ✅ 修正済み

---

## 🔍 問題の詳細

### 発生していた警告

```
firebase-DmRmcB4W.js:15 Cross-Origin-Opener-Policy policy would block the window.closed call.
```

**発生タイミング**: Googleログイン時（ポップアップ認証）

**影響**:
- ✅ 機能的には問題なし（ログインは正常に動作）
- ⚠️ ブラウザコンソールに警告が4回表示される
- 開発者エクスペリエンスの低下

---

## 🔧 解決方法

### firebase.json へのヘッダー追加

Firebase HostingでCOOP（Cross-Origin-Opener-Policy）ヘッダーを設定：

```json
{
  "hosting": {
    "headers": [
      {
        "source": "/**",
        "headers": [
          {
            "key": "Cross-Origin-Opener-Policy",
            "value": "same-origin-allow-popups"
          }
        ]
      }
    ]
  }
}
```

### ヘッダーの意味

**`Cross-Origin-Opener-Policy: same-origin-allow-popups`**

- **same-origin**: 同一オリジンのウィンドウとの通信を許可
- **allow-popups**: ポップアップウィンドウ（Googleログイン）を許可
- Firebase Authenticationのポップアップ認証と互換性あり

### 他の選択肢との比較

| 値 | 説明 | Firebase Auth互換性 |
|----|------|-------------------|
| `same-origin-allow-popups` | 同一オリジン + ポップアップ許可 | ✅ 完全互換 |
| `same-origin` | 同一オリジンのみ | ❌ ポップアップブロック |
| `unsafe-none` | 制限なし | ✅ 動作するが非推奨 |

---

## 📊 デプロイ前後の比較

### デプロイ前
```
ログイン時のコンソール出力:
❌ Cross-Origin-Opener-Policy policy would block the window.closed call. (x4)
✅ ログイン成功
```

### デプロイ後（期待される動作）
```
ログイン時のコンソール出力:
✅ ログイン成功
✅ 警告なし
```

---

## 🧪 テスト手順

### 1. デプロイ
```bash
firebase deploy --only hosting
```

### 2. 本番環境でテスト
1. https://bowlards.web.app/login を開く
2. ブラウザコンソールを開く（F12 → Console）
3. 「Googleでログイン」をクリック
4. ログイン成功を確認
5. **コンソールに警告が出ないことを確認**

### 3. ヘッダー確認
```bash
curl -I https://bowlards.web.app/
```

期待される出力:
```
cross-origin-opener-policy: same-origin-allow-popups
```

または、ブラウザの開発者ツールで確認:
1. Network タブを開く
2. ページをリロード
3. 最初のリクエスト（`bowlards.web.app/`）をクリック
4. Headers タブで `cross-origin-opener-policy` を確認

---

## 🔒 セキュリティへの影響

### 変更によるセキュリティ影響

**ポジティブ**:
- ✅ COOPヘッダーを明示的に設定（セキュリティ強化）
- ✅ ポップアップの適切な分離
- ✅ クロスオリジン攻撃への防御

**考慮点**:
- ⚠️ `same-origin-allow-popups` は安全な設定
- ⚠️ Firebase Authenticationの仕様に準拠
- ✅ 他のセキュリティヘッダーと併用可能

### 推奨される追加ヘッダー（将来的に）

```json
{
  "key": "Cross-Origin-Embedder-Policy",
  "value": "require-corp"
},
{
  "key": "X-Content-Type-Options",
  "value": "nosniff"
},
{
  "key": "X-Frame-Options",
  "value": "DENY"
}
```

---

## 📈 パフォーマンスへの影響

**HTTPヘッダー追加による影響**:
- ✅ レスポンスサイズ: +30バイト程度
- ✅ パフォーマンス: 影響なし
- ✅ キャッシュ: 影響なし

---

## 🐛 トラブルシューティング

### ヘッダーが反映されない場合

**原因1: キャッシュ**
```bash
# ブラウザキャッシュをクリア
# または、シークレットモードで確認
```

**原因2: デプロイ未完了**
```bash
# 再度デプロイ
firebase deploy --only hosting

# デプロイステータス確認
firebase hosting:channel:list
```

### ログインが動作しなくなった場合

**rollback手順**:
1. firebase.json から `headers` セクションを削除
2. 再デプロイ
```bash
firebase deploy --only hosting
```

---

## 📚 参考資料

### 公式ドキュメント

- [Firebase Hosting Headers](https://firebase.google.com/docs/hosting/full-config#headers)
- [Cross-Origin-Opener-Policy MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy)
- [Firebase Authentication Best Practices](https://firebase.google.com/docs/auth/web/google-signin)

### 関連Issue

- Firebase Authentication + COOP: 多くのFirebaseアプリで同様の警告が報告されている
- 推奨設定: `same-origin-allow-popups` がベストプラクティス

---

## ✅ チェックリスト

デプロイ前:
- [x] firebase.json にヘッダー設定を追加
- [x] 設定内容をレビュー
- [ ] ローカルでビルド確認

デプロイ後:
- [ ] 本番環境でログインテスト
- [ ] コンソール警告が消えたことを確認
- [ ] ヘッダーが正しく設定されていることを確認
- [ ] すべての機能が正常動作することを確認

---

**実装者**: Claude Code
**レビュー**: 必要
**ステータス**: ✅ 設定完了、デプロイ待ち
