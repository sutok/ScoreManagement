import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { ArrowBack, Check as CheckIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  getPendingFacilities,
  approveFacility,
} from '../firebase/facilities';
import { type Facility } from '../types/facility';

export const PendingFacilitiesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    facility: Facility | null;
  }>({ open: false, facility: null });

  const userRole = user?.role || 'user';

  useEffect(() => {
    if (user && userRole === 'admin') {
      loadPendingFacilities();
    }
  }, [user, userRole]);

  const loadPendingFacilities = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getPendingFacilities();
      setFacilities(data);
    } catch (err) {
      console.error('Error loading pending facilities:', err);
      setError('申請中の店舗を読み込めませんでした');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (facility: Facility) => {
    setConfirmDialog({ open: true, facility });
  };

  const handleApproveConfirm = async () => {
    const facility = confirmDialog.facility;
    if (!facility || !facility.createdBy) {
      setError('申請者情報が見つかりません');
      return;
    }

    try {
      setApprovingId(facility.id);
      setError('');

      await approveFacility(facility.id, facility.createdBy);

      // Reload the list
      await loadPendingFacilities();

      setConfirmDialog({ open: false, facility: null });
    } catch (err) {
      console.error('Error approving facility:', err);
      setError('承認処理に失敗しました');
    } finally {
      setApprovingId(null);
    }
  };

  const handleDialogClose = () => {
    setConfirmDialog({ open: false, facility: null });
  };

  // Check if user is admin
  if (!user || userRole !== 'admin') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          この機能は管理者のみアクセスできます
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/')} aria-label="戻る">
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          申請中店舗一覧
        </Typography>
        <Button
          variant="outlined"
          onClick={loadPendingFacilities}
          disabled={loading}
        >
          再読み込み
        </Button>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Facilities Table */}
      {!loading && (
        <>
          {facilities.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>施設名</TableCell>
                    <TableCell>支店名</TableCell>
                    <TableCell>都道府県</TableCell>
                    <TableCell>市区町村</TableCell>
                    <TableCell>電話番号</TableCell>
                    <TableCell>レーン数</TableCell>
                    <TableCell>申請日時</TableCell>
                    <TableCell align="center">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {facilities.map((facility) => (
                    <TableRow key={facility.id}>
                      <TableCell>{facility.name}</TableCell>
                      <TableCell>
                        {facility.branchName || (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontStyle: 'italic' }}
                          >
                            なし
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{facility.prefecture}</TableCell>
                      <TableCell>{facility.city}</TableCell>
                      <TableCell>{facility.phoneNumber}</TableCell>
                      <TableCell>{facility.numberOfLanes}</TableCell>
                      <TableCell>
                        {facility.createdAt.toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckIcon />}
                          onClick={() => handleApproveClick(facility)}
                          disabled={approvingId === facility.id}
                        >
                          {approvingId === facility.id ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            '承認'
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                申請中の店舗はありません
              </Typography>
              <Typography variant="body2" color="text.secondary">
                新しい申請があるとここに表示されます
              </Typography>
            </Paper>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleDialogClose}>
        <DialogTitle>店舗登録を承認しますか？</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.facility && (
              <>
                <strong>{confirmDialog.facility.name}</strong>
                {confirmDialog.facility.branchName &&
                  ` - ${confirmDialog.facility.branchName}`}
                <br />
                {confirmDialog.facility.prefecture}
                {confirmDialog.facility.city}
                <br />
                <br />
                承認すると以下の処理が実行されます：
                <ul>
                  <li>施設が承認済みとしてマークされます</li>
                  <li>申請者が施設管理者（facility_manager）になります</li>
                  <li>申請者がこの施設を管理できるようになります</li>
                </ul>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={approvingId !== null}>
            キャンセル
          </Button>
          <Button
            onClick={handleApproveConfirm}
            variant="contained"
            color="success"
            disabled={approvingId !== null}
          >
            承認する
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
