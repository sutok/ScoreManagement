import { useEffect } from 'react';
import { Container, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GameForm } from '../components/game/GameForm';
import { trackPageView, trackGameStart } from '../utils/analytics';
import { AppHeader } from '../components/AppHeader';
import { PageHeader } from '../components/PageHeader';

export const NewGamePage = () => {
  const { t } = useTranslation();

  useEffect(() => {
    trackPageView('/new-game');
    trackGameStart();
  }, []);

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <AppHeader />

        <PageHeader
          title={t('newGame.recordNewGame')}
          showBackButton
        />

        <Box sx={{ mt: 3 }}>
          <GameForm />
        </Box>
      </Box>
    </Container>
  );
};
