import { logEvent } from 'firebase/analytics';
import { analytics } from '../firebase/config';

/**
 * Error tracking and monitoring utility
 * Captures errors and logs them to Firebase Analytics
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ErrorCategory =
  | 'authentication'
  | 'firestore'
  | 'validation'
  | 'network'
  | 'react'
  | 'javascript'
  | 'promise'
  | 'unknown';

interface ErrorContext {
  userId?: string;
  page?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

interface ErrorDetails {
  message: string;
  stack?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context?: ErrorContext;
}

/**
 * Log error to Firebase Analytics
 */
const logErrorToAnalytics = (details: ErrorDetails) => {
  if (!analytics) {
    // Development mode - log to console with details
    console.error('[Error Tracking]', {
      ...details,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  try {
    // Log to Firebase Analytics
    logEvent(analytics, 'error_occurred', {
      error_message: details.message.substring(0, 100), // Limit length
      error_category: details.category,
      error_severity: details.severity,
      error_page: details.context?.page || 'unknown',
      error_action: details.context?.action || 'unknown',
      has_stack: !!details.stack,
    });
  } catch (error) {
    console.error('Failed to log error to analytics:', error);
  }
};

/**
 * Track general error
 */
export const trackError = (
  error: Error | string,
  category: ErrorCategory = 'unknown',
  severity: ErrorSeverity = 'medium',
  context?: ErrorContext
) => {
  const message = typeof error === 'string' ? error : error.message;
  const stack = typeof error === 'string' ? undefined : error.stack;

  logErrorToAnalytics({
    message,
    stack,
    category,
    severity,
    context,
  });

  // Also log to console in development
  if (import.meta.env.DEV) {
    console.error(`[${category}] [${severity}]`, message, { context, stack });
  }
};

/**
 * Track authentication errors
 */
export const trackAuthError = (error: Error | string, context?: ErrorContext) => {
  trackError(error, 'authentication', 'high', context);
};

/**
 * Track Firestore errors
 */
export const trackFirestoreError = (error: Error | string, context?: ErrorContext) => {
  trackError(error, 'firestore', 'high', context);
};

/**
 * Track validation errors
 */
export const trackValidationError = (error: Error | string, context?: ErrorContext) => {
  trackError(error, 'validation', 'low', context);
};

/**
 * Track network errors
 */
export const trackNetworkError = (error: Error | string, context?: ErrorContext) => {
  trackError(error, 'network', 'medium', context);
};

/**
 * Track React component errors
 */
export const trackReactError = (error: Error, errorInfo: { componentStack?: string }, context?: ErrorContext) => {
  const message = error.message;
  const stack = error.stack;

  logErrorToAnalytics({
    message,
    stack: stack || errorInfo.componentStack,
    category: 'react',
    severity: 'critical',
    context: {
      ...context,
      metadata: {
        componentStack: errorInfo.componentStack?.substring(0, 200),
      },
    },
  });

  // Log to console with full details
  console.error('[React Error]', error, errorInfo);
};

/**
 * Track unhandled promise rejections
 */
export const trackPromiseRejection = (reason: unknown, context?: ErrorContext) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  const stack = reason instanceof Error ? reason.stack : undefined;

  logErrorToAnalytics({
    message,
    stack,
    category: 'promise',
    severity: 'high',
    context,
  });

  console.error('[Unhandled Promise Rejection]', reason);
};

/**
 * Track JavaScript errors
 */
export const trackJavaScriptError = (
  message: string,
  source?: string,
  lineno?: number,
  colno?: number,
  error?: Error,
  context?: ErrorContext
) => {
  const errorMessage = error?.message || message;
  const stack = error?.stack;

  logErrorToAnalytics({
    message: errorMessage,
    stack,
    category: 'javascript',
    severity: 'high',
    context: {
      ...context,
      metadata: {
        source,
        line: lineno,
        column: colno,
      },
    },
  });

  console.error('[JavaScript Error]', { message, source, lineno, colno, error });
};

/**
 * Safely execute a function and track errors
 */
export const withErrorTracking = async <T>(
  fn: () => Promise<T>,
  category: ErrorCategory,
  context?: ErrorContext
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    trackError(
      error instanceof Error ? error : new Error(String(error)),
      category,
      'medium',
      context
    );
    return null;
  }
};

/**
 * Initialize global error handlers
 */
export const initializeErrorTracking = () => {
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    trackJavaScriptError(
      event.message,
      event.filename,
      event.lineno,
      event.colno,
      event.error,
      { page: window.location.pathname }
    );
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    trackPromiseRejection(event.reason, {
      page: window.location.pathname,
      action: 'unhandled_rejection',
    });
  });

  console.log('[Error Tracking] Global error handlers initialized');
};
