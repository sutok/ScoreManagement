# 🔍 Error Tracking and Monitoring

**Implementation Date**: 2026-01-11
**Status**: ✅ Live and Monitoring
**Live URL**: https://bowlards.web.app

---

## 🎯 Overview

Comprehensive error tracking and monitoring system has been implemented to capture, log, and analyze errors across the entire application. All errors are automatically tracked in Firebase Analytics for analysis and debugging.

---

## 🔧 Architecture

### Error Tracking Layers

```
┌─────────────────────────────────────────┐
│     Global Error Handlers               │
│  (window.onerror, unhandledrejection)  │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│      React Error Boundary               │
│   (Component tree error catching)       │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│   Application Error Tracking            │
│  (Auth, Firestore, Validation, etc.)    │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│     Error Tracking Utility              │
│  (Categorization, severity, context)    │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│     Firebase Analytics                  │
│     (Production logging)                │
└─────────────────────────────────────────┘
```

---

## 📦 Components

### 1. Error Tracking Utility

**File**: `frontend/src/utils/errorTracking.ts`

**Purpose**: Central error tracking with categorization and severity levels

**Error Categories**:
- `authentication` - Login/logout failures
- `firestore` - Database operation errors
- `validation` - Input validation failures
- `network` - Network request failures
- `react` - React component errors
- `javascript` - Uncaught JavaScript errors
- `promise` - Unhandled promise rejections
- `unknown` - Uncategorized errors

**Severity Levels**:
- `low` - Minor issues, user can continue
- `medium` - Moderate issues, feature affected
- `high` - Serious issues, functionality broken
- `critical` - App-breaking errors

**Key Functions**:
```typescript
// General error tracking
trackError(error, category, severity, context)

// Specific error tracking
trackAuthError(error, context)
trackFirestoreError(error, context)
trackValidationError(error, context)
trackNetworkError(error, context)
trackReactError(error, errorInfo, context)
trackPromiseRejection(reason, context)
trackJavaScriptError(message, source, lineno, colno, error, context)

// Safe execution wrapper
withErrorTracking(asyncFn, category, context)
```

---

### 2. React Error Boundary

**File**: `frontend/src/components/ErrorBoundary.tsx`

**Purpose**: Catch React component errors and display user-friendly fallback UI

**Features**:
- Catches errors in component tree
- Displays friendly error message
- Shows error details in development mode
- Provides recovery actions (reload, go home)
- Automatically tracks errors to Analytics

**User Experience**:
```
┌─────────────────────────────────────┐
│  ⚠️  エラーが発生しました           │
│                                     │
│  申し訳ございません                 │
│                                     │
│  アプリケーションでエラーが          │
│  発生しました。                      │
│                                     │
│  [ ページを再読み込み ]              │
│  [ ホームに戻る ]                   │
└─────────────────────────────────────┘
```

**Implementation**:
```typescript
class ErrorBoundary extends Component {
  componentDidCatch(error, errorInfo) {
    // Track to analytics
    trackReactError(error, errorInfo, { page, action });

    // Update state to show fallback UI
    this.setState({ hasError: true, error, errorInfo });
  }
}
```

---

### 3. Global Error Handlers

**File**: `frontend/src/utils/errorTracking.ts` → `initializeErrorTracking()`

**Purpose**: Capture uncaught errors and unhandled promise rejections

**Handlers**:
1. **window.addEventListener('error')** - JavaScript errors
2. **window.addEventListener('unhandledrejection')** - Promise rejections

**Initialization**:
```typescript
// In main.tsx
initializeErrorTracking();
```

**What Gets Captured**:
- Syntax errors
- Runtime errors
- Network errors in fetch/XHR
- Async errors without try/catch
- Promise rejections without .catch()

---

## 📊 Error Tracking Integration

### Authentication Errors

**File**: `frontend/src/hooks/useAuth.ts`

```typescript
try {
  await signInWithPopup(auth, provider);
  trackLogin('google');
} catch (error) {
  trackAuthError(error, {
    page: window.location.pathname,
    action: 'google_login',
  });
  throw error;
}
```

**Tracked Events**:
- Login failures
- Logout failures

---

### Firestore Errors

**Files**: `frontend/src/components/game/GameForm.tsx`, `frontend/src/pages/HistoryPage.tsx`

```typescript
try {
  await createGame(user.uid, frames, memo);
  trackGameSave(totalScore, !!memo);
} catch (err) {
  trackFirestoreError(err, {
    page: '/new-game',
    action: 'save_game',
    userId: user?.uid,
  });
  setError('ゲームの保存に失敗しました');
}
```

**Tracked Events**:
- Game save failures
- Game load failures
- Game delete failures
- Stats load failures

---

### Validation Errors

**File**: `frontend/src/components/game/GameForm.tsx`

```typescript
const validation = validateAllFrames();
if (!validation.valid) {
  trackValidationError(validation.errors.join('; '), {
    page: '/new-game',
    action: 'validate_frames',
    metadata: { errorCount: validation.errors.length },
  });
  setError(validation.errors.join('\n'));
}
```

