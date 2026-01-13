import { Box, Paper, Avatar, Typography, Button, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';

interface AppHeaderProps {
  showBackButton?: boolean;
}

export const AppHeader = ({ showBackButton = false }: AppHeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {showBackButton && (
            <IconButton onClick={handleBack} aria-label={t('common.backToHome')}>
              <ArrowBackIcon />
            </IconButton>
          )}
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
  );
};
