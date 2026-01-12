# ユーザー権限の設定ガイド

## 概要

このアプリケーションでは、ユーザーの権限管理を `roles` コレクションで行います。

### 権限レベル

1. **user** (一般ユーザー)
   - デフォルトの権限
   - `/roles` コレクションにドキュメントがないユーザー
   - 自分のゲーム記録の管理のみ可能

2. **facility_manager** (施設管理者)
   - `/roles` コレクションにドキュメントがある
   - 指定された施設の管理が可能
   - 定期開催試合の登録・編集が可能

3. **admin** (システム管理者)
   - `/roles` コレクションにドキュメントがある
   - 全ての施設の管理が可能
   - 全ての機能にアクセス可能

## Firebase Consoleでの権限設定方法

### 1. admin権限の付与

1. Firebase Console (https://console.firebase.google.com/) にアクセス
2. プロジェクトを選択
3. 左メニューから「Firestore Database」を選択
4. 「データ」タブを開く
5. コレクション一覧から `roles` を選択（なければ作成）
6. 「ドキュメントを追加」をクリック
7. 以下の内容で作成:

```
ドキュメントID: {ユーザーのUID}
フィールド:
  - role (string): "admin"
  - createdAt (timestamp): 現在の日時
  - updatedAt (timestamp): 現在の日時
```

### 2. facility_manager権限の付与

1. 上記と同様に `roles` コレクションを開く
2. 「ドキュメントを追加」をクリック
3. 以下の内容で作成:

```
ドキュメントID: {ユーザーのUID}
フィールド:
  - role (string): "facility_manager"
  - facilities (array): ["{施設ID1}", "{施設ID2}"]
  - createdAt (timestamp): 現在の日時
  - updatedAt (timestamp): 現在の日時
```

**注意:** `facilities` 配列には、そのユーザーが管理できる施設のIDを含めます。

### 3. ユーザーUIDの確認方法

#### 方法1: Firebase Consoleから
1. Firebase Console → Authentication
2. 「Users」タブでユーザー一覧を確認
3. 該当ユーザーの「User UID」列をコピー

#### 方法2: アプリから
1. ユーザーとしてログイン
2. ブラウザの開発者ツール (F12) を開く
3. Console タブで以下を実行:
```javascript
firebase.auth().currentUser.uid
```

## rolesコレクションのデータ構造

### Admin の例
```json
{
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Facility Manager の例
```json
{
  "role": "facility_manager",
  "facilities": [
    "facility_abc123",
    "facility_def456"
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## 施設IDの確認方法

1. Firebase Console → Firestore Database
2. `facilities` コレクションを開く
3. 該当施設のドキュメントIDをコピー

## 権限の削除

ユーザーを一般ユーザー(user)に戻すには、`/roles/{userId}` ドキュメントを削除します。

1. Firebase Console → Firestore Database
2. `roles` コレクション → 該当ユーザーのドキュメント
3. 「...」メニュー → 「ドキュメントを削除」

## トラブルシューティング

### 権限が反映されない

1. **ブラウザをリロード**: ログアウト→ログインで権限が再取得されます
2. **ドキュメントIDを確認**: ユーザーのUIDと一致しているか確認
3. **roleフィールドを確認**: "admin" または "facility_manager" が正しく入力されているか
4. **facilitiesフィールドを確認** (facility_managerの場合): 配列形式で施設IDが含まれているか

### セキュリティルールエラー

`Permission denied` エラーが出る場合:

1. Firestore セキュリティルールがデプロイされているか確認
2. ユーザーが正しくログインしているか確認
3. `roles` コレクションのドキュメントが正しく作成されているか確認

## 注意事項

- ⚠️ **admin権限は慎重に付与**: 全てのデータへのアクセスが可能になります
- ⚠️ **facility_manager は必ず facilities 配列を設定**: 空の配列の場合、何も管理できません
- ✅ **定期的な権限の見直し**: 退職者や役割変更があった場合は、速やかに権限を更新してください
