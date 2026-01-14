import { Box, Container, Typography, Paper, Link } from '@mui/material';
import { GoogleLoginButton } from '../components/auth/GoogleLoginButton';
// import { AppleLoginButton } from '../components/auth/AppleLoginButton';
import { MicrosoftLoginButton } from '../components/auth/MicrosoftLoginButton';
// import { PhoneLoginButton } from '../components/auth/PhoneLoginButton';
import { LanguageSelector } from '../components/LanguageSelector';
import { useAuth } from '../hooks/useAuth';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AffiBanner } from '../components/AffiBanner';

export const LoginPage = () => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h6">{t('auth.loading')}</Typography>
        </Box>
      </Container>
    );
  }

  if (user) return <Navigate to="/" replace />;

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <LanguageSelector />
          </Box>

          <AffiBanner />

          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ lineHeight: 1.4 }}>
              🎳
            </Typography>
            <Typography variant="h4" component="h2" gutterBottom>
              {t('app.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              {t('app.description')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <GoogleLoginButton />
            <MicrosoftLoginButton />
          </Box>

          {/* Facility Registration Link */}
          <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('login.forFacilityManagers')}
            </Typography>
            <Link
              component={RouterLink}
              to="/facility-registration-info"
              variant="body2"
              sx={{ fontWeight: 'medium' }}
            >
              {t('login.facilityRegistrationInfo')}
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
