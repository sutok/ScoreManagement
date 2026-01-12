import { Box, Container, Typography, Paper } from '@mui/material';
import { GoogleLoginButton } from '../components/auth/GoogleLoginButton';
// import { AppleLoginButton } from '../components/auth/AppleLoginButton';
import { MicrosoftLoginButton } from '../components/auth/MicrosoftLoginButton';
// import { PhoneLoginButton } from '../components/auth/PhoneLoginButton';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export const LoginPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h6">読み込み中...</Typography>
        </Box>
      </Container>
    );
  }

  if (user) return <Navigate to="/" replace />;

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              🎳
            </Typography>
            <Typography variant="h4" component="h2" gutterBottom>
              ボーリングスコア管理
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              ゲームのスコアを記録・管理するアプリケーション
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <GoogleLoginButton />
            <MicrosoftLoginButton />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
