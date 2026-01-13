import { useEffect } from 'react';
import { Container, Typography, Box, Button, Paper, Divider } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
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
import { AppHeader } from '../components/AppHeader';
import { AdBanner } from '../components/AdBanner';

export const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Check if user can manage facilities/tournaments
  const userRole = user?.role || 'user';
  const canManage = userRole === 'admin' || userRole === 'facility_manager';

  useEffect(() => {
    trackPageView('/');
  }, []);

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        {/* Header */}
        <AppHeader />

        {/* Title */}
        {/* Advertisement - Top */}
        <AdBanner slot="9320434668" format="horizontal" />

        <Typography gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
            {/* ホーム画面に表示するメインイメージ */}
            <img
              src="/10balls.png"
              alt={t('home.logoAlt')}
              style={{ maxWidth: '7%', height: '7％', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.10)' }}
            />
          {t('home.title')}
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
            color="warning"
          >
            {t('home.tournamentSearch')}
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
                {t('home.facilityManagement')}
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<EventRepeatIcon />}
                onClick={() => navigate('/recurring-tournaments')}
                sx={{ py: 2 }}
              >
                {t('home.recurringTournaments')}
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
                  {t('home.pendingFacilities')}
                </Button>
              )}
            </>
          )}
        </Box>

        {/* Advertisement */}
        <AdBanner slot="1234567890" format="horizontal" />

        {/* Facility Application Link */}
        <Paper elevation={1} sx={{ mt: 4, p: 3, bgcolor: 'background.default' }}>
          <Divider sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t('home.forFacilityManagers')}
            </Typography>
          </Divider>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('home.facilityManagerDescription')}
            </Typography>
            <Button
              variant="text"
              startIcon={<AddBusinessIcon />}
              component={RouterLink}
              to="/apply-facility"
              sx={{ mt: 1 }}
            >
              {t('home.applyFacility')}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
