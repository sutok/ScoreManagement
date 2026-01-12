import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { ArrowBack, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

interface TournamentDebugInfo {
  id: string;
  title: string;
  levelType: string;
  levelValue: string;
  isActive: boolean;
  facilityId: string;
  createdAt: string;
}

export const DebugTournamentsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tournaments, setTournaments] = useState<TournamentDebugInfo[]>([]);
  const [error, setError] = useState<string>('');
  const [totalCount, setTotalCount] = useState<number>(0);
  const [activeCount, setActiveCount] = useState<number>(0);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      setError('');

      const tournamentsRef = collection(db, 'recurringTournaments');
      const q = query(tournamentsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      console.log('📊 Total documents found:', snapshot.size);

      const tournamentsData: TournamentDebugInfo[] = [];
      let active = 0;

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const level = data.level;
        const isActive = data.isActive === true;

        if (isActive) active++;

        tournamentsData.push({
          id: doc.id,
          title: data.title || '(タイトルなし)',
          levelType: Array.isArray(level) ? 'array' : typeof level,
          levelValue: Array.isArray(level)
            ? `[${level.join(', ')}]`
            : String(level || '(なし)'),
          isActive: isActive,
          facilityId: data.facilityId || '(なし)',
          createdAt: data.createdAt?.toDate?.()?.toLocaleString('ja-JP') || '(不明)',
        });
      });

      setTournaments(tournamentsData);
      setTotalCount(snapshot.size);
      setActiveCount(active);

      console.log('✅ Loaded tournaments:', {
        total: snapshot.size,
        active,
        inactive: snapshot.size - active,
      });
    } catch (err) {
      console.error('❌ Error loading tournaments:', err);
      setError(`データ取得エラー: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/')} aria-label="戻る">
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          試合データデバッグ
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={loadTournaments}
          disabled={loading}
        >
          再読み込み
        </Button>
      </Box>

      {/* Instructions */}
      <Alert severity="info" sx={{ mb: 3 }}>
        このページは試合データの状態を確認するためのデバッグツールです。
        <br />
        「再読み込み」ボタンをクリックしてデータを取得してください。
      </Alert>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary */}
      {!loading && tournaments.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            データサマリー
          </Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Typography>
              <strong>総試合数:</strong> {totalCount}件
            </Typography>
            <Typography>
              <strong>有効:</strong> {activeCount}件
            </Typography>
            <Typography>
              <strong>無効:</strong> {totalCount - activeCount}件
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Results Table */}
      {!loading && tournaments.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>タイトル</TableCell>
                <TableCell>レベル(型)</TableCell>
                <TableCell>レベル(値)</TableCell>
                <TableCell>有効/無効</TableCell>
                <TableCell>施設ID</TableCell>
                <TableCell>作成日時</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tournaments.map((tournament) => (
                <TableRow key={tournament.id}>
                  <TableCell>{tournament.title}</TableCell>
                  <TableCell>{tournament.levelType}</TableCell>
                  <TableCell>{tournament.levelValue}</TableCell>
                  <TableCell>
                    <Typography
                      color={tournament.isActive ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      {tournament.isActive ? '✓ 有効' : '✗ 無効'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {tournament.facilityId}
                    </Typography>
                  </TableCell>
                  <TableCell>{tournament.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* No Data State */}
      {!loading && tournaments.length === 0 && !error && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            試合データが見つかりません
          </Typography>
          <Typography variant="body2" color="text.secondary">
            「再読み込み」ボタンをクリックしてデータを取得してください。
          </Typography>
        </Paper>
      )}
    </Container>
  );
};
