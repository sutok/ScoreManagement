import { useState, useEffect } from 'react';
import { type User, signInWithPopup, GoogleAuthProvider, OAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { trackLogin, trackLogout } from '../utils/analytics';
import { trackAuthError } from '../utils/errorTracking';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
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

  return { user, loading, loginWithGoogle, loginWithApple, logout };
};
