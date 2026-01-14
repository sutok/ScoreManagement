import { useState, useEffect, useRef } from 'react';
import type { AffiliateLink } from '../types/affiliate';
import affiliateLinksData from '../config/affiliateLinks.json';

interface AffiBannerProps {
  affiliateIds?: string[];        // 表示するアフィリエイトID（指定なしは全て）
  width?: string;                 // 表示幅
  height?: string;                // 表示高さ
}

export const AffiBanner = ({
  affiliateIds,
  width = '100%',
  height = 'auto',
}: AffiBannerProps) => {
  const affiliateLinks = affiliateLinksData as AffiliateLink[];
  const containerRef = useRef<HTMLDivElement>(null);

  // affiliateIdsが指定されている場合はフィルタリング
  const filteredLinks = affiliateIds
    ? affiliateLinks.filter((link) => affiliateIds.includes(link.id))
    : affiliateLinks;

  const [currentLink, setCurrentLink] = useState<AffiliateLink | null>(null);

  // 初期表示：ランダムに1つ選択
  useEffect(() => {
    if (filteredLinks.length === 0) {
      setCurrentLink(null);
      return;
    }

    // ランダムに選択
    const randomIndex = Math.floor(Math.random() * filteredLinks.length);
    console.log('[AffiBanner] Selected index:', randomIndex);
    setCurrentLink(filteredLinks[randomIndex]);
  }, [filteredLinks]);

  // HTMLタグ型のスクリプトを実行
  useEffect(() => {
    if (!currentLink || currentLink.type !== 'html' || !containerRef.current) {
      return;
    }

    const container = containerRef.current;

    // base64デコード処理（UTF-8対応）
    let htmlContent = currentLink.content || '';
    if (currentLink.encoding === 'base64') {
      try {
        // base64デコード → UTF-8デコード
        const binaryString = atob(htmlContent);
        const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
        htmlContent = new TextDecoder('utf-8').decode(bytes);
        console.log('[AffiBanner] Decoded HTML length:', htmlContent.length);
      } catch (error) {
        console.error('[AffiBanner] Failed to decode base64:', error);
        return;
      }
    }

    // ウィジェットIDを一意の値に置き換え（SPA遷移での重複登録を防止）
    const originalEidMatch = htmlContent.match(/"eid"\s*:\s*"([^"]+)"/);
    if (originalEidMatch) {
      const originalEid = originalEidMatch[1];
      const uniqueEid = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
      console.log(`[AffiBanner] Widget ID: ${originalEid} → ${uniqueEid}`);

      htmlContent = htmlContent.replace(
        new RegExp(`"eid"\\s*:\\s*"${originalEid}"`, 'g'),
        `"eid":"${uniqueEid}"`
      );
      htmlContent = htmlContent.replace(
        new RegExp(`id="msmaflink-${originalEid}"`, 'g'),
        `id="msmaflink-${uniqueEid}"`
      );
    }

    // base64デコードしたHTMLをそのまま挿入
    container.innerHTML = htmlContent;

    // スクリプトタグを実行可能な状態にする
    // innerHTML ではスクリプトが自動実行されないため、手動で再作成が必要
    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');

      // 属性をコピー
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });

      // スクリプトの内容をコピー
      if (oldScript.src) {
        // 外部スクリプト
        newScript.src = oldScript.src;
      } else {
        // インラインスクリプト
        newScript.textContent = oldScript.textContent;
      }

      // 古いスクリプトを新しいスクリプトに置き換え
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

    console.log('[AffiBanner] HTML inserted and scripts activated');

    // クリーンアップ
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [currentLink]);

  // アフィリエイトリンクがない場合は何も表示しない
  if (!currentLink) {
    return null;
  }

  return (
    <div style={{ width, height, textAlign: 'center' }}>
      {currentLink.type === 'html' ? (
        // base64デコードしたHTMLをそのまま代入
        <div ref={containerRef} />
      ) : (
        // 画像バナー表示
        <a
          href={currentLink.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-block', lineHeight: 0 }}
        >
          <img
            src={currentLink.imageUrl}
            alt={currentLink.alt || currentLink.name}
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: 'none',
            }}
          />
        </a>
      )}
    </div>
  );
};
