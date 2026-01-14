export interface AffiliateLink {
  id: string;
  name: string;
  type: 'html' | 'image';
  encoding?: 'plain' | 'base64';  // エンコーディング方式（省略時はplain）
  content?: string;      // HTMLタグ全体（typeがhtmlの場合、encodingがbase64の場合はbase64エンコード済み）
  imageUrl?: string;     // 画像URL（typeがimageの場合）
  linkUrl?: string;      // リンクURL（typeがimageの場合）
  alt?: string;          // 画像の代替テキスト（typeがimageの場合）
}
