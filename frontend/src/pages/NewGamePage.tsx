import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const NewGamePage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 3 }}
        >
          ホームに戻る
        </Button>

        <Typography variant="h4" component="h1" gutterBottom>
          新しいゲームを記録
        </Typography>

        <Paper elevation={2} sx={{ p: 4, mt: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            🚧 実装予定
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            このページではボーリングのスコアを入力・記録できるようになります。
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};
