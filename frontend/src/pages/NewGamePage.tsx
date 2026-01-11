import { useEffect } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { GameForm } from '../components/game/GameForm';
import { trackPageView, trackGameStart } from '../utils/analytics';

export const NewGamePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    trackPageView('/new-game');
    trackGameStart();
  }, []);

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 3 }}
        >
          ホームに戻る
        </Button>

        <Typography variant="h4" component="h1" gutterBottom align="center">
          🎳 新しいゲームを記録
        </Typography>

        <Box sx={{ mt: 3 }}>
          <GameForm />
        </Box>
      </Box>
    </Container>
  );
};
