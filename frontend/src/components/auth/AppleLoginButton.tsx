import { useState } from 'react';
import { Button, Alert } from '@mui/material';
import AppleIcon from '@mui/icons-material/Apple';
import { useAuth } from '../../hooks/useAuth';

export const AppleLoginButton = () => {
  const { loginWithApple } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      await loginWithApple();
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
        startIcon={<AppleIcon />}
        onClick={handleLogin}
        fullWidth
        disabled={loading}
        sx={{
          py: 1.5,
          borderColor: '#000',
          color: '#000',
          '&:hover': {
            borderColor: '#000',
            bgcolor: 'rgba(0, 0, 0, 0.04)',
          }
        }}
      >
        {loading ? 'ログイン中...' : 'Appleでログイン'}
      </Button>
    </>
  );
};
