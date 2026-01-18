import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AffiliateLink } from '../types/affiliate';

interface AffiliateState {
  currentAffiliateId: string | null;
  initializeAffiliate: (links: AffiliateLink[]) => void;
  resetAffiliate: () => void;
}

/**
 * アフィリエイト表示管理用のZustand store
 *
 * sessionStorageを使用して、セッション内で同じアフィリエイトを表示
 * - ページ遷移しても同じアフィリエイトが表示される
 * - ブラウザを閉じて再度開くと、新しいアフィリエイトがランダム選択される
 */
export const useAffiliateStore = create<AffiliateState>()(
  persist(
    (set, get) => ({
      currentAffiliateId: null,

      /**
       * アフィリエイトを初期化（セッション開始時または未選択時にランダム選択）
       * @param links 選択可能なアフィリエイトリンクのリスト
       */
      initializeAffiliate: (links: AffiliateLink[]) => {
        const current = get().currentAffiliateId;

        // 既にsessionStorageに保存されている場合は何もしない
        if (current) {
          console.log('[AffiliateStore] Using existing affiliate:', current);
          return;
        }

        // アフィリエイトリンクがない場合は何もしない
        if (links.length === 0) {
          console.log('[AffiliateStore] No affiliate links available');
          return;
        }

        // ランダムに1つ選択
        const randomIndex = Math.floor(Math.random() * links.length);
        const selectedId = links[randomIndex].id;

        console.log('[AffiliateStore] Initialized with random affiliate:', selectedId);
        set({ currentAffiliateId: selectedId });
      },

      /**
       * アフィリエイト選択をリセット（テスト用）
       */
      resetAffiliate: () => {
        console.log('[AffiliateStore] Reset affiliate');
        set({ currentAffiliateId: null });
      },
    }),
    {
      name: 'affiliate-session-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