**Tracked Events**:
- Frame validation failures
- Game completion check failures

---

## 📈 Analytics Integration

### Event Format

All errors are logged to Firebase Analytics as `error_occurred` events:

```json
{
  "event_name": "error_occurred",
  "error_message": "Authentication failed",
  "error_category": "authentication",
  "error_severity": "high",
  "error_page": "/login",
  "error_action": "google_login",
  "has_stack": true
}
```

### Error Context

Each error includes contextual information:

```typescript
interface ErrorContext {
  userId?: string;        // User ID if available
  page?: string;          // Current page path
  action?: string;        // What action was being performed
  metadata?: {            // Additional context
    [key: string]: unknown;
  };
}
```

---

## 🔍 Development vs Production

### Development Mode

**Behavior**:
- Errors logged to console with full details
- No Analytics events sent
- Stack traces visible
- Component stack visible in Error Boundary

**Console Output**:
```
[Error Tracking] Global error handlers initialized
[authentication] [high] Login failed { context, stack }
[React Error] Error: Something went wrong { componentStack }
```

---

### Production Mode

**Behavior**:
- Errors sent to Firebase Analytics
- Console errors minimized
- User-friendly error messages
- Stack traces hidden from users

**Analytics Events**:
```
error_occurred {
  error_message: "Login failed",
  error_category: "authentication",
  error_severity: "high",
  ...
}
```

---

## 📊 Firebase Console - Error Analytics

### Viewing Errors

**Location**:
```
https://console.firebase.google.com/project/bowlards/analytics/events
```

**Filter by**:
- Event name: `error_occurred`
- Error category: `authentication`, `firestore`, etc.
- Error severity: `low`, `medium`, `high`, `critical`
- Error page: `/login`, `/new-game`, `/history`

---

### Error Metrics

**Key Questions**:
1. **Error Rate**: How many errors per 1000 sessions?
2. **Most Common Errors**: Which errors occur most frequently?
3. **Error Categories**: Which systems have the most errors?
4. **Pages with Errors**: Which pages are error-prone?
5. **User Impact**: How many users experience errors?

**Custom Queries**:
```sql
-- Most common error messages
SELECT error_message, COUNT(*) as count
FROM analytics_events
WHERE event_name = 'error_occurred'
GROUP BY error_message
ORDER BY count DESC
LIMIT 10

-- Errors by category
SELECT error_category, error_severity, COUNT(*) as count
FROM analytics_events
WHERE event_name = 'error_occurred'
GROUP BY error_category, error_severity

-- Error rate by page
SELECT error_page, COUNT(*) as errors
FROM analytics_events
WHERE event_name = 'error_occurred'
GROUP BY error_page
```

---

## 🧪 Testing Error Tracking

### Manual Testing

**Authentication Errors**:
1. Disable Google Sign-In in Firebase Console
2. Try to log in
3. ✅ Error should be tracked with category: `authentication`

**Validation Errors**:
1. Enter invalid frame data (e.g., 11 pins)
2. Try to save
3. ✅ Error should be tracked with category: `validation`

**Firestore Errors**:
1. Modify Firestore rules to deny writes
2. Try to save a game
3. ✅ Error should be tracked with category: `firestore`

**React Errors**:
1. Trigger a React error (throw in component)
2. ✅ Error Boundary should catch and display fallback UI
3. ✅ Error should be tracked with category: `react`

**JavaScript Errors**:
1. Cause a JavaScript error (e.g., undefined.property)
2. ✅ Global handler should catch
3. ✅ Error should be tracked with category: `javascript`

**Promise Rejections**:
1. Create unhandled promise rejection
2. ✅ Global handler should catch
3. ✅ Error should be tracked with category: `promise`

---

### Automated Testing

**Test Error Boundary**:
```typescript
// Test that ErrorBoundary catches and logs errors
it('catches component errors', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
});
```

---

## 📁 Files Modified

### New Files

1. **`frontend/src/utils/errorTracking.ts`**
   - Central error tracking utility
   - Error categorization and severity
   - Firebase Analytics integration
   - Global error handlers

2. **`frontend/src/components/ErrorBoundary.tsx`**
   - React Error Boundary component
   - User-friendly error UI
   - Recovery actions

### Modified Files

3. **`frontend/src/main.tsx`**
   - Initialize error tracking
   - Wrap app with ErrorBoundary

4. **`frontend/src/hooks/useAuth.ts`**
   - Track authentication errors

5. **`frontend/src/components/game/GameForm.tsx`**
   - Track validation errors
   - Track Firestore save errors

6. **`frontend/src/pages/HistoryPage.tsx`**
   - Track Firestore load errors
   - Track Firestore delete errors

---

## 🎯 Error Recovery Flow

### User Experience

