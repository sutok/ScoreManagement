import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import type { AffiliateLink } from '../types/affiliate';
import affiliateLinksData from '../config/affiliateLinks.json';

interface AffiBannerProps {
  mode: 'random' | 'rotation';    // ランダム or ローテーション
  interval?: number;              // ローテーション間隔（ミリ秒、デフォルト5000）
  affiliateIds?: string[];        // 表示するアフィリエイトID（指定なしは全て）
  width?: string;                 // 表示幅
  height?: string;                // 表示高さ
}

export const AffiBanner = ({
  mode = 'rotation',
  interval = 5000,
  affiliateIds,
  width = '100%',
  height = 'auto',
}: AffiBannerProps) => {
  const affiliateLinks = affiliateLinksData as AffiliateLink[];

  // affiliateIdsが指定されている場合はフィルタリング
  const filteredLinks = affiliateIds
    ? affiliateLinks.filter((link) => affiliateIds.includes(link.id))
    : affiliateLinks;

  const [currentLink, setCurrentLink] = useState<AffiliateLink | null>(null);
  const [, setLinkIndex] = useState(0);

  // 初期表示
  useEffect(() => {
    if (filteredLinks.length === 0) {
      setCurrentLink(null);
      return;
    }

    if (mode === 'random') {
      // ランダムモード：ランダムに選択
      const randomIndex = Math.floor(Math.random() * filteredLinks.length);
      setCurrentLink(filteredLinks[randomIndex]);
    } else {
      // ローテーションモード：最初のアフィリエイトを表示
      setCurrentLink(filteredLinks[0]);
      setLinkIndex(0);
    }
  }, [mode, affiliateIds]);

  // ローテーションモード：定期的に切り替え
  useEffect(() => {
    if (mode !== 'rotation' || filteredLinks.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setLinkIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % filteredLinks.length;
        setCurrentLink(filteredLinks[nextIndex]);
        return nextIndex;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [mode, interval, filteredLinks.length]);

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
        // HTMLタグをそのまま表示
        <div
          dangerouslySetInnerHTML={{ __html: currentLink.content || '' }}
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
