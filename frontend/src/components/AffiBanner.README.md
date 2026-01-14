# AffiBanner - アフィリエイトバナーコンポーネント

アフィリエイトリンクをローテーション表示またはランダム表示するコンポーネントです。

## 使い方

### 基本的な使用例

```tsx
import { AffiBanner } from '../components/AffiBanner';

// ローテーションモード（5秒ごとに切り替え）
<AffiBanner mode="rotation" interval={5000} />

// ランダムモード（ページ表示時にランダムに1つ表示）
<AffiBanner mode="random" />
```

### プロパティ

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| mode | 'random' \| 'rotation' | 'rotation' | ランダム表示 or ローテーション表示 |
| interval | number | 5000 | ローテーション間隔（ミリ秒） |
| affiliateIds | string[] | undefined | 表示するアフィリエイトID（指定なしは全て表示） |
| width | string | '100%' | 表示幅 |
| height | string | 'auto' | 表示高さ |

### 応用例

```tsx
// 特定のアフィリエイトのみ表示（ランダム）
<AffiBanner
  mode="random"
  affiliateIds={['sample-html-1', 'sample-image-2']}
/>

// 10秒間隔でローテーション
<AffiBanner mode="rotation" interval={10000} />

// サイズ指定
<AffiBanner
  mode="rotation"
  width="728px"
  height="90px"
/>
```

## アフィリエイトリンクの管理

アフィリエイトリンクは `src/config/affiliateLinks.json` で管理します。

### JSONファイルの形式

#### HTMLタグ型
```json
{
  "id": "affiliate-1",
  "name": "アフィリエイトA",
  "type": "html",
  "content": "<a href='...'><img src='...' /></a>"
}
```

#### 画像バナー型
```json
{
  "id": "affiliate-2",
  "name": "アフィリエイトB",
  "type": "image",
  "imageUrl": "https://example.com/banner.jpg",
  "linkUrl": "https://affiliate-link.com/...",
  "alt": "バナー広告"
}
```

### アフィリエイトの追加方法

1. `src/config/affiliateLinks.json` を開く
2. 配列に新しいアフィリエイトオブジェクトを追加
3. 保存して再ビルド

### 注意事項

- HTMLタグ型の場合、`dangerouslySetInnerHTML` を使用しているため、信頼できるHTMLのみを記載してください
- 各アフィリエイトには一意の `id` を設定してください
- `type` は `'html'` または `'image'` のいずれかを指定してください

## 表示例

### HomePageでの使用例

```tsx
import { AffiBanner } from '../components/AffiBanner';

// AdBannerの下に配置
<AdBanner slot="1234567890" format="horizontal" />

<Box sx={{ mt: 3 }}>
  <AffiBanner mode="rotation" interval={5000} />
</Box>
```

## セキュリティ

- HTMLタグ型を使用する場合、XSS攻撃を防ぐため、信頼できるソースからのHTMLのみを使用してください
- 外部リンクには `target="_blank"` と `rel="noopener noreferrer"` を設定することを推奨します
