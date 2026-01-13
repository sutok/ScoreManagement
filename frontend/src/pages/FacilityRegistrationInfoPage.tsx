import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const FacilityRegistrationInfoPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <StoreIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          {t('facilityRegistrationInfo.title')}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {t('facilityRegistrationInfo.subtitle')}
        </Typography>
      </Box>

      {/* Main Content */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          {t('facilityRegistrationInfo.flowTitle')}
        </Typography>
        <Divider sx={{ my: 2 }} />

        <List>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={t('facilityRegistrationInfo.step1Title')}
              secondary={t('facilityRegistrationInfo.step1Desc')}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={t('facilityRegistrationInfo.step2Title')}
              secondary={t('facilityRegistrationInfo.step2Desc')}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={t('facilityRegistrationInfo.step3Title')}
              secondary={t('facilityRegistrationInfo.step3Desc')}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={t('facilityRegistrationInfo.step4Title')}
              secondary={t('facilityRegistrationInfo.step4Desc')}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={t('facilityRegistrationInfo.step5Title')}
              secondary={t('facilityRegistrationInfo.step5Desc')}
            />
          </ListItem>
        </List>
      </Paper>

      {/* Requirements */}
      <Paper sx={{ p: 4, mb: 3, bgcolor: 'info.light' }}>
        <Typography variant="h6" gutterBottom>
          {t('facilityRegistrationInfo.requirementsTitle')}
        </Typography>
        <Typography variant="body1" component="div">
          <ul style={{ marginTop: 8 }}>
            <li>{t('facilityRegistrationInfo.requirement1')}</li>
            <li>{t('facilityRegistrationInfo.requirement2')}</li>
            <li>{t('facilityRegistrationInfo.requirement3')}</li>
            <li>{t('facilityRegistrationInfo.requirement4')}</li>
            <li>{t('facilityRegistrationInfo.requirement5')}</li>
            <li>{t('facilityRegistrationInfo.requirement6')}</li>
          </ul>
        </Typography>
      </Paper>

      {/* Benefits */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('facilityRegistrationInfo.benefitsTitle')}
        </Typography>
        <Typography variant="body1" component="div">
          <ul style={{ marginTop: 8 }}>
            <li>{t('facilityRegistrationInfo.benefit1')}</li>
            <li>{t('facilityRegistrationInfo.benefit2')}</li>
            <li>{t('facilityRegistrationInfo.benefit3')}</li>
            <li>{t('facilityRegistrationInfo.benefit4')}</li>
          </ul>
        </Typography>
      </Paper>

      {/* CTA Buttons */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/login')}
        >
          {t('facilityRegistrationInfo.loginButton')}
        </Button>
        <Button variant="outlined" size="large" onClick={() => navigate('/')}>
          {t('facilityRegistrationInfo.homeButton')}
        </Button>
      </Box>

      {/* Footer Note */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {t('facilityRegistrationInfo.footer')}
        </Typography>
      </Box>
    </Container>
  );
};
