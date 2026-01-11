# Google Authentication Setup Guide

**Date**: 2026-01-11
**Project**: bowlards
**Status**: ⚠️ Requires Manual Setup

---

## 🎯 Overview

Google Authentication must be enabled in Firebase Console before users can sign in to the production app at https://bowlards.web.app.

---

## 📋 Setup Instructions

### Step 1: Access Firebase Console

1. Open your browser and go to: https://console.firebase.google.com/project/bowlards/authentication/providers
2. Sign in with your Google account (the one that owns the Firebase project)

### Step 2: Enable Google Sign-In Provider

1. You should see the **Sign-in method** tab
2. Click on **Google** in the list of providers
3. Click the **Enable** toggle switch (turn it ON)
4. **Set the Project Support Email**:
   - This is required by Google
   - Select your email address from the dropdown
   - This email will be shown to users in the OAuth consent screen
5. Click **Save**

### Step 3: Verify Configuration

After enabling:
1. The Google provider should show as **Enabled** in the Sign-in providers list
2. You should see your support email listed

---

## 🧪 Testing Google Sign-In

### Test in Production

1. Open https://bowlards.web.app in your browser
2. You should see the login page
3. Click **Googleでログイン** (Sign in with Google)
4. Select your Google account
5. Grant permissions when prompted
6. You should be redirected to the home page

### Expected Behavior

✅ **Success**: User is signed in and redirected to home page
❌ **Failure**: Shows error message (check error tracking in Firebase Analytics)

---

## 📊 Firebase Console URLs

### Quick Links

- **Authentication Providers**: https://console.firebase.google.com/project/bowlards/authentication/providers
- **Users List**: https://console.firebase.google.com/project/bowlards/authentication/users
- **Analytics Events**: https://console.firebase.google.com/project/bowlards/analytics/events
- **Hosting**: https://console.firebase.google.com/project/bowlards/hosting/sites

---

## 🔍 Troubleshooting

### Error: "Invalid OAuth Client"

**Cause**: Google auth provider not enabled
**Fix**: Follow Step 2 above to enable Google provider

### Error: "Project support email required"

**Cause**: Support email not set
**Fix**: Set support email in Step 2, point 4

### Error: "Unauthorized domain"

**Cause**: Production domain not authorized
**Fix**:
1. Go to Authentication → Settings → Authorized domains
2. Add `bowlards.web.app` if not already there
3. Firebase Hosting domains should be auto-added

### Sign-in works locally but not in production

**Cause**: Environment configuration mismatch
**Fix**: Verify `.env.production` has correct Firebase credentials

---

## 📈 Post-Setup Monitoring

### Check Analytics

After enabling and testing:
1. Go to Firebase Analytics → Events
2. Filter for `login` events
3. Verify users are logging in successfully

### Check Error Tracking

1. Go to Firebase Analytics → Events
2. Filter for `error_occurred` events
3. Check if any authentication errors are being logged

---

## ✅ Completion Checklist

- [ ] Access Firebase Console
- [ ] Enable Google sign-in provider
- [ ] Set project support email
- [ ] Save configuration
- [ ] Test login at https://bowlards.web.app
- [ ] Verify user appears in Firebase Authentication users list
- [ ] Check Analytics for `login` event
- [ ] Confirm no authentication errors in error tracking

---

## 🎯 Current Status

**Google Auth Provider**: ⚠️ **Not Enabled** (as of 2026-01-11)

Once enabled, update this document:
- Change status to: ✅ **Enabled**
- Add date enabled
- Note any issues encountered

---

## 📝 Notes

- Google OAuth consent screen configuration is handled automatically by Firebase
- No additional OAuth configuration needed for Firebase Authentication
- Authorized domains are automatically managed by Firebase Hosting
- The app is already fully configured to use Google auth (code implementation complete)
- Only the Firebase Console toggle needs to be enabled

---

**Next Step**: Follow the instructions above to enable Google Authentication in Firebase Console.
