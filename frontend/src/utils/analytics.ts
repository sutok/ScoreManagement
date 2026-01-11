import { logEvent } from 'firebase/analytics';
import { analytics } from '../firebase/config';

/**
 * Analytics event tracking utility
 * Only logs events in production environment
 */

// Custom event names
export const AnalyticsEvents = {
  // Authentication events
  LOGIN: 'login',
  LOGOUT: 'logout',

  // Game events
  GAME_START: 'game_start',
  GAME_COMPLETE: 'game_complete',
  GAME_SAVE: 'game_save',
  GAME_DELETE: 'game_delete',

  // Score events
  STRIKE: 'strike',
  SPARE: 'spare',
  PERFECT_GAME: 'perfect_game',

  // Navigation events
  VIEW_HISTORY: 'view_history',
  VIEW_NEW_GAME: 'view_new_game',
  VIEW_HOME: 'view_home',
} as const;

/**
 * Log a custom event to Firebase Analytics
 */
export const trackEvent = (
  eventName: string,
  params?: Record<string, string | number | boolean>
) => {
  if (!analytics) {
    // Analytics not initialized (development mode)
    console.log('[Analytics]', eventName, params);
    return;
  }

  try {
    logEvent(analytics, eventName, params);
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

/**
 * Track user login
 */
export const trackLogin = (method: string = 'google') => {
  trackEvent(AnalyticsEvents.LOGIN, { method });
};

/**
 * Track user logout
 */
export const trackLogout = () => {
  trackEvent(AnalyticsEvents.LOGOUT);
};

/**
 * Track game start
 */
export const trackGameStart = () => {
  trackEvent(AnalyticsEvents.GAME_START);
};

/**
 * Track game completion
 */
export const trackGameComplete = (totalScore: number, isPerfect: boolean) => {
  trackEvent(AnalyticsEvents.GAME_COMPLETE, {
    total_score: totalScore,
    is_perfect: isPerfect,
  });

  // Also track perfect game separately
  if (isPerfect) {
    trackEvent(AnalyticsEvents.PERFECT_GAME);
  }
};

/**
 * Track game save
 */
export const trackGameSave = (totalScore: number, hasMemo: boolean) => {
  trackEvent(AnalyticsEvents.GAME_SAVE, {
    total_score: totalScore,
    has_memo: hasMemo,
  });
};

/**
 * Track game deletion
 */
export const trackGameDelete = (totalScore: number) => {
  trackEvent(AnalyticsEvents.GAME_DELETE, {
    total_score: totalScore,
  });
};

/**
 * Track strike
 */
export const trackStrike = (frameNumber: number) => {
  trackEvent(AnalyticsEvents.STRIKE, {
    frame_number: frameNumber,
  });
};

/**
 * Track spare
 */
export const trackSpare = (frameNumber: number) => {
  trackEvent(AnalyticsEvents.SPARE, {
    frame_number: frameNumber,
  });
};

/**
 * Track page view
 */
export const trackPageView = (pageName: string) => {
  const eventMap: Record<string, string> = {
    '/': AnalyticsEvents.VIEW_HOME,
    '/new-game': AnalyticsEvents.VIEW_NEW_GAME,
    '/history': AnalyticsEvents.VIEW_HISTORY,
  };

  const eventName = eventMap[pageName] || 'page_view';
  trackEvent(eventName, { page_path: pageName });
};
