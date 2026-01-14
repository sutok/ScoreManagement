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
      console.log('[AffiBanner] Skipping script execution:', {
        currentLink: !!currentLink,
        type: currentLink?.type,
        containerExists: !!containerRef.current,
      });
      return;
    }

    const container = containerRef.current;
    console.log('[AffiBanner] Container check:', {
      container: !!container,
      clientWidth: container.clientWidth,
      clientHeight: container.clientHeight,
      offsetParent: !!container.offsetParent,
    });

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

    // ウィジェットIDを一意の値に置き換え（SPA遷移での重複登録を防止）
    const originalEidMatch = htmlContent.match(/"eid"\s*:\s*"([^"]+)"/);
    if (originalEidMatch) {
      const originalEid = originalEidMatch[1];
      // 一意のIDを生成（タイムスタンプ + ランダム文字列）
      const uniqueEid = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
      console.log(`[AffiBanner] Replacing widget ID: ${originalEid} → ${uniqueEid}`);

      // すべての出現箇所を置き換え
      htmlContent = htmlContent.replace(
        new RegExp(`"eid"\\s*:\\s*"${originalEid}"`, 'g'),
        `"eid":"${uniqueEid}"`
      );
      htmlContent = htmlContent.replace(
        new RegExp(`id="msmaflink-${originalEid}"`, 'g'),
        `id="msmaflink-${uniqueEid}"`
      );
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
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.textContent = oldScript.textContent;
        console.log('[AffiBanner] Executing inline script:', oldScript.textContent?.substring(0, 100));
        container.appendChild(newScript);

        // スクリプト実行後、少し待ってからDOM状態を確認
        setTimeout(() => {
          const scriptContent = oldScript.textContent || '';
          const eidMatch = scriptContent.match(/"eid"\s*:\s*"([^"]+)"/);
          if (eidMatch) {
            const eid = eidMatch[1];
            const widgetElement = document.getElementById(`msmaflink-${eid}`);
            console.log(`[AffiBanner] Widget ${eid} DOM check:`, {
              exists: !!widgetElement,
              innerHTML: widgetElement?.innerHTML.substring(0, 200),
              textContent: widgetElement?.textContent,
              childElementCount: widgetElement?.childElementCount,
              clientWidth: widgetElement?.clientWidth,
              clientHeight: widgetElement?.clientHeight,
            });
          }
        }, 1000);
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
        // 既にロード済みの場合は、もしもアフィリエイトの準備完了を待つ
        console.log('[AffiBanner] External script already loaded, waiting for msmaflink to be ready');

        // ポーリングでmsmaflink関数の準備を確認
        let attempts = 0;
        const maxAttempts = 20; // 最大2秒待つ（100ms x 20回）

        const checkAndExecute = () => {
          attempts++;

          // window.msmaflink が呼び出し可能かチェック
          if (typeof window.msmaflink === 'function') {
            console.log(`[AffiBanner] msmaflink is ready (attempt ${attempts}), executing inline scripts`);
            executeInlineScripts();
          } else if (attempts < maxAttempts) {
            // まだ準備できていないので再試行
            console.log(`[AffiBanner] msmaflink not ready yet (attempt ${attempts}/${maxAttempts}), retrying...`);
            setTimeout(checkAndExecute, 100);
          } else {
            // 最大試行回数に達した場合は強制実行
            console.warn('[AffiBanner] msmaflink not ready after max attempts, executing anyway');
            executeInlineScripts();
          }
        };

        // 初回チェックを開始
        setTimeout(checkAndExecute, 100);
      } else {
        // 外部スクリプトをロード
        console.log('[AffiBanner] Loading external scripts:', externalScripts.length);
        externalScripts.forEach((oldScript) => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });

          // ロード完了を監視
          newScript.onload = () => {
            loadedCount++;
            console.log(`[AffiBanner] External script loaded (${loadedCount}/${totalExternal})`);
            if (loadedCount === totalExternal) {
              // 全ての外部スクリプトがロード完了したらインラインスクリプトを実行
              console.log('[AffiBanner] All external scripts loaded, executing inline scripts');
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
