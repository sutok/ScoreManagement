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
    // もしもアフィリエイトのDOM要素のみをクリーンアップ（SPA遷移対策）
    // グローバル変数は保持することで、外部スクリプトのロード状態を検出可能にする
    const msmScript = document.getElementById('msmaflink');
    if (msmScript) {
      msmScript.remove();
    }

    if (filteredLinks.length === 0) {
      setCurrentLink(null);
      return;
    }

    // 乱数の最小値を0、最大値を件数-1に設定してランダムに選択
    const min = 0;
    const max = filteredLinks.length - 1;
    const randomIndex = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log('[AffiBanner] randomIndex:', randomIndex, filteredLinks);
    setCurrentLink(filteredLinks[randomIndex]);
  }, [filteredLinks]); // filteredLinksが変更されたとき再実行

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
      } catch (error) {
        console.error('[AffiBanner] Failed to decode base64:', error);
        return;
      }
    }

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

    // scriptタグを分類（外部スクリプトとインラインスクリプト）
    const externalScripts: HTMLScriptElement[] = [];
    const inlineScripts: HTMLScriptElement[] = [];

    scripts.forEach((script) => {
      if (script.src) {
        externalScripts.push(script);
      } else {
        inlineScripts.push(script);
      }
    });

    // 外部スクリプトを先にロード
    let loadedCount = 0;
    const totalExternal = externalScripts.length;

    const executeInlineScripts = () => {
      // 外部スクリプトのロード完了後、インラインスクリプトを実行
      inlineScripts.forEach((oldScript) => {
        // ウィジェットIDを抽出（もしもアフィリエイト専用）
        const scriptContent = oldScript.textContent || '';
        const eidMatch = scriptContent.match(/"eid"\s*:\s*"([^"]+)"/);

        if (eidMatch) {
          const eid = eidMatch[1];
          const widgetElement = document.getElementById(`msmaflink-${eid}`);

          // ウィジェットが既に登録済みか確認（「リンク」以外のテキストがあれば登録済み）
          if (widgetElement && widgetElement.textContent?.trim() !== 'リンク') {
            console.log(`[AffiBanner] Widget ${eid} already registered, skipping.`);
            return;  // 既に登録済みなのでスキップ
          }
        }

        // スクリプトを実行
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.textContent = oldScript.textContent;
        container.appendChild(newScript);
      });
    };

    if (totalExternal === 0) {
      // 外部スクリプトがない場合は即座に実行
      executeInlineScripts();
    } else {
      // グローバル変数が既に存在する場合（SPA遷移でスクリプトが既にロード済み）
      // もしもアフィリエイトの場合、window.msmaflink が関数として存在するかチェック
      const msmScriptAlreadyLoaded = externalScripts.some((script) =>
        script.src.includes('msmstatic.com')
      ) && typeof window.msmaflink === 'function';

      if (msmScriptAlreadyLoaded) {
        // 既にロード済みの場合は非同期で実行を遅延
        // これにより、スクリプトのパースと初期化完了を確実に待つ
        setTimeout(() => {
          executeInlineScripts();
        }, 0);
      } else {
        // 外部スクリプトをロード
        externalScripts.forEach((oldScript) => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });

          // ロード完了を監視
          newScript.onload = () => {
            loadedCount++;
            if (loadedCount === totalExternal) {
              // 全ての外部スクリプトがロード完了したらインラインスクリプトを実行
              executeInlineScripts();
            }
          };

          // エラーハンドリング
          newScript.onerror = () => {
            console.error('Failed to load script:', oldScript.src);
            loadedCount++;
            if (loadedCount === totalExternal) {
              executeInlineScripts();
            }
          };

          container.appendChild(newScript);
        });
      }
    }

    // クリーンアップ：コンポーネントがアンマウントされたときにコンテナをクリア
    const containerElement = container;
    return () => {
      if (containerElement) {
        containerElement.innerHTML = '';
      }
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
