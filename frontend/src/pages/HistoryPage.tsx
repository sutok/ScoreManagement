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
  Grow,
  Collapse,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { getGames, getFrames, deleteGame, getUserStats } from '../firebase/firestore';
import { type Game } from '../types/game';
import { ScoreBoard } from '../components/game/ScoreBoard';
import { format } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';
import { trackGameDelete, trackPageView, trackEvent } from '../utils/analytics';
import { trackFirestoreError } from '../utils/errorTracking';
import { AppHeader } from '../components/AppHeader';
import { PageHeader } from '../components/PageHeader';
import { AdBanner } from '../components/AdBanner';
import { AffiBanner } from '../components/AffiBanner';

export const HistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
  const [loadingFrames, setLoadingFrames] = useState<string | null>(null);
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
      setError(t('history.loadError'));
      trackFirestoreError(err instanceof Error ? err : new Error('Failed to load games'), {
        page: '/history',
        action: 'load_games',
        userId: user?.uid,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
    trackPageView('/history');
  }, [user]);

  const handleExpandGame = async (gameId: string) => {
    // If clicking the same game, just toggle
    if (expandedGameId === gameId) {
      setExpandedGameId(null);
      return;
    }

    // Find the game in the list
    const game = games.find((g) => g.id === gameId);
    if (!game) return;

    // If game already has frames loaded, just expand
    if (game.frames) {
      setExpandedGameId(gameId);
      trackEvent('view_game_detail', { game_id: gameId, total_score: game.totalScore });
      return;
    }

    // Load frames from Firestore
    try {
      setLoadingFrames(gameId);
      const frames = await getFrames(gameId);

      // Update the game with frames
      setGames((prevGames) =>
        prevGames.map((g) =>
          g.id === gameId ? { ...g, frames } : g
        )
      );

      setExpandedGameId(gameId);
      trackEvent('view_game_detail', { game_id: gameId, total_score: game.totalScore });
    } catch (err) {
      console.error('Failed to load frames:', err);
      setError(t('history.framesLoadError'));
      trackFirestoreError(err instanceof Error ? err : new Error('Failed to load frames'), {
        page: '/history',
        action: 'load_frames',
        userId: user?.uid,
        metadata: { gameId },
      });
    } finally {
      setLoadingFrames(null);
    }
  };

  const handleDelete = async (gameId: string, totalScore: number) => {
    if (!confirm(t('history.deleteConfirm'))) return;

    try {
      await deleteGame(gameId);
      trackGameDelete(totalScore);
      await loadGames(); // Reload games after deletion
    } catch (err) {
      console.error('Failed to delete game:', err);
      setError(t('history.deleteError'));
      trackFirestoreError(err instanceof Error ? err : new Error('Failed to delete game'), {
        page: '/history',
        action: 'delete_game',
        userId: user?.uid,
        metadata: { gameId, totalScore },
      });
    }
  };

  const getScoreColor = (score: number): 'success' | 'primary' | 'info' | 'default' => {
    if (score >= 200) return 'success';
    if (score >= 150) return 'primary';
    if (score >= 100) return 'info';
    return 'default';
  };

  const getDateFormat = () => {
    const lang = i18n.language;
    if (lang === 'ja') {
      return { format: 'yyyy年M月d日(E)', locale: ja };
    }
    // For English, Filipino, Indonesian - use English format
    return { format: 'MMM d, yyyy (EEE)', locale: enUS };
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            {t('history.loading')}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* Advertisement - Top */}
        <AdBanner slot="9320434668" />

        <AppHeader />

        <PageHeader
          title={t('history.title')}
          icon="📊"
          showBackButton
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <AffiBanner />

        {/* Statistics */}
        {stats.totalGames > 0 && (
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {t('history.statistics')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 150px' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('history.totalGames')}
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {stats.totalGames}
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 150px' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('history.averageScore')}
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {stats.averageScore}
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 150px' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('history.highScore')}
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {stats.highScore}
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 150px' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('history.lowScore')}
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {stats.lowScore}
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Advertisement - after statistics */}
        {stats.totalGames > 0 && (
          <AdBanner slot="1234567891" format="horizontal" />
        )}

        {/* Games List */}
        {games.length === 0 ? (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('history.noGamesYet')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {t('history.startRecording')}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/new-game')}
              size="large"
            >
              {t('history.recordGame')}
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {games.flatMap((game, index) => {
              const elements = [
                <Grow
                  in={true}
                  timeout={300 + index * 100}
                  key={game.id}
                >
                  <Box sx={{ flex: '1 1 300px', minWidth: '300px', maxWidth: '100%' }}>
                  <Card
                    elevation={2}
                    sx={{
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: expandedGameId === game.id ? 'none' : 'translateY(-8px)',
                        boxShadow: 6,
                      },
                    }}
                  >
                  <CardContent
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleExpandGame(game.id)}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {format(game.playedAt, getDateFormat().format, { locale: getDateFormat().locale })}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={t('history.points', { score: game.totalScore })}
                          color={getScoreColor(game.totalScore)}
                          size="small"
                        />
                        <IconButton
                          size="small"
                          sx={{
                            transform: expandedGameId === game.id ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s',
                          }}
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      align="center"
                      sx={{
                        my: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          color: 'primary.main',
                        },
                      }}
                    >
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

                  {/* Expanded Detail View */}
                  <Collapse in={expandedGameId === game.id} timeout="auto" unmountOnExit>
                    <CardContent sx={{ pt: 0, bgcolor: 'grey.50' }}>
                      {loadingFrames === game.id ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : game.frames ? (
                        <Box>
                          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                            {t('history.scoreDetail')}
                          </Typography>
                          <ScoreBoard frames={game.frames} />
                        </Box>
                      ) : null}
                    </CardContent>
                  </Collapse>

                  <CardActions>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(game.id, game.totalScore);
                      }}
                    >
                      {t('history.delete')}
                    </Button>
                  </CardActions>
                  </Card>
                </Box>
              </Grow>
              ];

              // 3つごとにAffiBannerを挿入（最後のゲームの後は挿入しない）
              if ((index + 1) % 3 === 0 && index < games.length - 1) {
                elements.push(
                  <Box key={`affi-${index}`} sx={{ flex: '1 1 100%', width: '100%', my: 2 }}>
                    <AffiBanner />
                  </Box>
                );
              }

              return elements;
            })}
          </Box>
        )}
      </Box>
    </Container>
  );
};
