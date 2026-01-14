export interface AffiliateLink {
  id: string;
  name: string;
  type: 'html' | 'image';
  content?: string;      // HTMLタグ全体（typeがhtmlの場合）
  imageUrl?: string;     // 画像URL（typeがimageの場合）
  linkUrl?: string;      // リンクURL（typeがimageの場合）
  alt?: string;          // 画像の代替テキスト（typeがimageの場合）
}
