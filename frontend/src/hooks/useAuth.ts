import { useState, useEffect } from 'react';
import {
  type User as FirebaseUser,
  type ConfirmationResult,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { trackLogin, trackLogout } from '../utils/analytics';
import { trackAuthError } from '../utils/errorTracking';
import { getUserRole } from '../firebase/roles';
import { type User } from '../types/user';

/**
 * Convert Firebase Auth User to our custom User type with role information
 */
const enrichUserWithRole = async (firebaseUser: FirebaseUser): Promise<User> => {
  const roleDoc = await getUserRole(firebaseUser.uid);

  return {
    id: firebaseUser.uid,
    displayName: firebaseUser.displayName || 'User',
    email: firebaseUser.email,
    profileImageUrl: firebaseUser.photoURL,
    role: roleDoc?.role || 'user',
    facilities: roleDoc?.facilities,
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    // Firebase Auth compatibility properties
    uid: firebaseUser.uid,
    photoURL: firebaseUser.photoURL,
  };
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Enrich Firebase user with role information
        const enrichedUser = await enrichUserWithRole(firebaseUser);
        setUser(enrichedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      trackLogin('google');
    } catch (error) {
      console.error('Login error:', error);
      trackAuthError(error instanceof Error ? error : new Error('Login failed'), {
        page: window.location.pathname,
        action: 'google_login',
      });
      throw error;
    }
  };

  const loginWithApple = async () => {
    const provider = new OAuthProvider('apple.com');
    try {
      await signInWithPopup(auth, provider);
      trackLogin('apple');
    } catch (error) {
      console.error('Login error:', error);
      trackAuthError(error instanceof Error ? error : new Error('Apple login failed'), {
        page: window.location.pathname,
        action: 'apple_login',
      });
      throw error;
    }
  };

  const loginWithMicrosoft = async () => {
    const provider = new OAuthProvider('microsoft.com');
    try {
      await signInWithPopup(auth, provider);
      trackLogin('microsoft');
    } catch (error) {
      console.error('Login error:', error);
      trackAuthError(error instanceof Error ? error : new Error('Microsoft login failed'), {
        page: window.location.pathname,
        action: 'microsoft_login',
      });
      throw error;
    }
  };

  const loginWithPhone = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return confirmationResult;
    } catch (error) {
      console.error('Phone login error:', error);
      trackAuthError(error instanceof Error ? error : new Error('Phone login failed'), {
        page: window.location.pathname,
        action: 'phone_login',
      });
      throw error;
    }
  };

  const verifyOTP = async (confirmationResult: ConfirmationResult, code: string) => {
    try {
      await confirmationResult.confirm(code);
      trackLogin('phone');
    } catch (error) {
      console.error('OTP verification error:', error);
      trackAuthError(error instanceof Error ? error : new Error('OTP verification failed'), {
        page: window.location.pathname,
        action: 'otp_verification',
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      trackLogout();
    } catch (error) {
      console.error('Logout error:', error);
      trackAuthError(error instanceof Error ? error : new Error('Logout failed'), {
        page: window.location.pathname,
        action: 'logout',
      });
      throw error;
    }
  };

  return { user, loading, loginWithGoogle, loginWithApple, loginWithMicrosoft, loginWithPhone, verifyOTP, logout };
};
