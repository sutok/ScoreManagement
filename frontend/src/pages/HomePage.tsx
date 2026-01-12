import { useEffect } from 'react';
import { Container, Typography, Box, Button, Paper, Avatar } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import LogoutIcon from '@mui/icons-material/Logout';
import SportsIcon from '@mui/icons-material/Sports';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

export const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    trackPageView('/');
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        {/* Header */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={user?.photoURL || undefined}
                alt={user?.displayName || 'User'}
                sx={{ width: 56, height: 56 }}
              />
              <Box>
                <Typography variant="h5" component="h1">
                  {user?.displayName || 'ユーザー'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              ログアウト
            </Button>
          </Box>
        </Paper>

        {/* Title */}
        <Typography variant="h3" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          🎳 🎱 ボーラード/ボーリングスコア管理
        </Typography>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<SportsIcon />}
            onClick={() => navigate('/new-game')}
            sx={{ py: 2 }}
          >
            新しいゲームを記録
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<HistoryIcon />}
            onClick={() => navigate('/history')}
            sx={{ py: 2 }}
          >
            ゲーム履歴を見る
          </Button>
        </Box>

        {/* Info */}
        <Paper elevation={1} sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            📝 機能一覧
          </Typography>
          <Typography variant="body2" paragraph>
            ✅ Google認証機能
          </Typography>
          <Typography variant="body2" paragraph>
            ⏳ スコア記録機能（実装予定）
          </Typography>
          <Typography variant="body2" paragraph>
            ⏳ ゲーム履歴管理（実装予定）
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};
