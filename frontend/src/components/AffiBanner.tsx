import { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import type { AffiliateLink } from '../types/affiliate';
import affiliateLinksData from '../config/affiliateLinks.json';

// グローバル変数の型定義（もしもアフィリエイト用）
declare global {
  interface Window {
    msmaflink?: unknown;
    MoshimoAffiliateObject?: string;
  }
}

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
    // もしもアフィリエイトの残骸をクリーンアップ（SPA遷移対策）
    const msmScript = document.getElementById('msmaflink');
    if (msmScript) {
      msmScript.remove();
    }
    if (typeof window.msmaflink !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).msmaflink;
    }
    if (typeof window.MoshimoAffiliateObject !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).MoshimoAffiliateObject;
    }

    if (filteredLinks.length === 0) {
      setCurrentLink(null);
      return;
    }

    // ランダムに選択
    const randomIndex = Math.floor(Math.random() * filteredLinks.length);
    setCurrentLink(filteredLinks[randomIndex]);
  }, [affiliateIds]); // affiliateIdsが変更されたときのみ再実行

  // HTMLタグ型のスクリプトを実行
  useEffect(() => {
    if (!currentLink || currentLink.type !== 'html' || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const htmlContent = currentLink.content || '';

    // コンテナをクリア
    container.innerHTML = '';

    // 一時的なdiv要素を作成してHTMLをパース
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // scriptタグを抽出
    const scripts = Array.from(tempDiv.querySelectorAll('script'));

    // scriptタグ以外のコンテンツを先に追加
    scripts.forEach((script) => script.remove());
    container.appendChild(tempDiv);

    // scriptタグを動的に作成して実行
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');

      // 属性をコピー
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });

      // スクリプトの内容をコピー
      newScript.textContent = oldScript.textContent;

      // DOMに追加（これにより実行される）
      container.appendChild(newScript);
    });

    // クリーンアップ：コンポーネントがアンマウントされたときにコンテナをクリア
    return () => {
      container.innerHTML = '';
    };
  }, [currentLink]);

  // アフィリエイトリンクがない場合は何も表示しない
  if (!currentLink) {
    return null;
  }

  return (
    <Box
      sx={{
        width,
        height,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {currentLink.type === 'html' ? (
        // HTMLタグをスクリプト実行付きで表示
        <div
          ref={containerRef}
          style={{ width: '100%', textAlign: 'center' }}
        />
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
    </Box>
  );
};
