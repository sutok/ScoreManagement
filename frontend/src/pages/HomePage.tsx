import { useEffect } from 'react';
import { Container, Typography, Box, Button, Paper, Avatar, Link, Divider } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import LogoutIcon from '@mui/icons-material/Logout';
import SportsIcon from '@mui/icons-material/Sports';
import HistoryIcon from '@mui/icons-material/History';
import StoreIcon from '@mui/icons-material/Store';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import SearchIcon from '@mui/icons-material/Search';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { trackPageView } from '../utils/analytics';
import { LanguageSelector } from '../components/LanguageSelector';

export const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Check if user can manage facilities/tournaments
  const userRole = user?.role || 'user';
  const canManage = userRole === 'admin' || userRole === 'facility_manager';

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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={user?.photoURL || undefined}
                alt={user?.displayName || 'User'}
                sx={{ width: 56, height: 56 }}
              />
              <Box>
                <Typography variant="h5" component="h1">
                  {t('home.welcome', { name: user?.displayName || 'User' })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <LanguageSelector />
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                {t('auth.logout')}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Title */}
        <Typography variant="h3" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          🎳 {t('home.title')}
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
            {t('home.newGame')}
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<HistoryIcon />}
            onClick={() => navigate('/history')}
            sx={{ py: 2 }}
          >
            {t('home.viewHistory')}
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<SearchIcon />}
            onClick={() => navigate('/tournament-search')}
            sx={{ py: 2 }}
          >
            試合検索
          </Button>

          {/* Management buttons - only for admin and facility_manager */}
          {canManage && (
            <>
              <Button
                variant="outlined"
                size="large"
                startIcon={<StoreIcon />}
                onClick={() => navigate('/facilities')}
                sx={{ py: 2 }}
              >
                施設管理
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<EventRepeatIcon />}
                onClick={() => navigate('/recurring-tournaments')}
                sx={{ py: 2 }}
              >
                定期開催試合管理
              </Button>
              {/* Admin only: Pending facilities */}
              {userRole === 'admin' && (
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<PendingActionsIcon />}
                  onClick={() => navigate('/pending-facilities')}
                  sx={{ py: 2 }}
                  color="warning"
                >
                  申請中店舗一覧
                </Button>
              )}
            </>
          )}
        </Box>

        {/* Facility Application Link */}
        <Paper elevation={1} sx={{ mt: 4, p: 3, bgcolor: 'background.default' }}>
          <Divider sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              店舗管理者の方へ
            </Typography>
          </Divider>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              ボウリング場を運営されている方は、施設管理者として登録できます
            </Typography>
            <Button
              variant="text"
              startIcon={<AddBusinessIcon />}
              component={RouterLink}
              to="/apply-facility"
              sx={{ mt: 1 }}
            >
              店舗登録申請はこちら
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
