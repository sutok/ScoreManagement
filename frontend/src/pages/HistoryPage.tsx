import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../hooks/useAuth';
import { getGames, deleteGame, getUserStats } from '../firebase/firestore';
import { type Game } from '../types/game';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export const HistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalGames: 0,
    averageScore: 0,
    highScore: 0,
    lowScore: 0,
  });

  const loadGames = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const [gamesData, statsData] = await Promise.all([
        getGames(user.uid),
        getUserStats(user.uid),
      ]);
      setGames(gamesData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load games:', err);
      setError('ゲーム履歴の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, [user]);

  const handleDelete = async (gameId: string) => {
    if (!confirm('このゲームを削除しますか？')) return;

    try {
      await deleteGame(gameId);
      await loadGames(); // Reload games after deletion
    } catch (err) {
      console.error('Failed to delete game:', err);
      setError('ゲームの削除に失敗しました');
    }
  };

  const getScoreColor = (score: number): 'success' | 'primary' | 'info' | 'default' => {
    if (score >= 200) return 'success';
    if (score >= 150) return 'primary';
    if (score >= 100) return 'info';
    return 'default';
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            読み込み中...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 3 }}
        >
          ホームに戻る
        </Button>

        <Typography variant="h4" component="h1" gutterBottom align="center">
          📊 ゲーム履歴
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Statistics */}
        {stats.totalGames > 0 && (
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              統計情報
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 150px' }}>
                <Typography variant="body2" color="text.secondary">
                  総ゲーム数
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {stats.totalGames}
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 150px' }}>
                <Typography variant="body2" color="text.secondary">
                  平均スコア
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {stats.averageScore}
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 150px' }}>
                <Typography variant="body2" color="text.secondary">
                  最高スコア
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {stats.highScore}
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 150px' }}>
                <Typography variant="body2" color="text.secondary">
                  最低スコア
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {stats.lowScore}
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Games List */}
        {games.length === 0 ? (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              まだゲームが記録されていません
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              新しいゲームを記録して、スコアを管理しましょう！
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/new-game')}
              size="large"
            >
              ゲームを記録
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {games.map((game) => (
              <Box key={game.id} sx={{ flex: '1 1 300px', minWidth: '300px', maxWidth: '100%' }}>
                <Card elevation={2}>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {format(game.playedAt, 'yyyy年M月d日(E)', { locale: ja })}
                      </Typography>
                      <Chip
                        label={`${game.totalScore}点`}
                        color={getScoreColor(game.totalScore)}
                        size="small"
                      />
                    </Box>

                    <Typography variant="h4" fontWeight="bold" align="center" sx={{ my: 2 }}>
                      {game.totalScore}
                    </Typography>

                    {game.memo && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {game.memo}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(game.id)}
                    >
                      削除
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};
