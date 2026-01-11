import { useState } from 'react';
import { Button, Alert } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../../hooks/useAuth';

export const GoogleLoginButton = () => {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Login error details:', err);
      const errorCode = err?.code || 'unknown';
      const errorMessage = err?.message || 'ログインに失敗しました';
      setError(`エラー: ${errorCode}\n${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
            {error}
          </pre>
        </Alert>
      )}
      <Button
        variant="contained"
        startIcon={<GoogleIcon />}
        onClick={handleLogin}
        fullWidth
        disabled={loading}
        sx={{ py: 1.5, textTransform: 'none' }}
      >
        {loading ? 'ログイン中...' : 'Googleでログイン'}
      </Button>
    </>
  );
};