```
┌─────────────────────────────┐
│  User performs action       │
└───────────┬─────────────────┘
            │
            ▼
     ┌──────────────┐
     │ Error occurs │
     └──────┬───────┘
            │
     ┌──────▼────────────────┐
     │ Is it a React error?  │
     └──────┬────────────────┘
            │
    ┌───────┴────────┐
    │ Yes            │ No
    ▼                ▼
┌────────────┐  ┌─────────────────┐
│ Show Error │  │ Show inline     │
│ Boundary   │  │ error message   │
│ UI         │  │ (Alert)         │
└────┬───────┘  └────┬────────────┘
     │               │
     ▼               ▼
┌────────────────────────────────┐
│ Track error to Analytics       │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ User sees error + recovery     │
│ - Reload page                  │
│ - Go home                      │
│ - Try again                    │
└────────────────────────────────┘
```

---

## 📊 Bundle Impact

### Before Error Monitoring
```
dist/assets/index.js         203.91 kB │ gzip:  65.10 kB
```

### After Error Monitoring
```
dist/assets/index.js         207.78 kB │ gzip:  66.55 kB
```

**Impact**:
- Main bundle: +3.87 kB (+1.45 kB gzipped)
- Error Boundary component: ~2 KB
- Error tracking utility: ~2 KB
- **Total increase**: ~1.5 KB gzipped (minimal overhead)

---

## 🔒 Privacy & Security

### Data Collection

**Collected**:
- Error messages (truncated to 100 chars)
- Error categories and severity
- Page where error occurred
- Action being performed
- Whether stack trace exists (boolean)

**NOT Collected**:
- Full stack traces (too large, potentially sensitive)
- User personal information
- Form data or user input
- Authentication tokens
- API keys or secrets

### Security Considerations

1. **Error Message Sanitization**: Messages truncated to prevent leaking sensitive data
2. **Stack Trace Privacy**: Full stack traces only in dev mode, not sent to Analytics
3. **User Context**: Only user ID (Firebase UID), no email or PII
4. **Metadata**: Reviewed to ensure no sensitive data included

---

## 🚀 Deployment Status

**Deployed**: 2026-01-11
**Status**: ✅ Live and monitoring
**Environment**: Production
**URL**: https://bowlards.web.app

### Verification

1. **Check Error Tracking Initialized**:
   - Open DevTools → Console
   - Look for: `[Error Tracking] Global error handlers initialized`

2. **Trigger Test Error** (Dev Mode):
   - Cause a validation error
   - Check console for error tracking logs

3. **View in Firebase Console**:
   - Analytics → Events → `error_occurred`
   - May take 24-48 hours for first data

---

## 📈 Expected Benefits

### For Development

1. **Faster Debugging**:
   - Know which errors occur most frequently
   - Understand error context (page, action, user)
   - Prioritize fixes based on impact

2. **Better Code Quality**:
   - Track validation failures to improve UX
   - Monitor auth errors to improve reliability
   - Identify recurring issues

3. **Proactive Monitoring**:
   - Catch errors before users report them
   - Monitor error rates over time
   - Alert on error spikes

### For Users

1. **Better Error Messages**:
   - User-friendly error UI
   - Clear recovery actions
   - Japanese error messages

2. **Improved Reliability**:
   - Errors logged and fixed quickly
   - Better error handling
   - Graceful degradation

3. **Less Frustration**:
   - Error Boundary prevents white screen
   - Reload and home buttons for recovery
   - Errors don't break entire app

---

## 🎯 Future Enhancements

### Potential Improvements

1. **Error Alerting**:
   - Set up alerts for critical errors
   - Email notifications for error spikes
   - Slack integration for real-time alerts

2. **Error Replay**:
   - Integrate LogRocket or FullStory
   - Session replay for debugging
   - User interaction tracking

3. **Error Aggregation**:
   - Group similar errors
   - Show affected user count
   - Provide error frequency charts

4. **Automatic Recovery**:
   - Retry failed operations automatically
   - Offline queue for Firestore writes
   - Graceful fallbacks

5. **User Feedback**:
   - Allow users to report errors
   - Add feedback form to Error Boundary
   - Include user comments with errors

---

## ✅ Summary

Error tracking and monitoring successfully implemented with:

- ✅ Comprehensive error categorization (8 categories)
- ✅ Severity levels (low, medium, high, critical)
- ✅ React Error Boundary with friendly UI
- ✅ Global error handlers (window.onerror, unhandledrejection)
- ✅ Firebase Analytics integration
- ✅ Development mode console logging
- ✅ Production mode analytics tracking
- ✅ Error context and metadata
- ✅ Privacy-focused (no PII, truncated messages)
- ✅ Minimal bundle impact (+1.5 KB gzipped)

**Next Steps**:
1. Monitor error rates in Firebase Analytics
2. Review error patterns and fix common issues
3. Set up error alerts for critical failures
4. Continuously improve error messages and recovery

---

**Implemented By**: Claude Code
**Status**: ✅ Production Ready
**Documentation**: Complete
**Testing**: Verified
**Bundle Impact**: Minimal (+1.5 KB gzipped)
