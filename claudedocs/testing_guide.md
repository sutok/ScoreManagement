# Score Recording Testing Guide

## Prerequisites

- Firebase emulator running
- Frontend dev server running
- Browser at http://localhost:5173

## Test Setup

### 1. Start Firebase Emulator

```bash
cd /Users/kazuh/Documents/GitHub/score_management
./start-emulators.sh
```

**Verify emulator is running:**
- Emulator UI: http://localhost:4000
- Should see "Firestore" and "Authentication" tabs

### 2. Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

**Verify dev server:**
- Access http://localhost:5173
- Should redirect to /login page

## Test Scenarios

### Test 1: Authentication Flow

1. Visit http://localhost:5173
2. Click "Googleでログイン" button
3. Emulator shows test account selection
4. Select any test account
5. **Expected**: Redirect to home page with user profile

**Verify:**
- ✅ User name and email displayed
- ✅ Avatar shown (if available)
- ✅ Logout button visible
- ✅ Two action buttons: "新しいゲームを記録", "ゲーム履歴を見る"

### Test 2: Simple Game Recording (All Strikes)

1. Click "新しいゲームを記録"
2. For each frame 1-9:
   - Enter "10" in 1投目
   - Second throw should be disabled (strike)
3. For frame 10:
   - Enter "10" in 1投目
   - Enter "10" in 2投目
   - Enter "10" in 3投目
4. Add memo: "Perfect game test"
5. Click "ゲームを保存"

**Expected Score: 300 (Perfect Game)**

**Verify:**
- ✅ ScoreBoard shows cumulative scores: 30, 60, 90, ..., 300
- ✅ All frames marked as strikes (green background)
- ✅ Perfect game celebration message shown
- ✅ Success message appears
- ✅ Auto-redirect to history page after 2 seconds

### Test 3: Mixed Game Recording

1. Click "新しいゲームを記録"
2. Frame 1: 7, 2 (9 pins, open)
3. Frame 2: 10 (strike)
4. Frame 3: 9, 1 (spare)
5. Frame 4: 8, 1 (9 pins, open)
6. Frame 5: 10 (strike)
7. Frame 6: 10 (strike)
8. Frame 7: 7, 3 (spare)
9. Frame 8: 9, 0 (9 pins, open)
10. Frame 9: 10 (strike)
11. Frame 10: 9, 1, 8 (spare + 8)
4. Add memo: "Practice game"
5. Click "ゲームを保存"

**Expected Score: ~180**

**Verify:**
- ✅ Score calculation correct for each frame
- ✅ Strike bonuses applied correctly
- ✅ Spare bonuses applied correctly
- ✅ Visual indicators: green for strikes, blue for spares
- ✅ Game saved successfully

### Test 4: Validation Testing

1. Click "新しいゲームを記録"
2. Frame 1: Enter 11 in 1投目
   - **Expected**: Should not allow > 10
3. Frame 1: Enter 7 in 1投目, then 5 in 2投目
   - **Expected**: Error message (total > 10)
4. Try to save incomplete game (only frame 1 filled)
   - **Expected**: Error "すべてのフレームを入力してください"
5. Fill all frames correctly and save
   - **Expected**: Success

### Test 5: Game History

1. After saving 2-3 games, click "ゲーム履歴を見る"

**Verify:**
- ✅ Statistics panel shows:
  - Total games count
  - Average score
  - High score
  - Low score
- ✅ Game cards displayed with:
  - Date in Japanese format
  - Score with color coding:
    - Green (>=200)
    - Blue (>=150)
    - Info (>=100)
  - Memo excerpt
- ✅ Delete button on each card

### Test 6: Delete Game

1. On history page, click delete button on a game
2. Confirm deletion
3. **Expected**: Game removed, stats recalculated

**Verify:**
- ✅ Confirmation dialog appears
- ✅ Game removed from list
- ✅ Statistics updated correctly

### Test 7: 10th Frame Special Cases

#### Case A: Strike in frame 10
1. Frame 10: 10, 10, 10
   - **Expected**: All three throws allowed, max 30 points

#### Case B: Spare in frame 10
1. Frame 10: 7, 3, 8
   - **Expected**: Third throw allowed, max 18 points

#### Case C: Open frame in frame 10
1. Frame 10: 7, 2
   - **Expected**: Third throw disabled, max 9 points

### Test 8: Score Calculation Verification

#### Test Case: All Spares (150 expected)
- Frames 1-9: 5, 5 each (spare)
- Frame 10: 5, 5, 5
- **Expected total**: 150

#### Test Case: Alternating (90 expected)
- Odd frames: 9, 0
- Even frames: 0, 9
- Frame 10: 9, 0
- **Expected total**: 90

## Firestore Data Verification

### Check in Emulator UI

1. Open http://localhost:4000
2. Click "Firestore" tab
3. **Verify collections:**

```
games/
  └── {gameId}/
      ├── userId: "test-user-id"
      ├── totalScore: 300
      ├── playedAt: Timestamp
      ├── memo: "Perfect game test"
      └── frames/ (subcollection)
          ├── {frameId}/
          │   ├── frameNumber: 1
          │   ├── firstThrow: 10
          │   ├── secondThrow: null
          │   ├── frameScore: 30
          │   └── cumulativeScore: 30
          └── ... (frames 2-10)
```

### Query Testing

In Emulator UI, try these queries:

```javascript
// Get all games for user
games.where('userId', '==', 'test-user-id').orderBy('playedAt', 'desc')

// Get frames for specific game
games/{gameId}/frames.orderBy('frameNumber', 'asc')
```

## Common Issues

### Issue: "Cannot read property 'uid' of null"
- **Cause**: Not logged in
- **Fix**: Return to /login and sign in

### Issue: Scores not calculating correctly
- **Check**: Score calculator logic in utils/scoreCalculator.ts
- **Verify**: Frame validation rules
- **Debug**: Check browser console for errors

### Issue: Game not saving
- **Check**: Emulator is running (port 8080)
- **Verify**: Network tab shows Firestore requests
- **Debug**: Check Emulator UI for errors

### Issue: Layout issues
- **Verify**: Container maxWidth settings
- **Check**: Flexbox properties in components
- **Test**: Resize browser window

## Next Steps After Testing

1. **UI Improvements:**
   - Add loading spinners
   - Improve mobile responsiveness
   - Add animations for score updates

2. **Feature Enhancements:**
   - Game detail view
   - Statistics charts
   - Export to PDF
   - Share game results

3. **Production Deployment:**
   - Create Firebase project
   - Update environment variables
   - Deploy to Firebase Hosting
   - Enable production Firestore rules

## Test Completion Checklist

- [ ] Authentication works
- [ ] Perfect game (300) calculates correctly
- [ ] Strike bonuses calculate correctly
- [ ] Spare bonuses calculate correctly
- [ ] 10th frame special rules work
- [ ] Validation prevents invalid input
- [ ] Games save to Firestore
- [ ] History page displays games
- [ ] Statistics calculate correctly
- [ ] Delete functionality works
- [ ] Responsive layout works on mobile
- [ ] No console errors
- [ ] Build completes successfully

## Performance Metrics

**Build Output:**
- Bundle size: ~830 KB (compressed: ~259 KB)
- Build time: ~3 seconds
- Dev server startup: <200ms

**Runtime Performance:**
- Initial load: <1s
- Score calculation: <10ms per frame
- Save operation: <500ms
- History load: <300ms

## Browser Compatibility

Tested on:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari
