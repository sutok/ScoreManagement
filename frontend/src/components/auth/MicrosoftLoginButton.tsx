import { useState } from 'react';
import { Button, Alert } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

export const MicrosoftLoginButton = () => {
  const { loginWithMicrosoft } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      await loginWithMicrosoft();
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
        variant="outlined"
        onClick={handleLogin}
        fullWidth
        disabled={loading}
        sx={{
          py: 1.5,
          borderColor: '#00A4EF',
          color: '#00A4EF',
          textTransform: 'none',
          '&:hover': {
            borderColor: '#00A4EF',
            bgcolor: 'rgba(0, 164, 239, 0.04)',
          }
        }}
      >
        {loading ? 'ログイン中...' : 'Microsoftアカウントでログイン'}
      </Button>
    </>
  );
};
