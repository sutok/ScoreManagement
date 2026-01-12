import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, ArrowBack, Close as CloseIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  getRecurringTournaments,
  createRecurringTournament,
  updateRecurringTournament,
  deleteRecurringTournament,
} from '../firebase/tournaments';
import { getFacilities } from '../firebase/facilities';
import { RecurringTournamentList } from '../components/tournament/RecurringTournamentList';
import { RecurringTournamentForm } from '../components/tournament/RecurringTournamentForm';
import { type RecurringTournament, type Facility } from '../types/facility';

export const RecurringTournamentsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tournaments, setTournaments] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingTournament, setEditingTournament] = useState<RecurringTournament | null>(null);

  // Get user role from auth context (includes role from /roles collection)
  const userRole = user?.role || 'user';
  const canManageTournaments = userRole === 'admin' || userRole === 'facility_manager';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [tournamentsData, facilitiesData] = await Promise.all([
        getRecurringTournaments(),
        getFacilities(),
      ]);

      // Enrich tournaments with facility information
      const enrichedTournaments = tournamentsData.map((tournament) => {
        const facility = facilitiesData.find((f) => f.id === tournament.facilityId);
        return {
          ...tournament,
          facilityName: facility?.name,
          facilityLocation: facility ? `${facility.prefecture}${facility.city}` : undefined,
        };
      });

      setTournaments(enrichedTournaments);
      setFacilities(facilitiesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = async (
    tournamentData: Omit<RecurringTournament, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      await createRecurringTournament(tournamentData);
      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error('Error creating recurring tournament:', err);
      throw err;
    }
  };

  const handleUpdateTournament = async (
    tournamentData: Omit<RecurringTournament, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!editingTournament) return;

    try {
      await updateRecurringTournament(editingTournament.id, tournamentData);
      setShowForm(false);
      setEditingTournament(null);
      await loadData();
    } catch (err) {
      console.error('Error updating recurring tournament:', err);
      throw err;
    }
  };

  const handleEdit = (tournament: RecurringTournament) => {
    setEditingTournament(tournament);
    setShowForm(true);
  };

  const handleDelete = async (tournamentId: string) => {
    if (!window.confirm('この定期開催試合を削除しますか？')) {
      return;
    }

    try {
      await deleteRecurringTournament(tournamentId);
      await loadData();
    } catch (err) {
      console.error('Error deleting recurring tournament:', err);
      setError('定期開催試合の削除に失敗しました');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTournament(null);
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">ログインが必要です</Alert>
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
          定期開催試合管理
        </Typography>
        {canManageTournaments && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
          >
            新規登録
          </Button>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Tournament List */}
      {!loading && (
        <RecurringTournamentList
          tournaments={tournaments}
          onEdit={canManageTournaments ? handleEdit : undefined}
          onDelete={canManageTournaments ? handleDelete : undefined}
          canEdit={canManageTournaments}
        />
      )}

      {/* Create/Edit Form Dialog */}
      <Dialog
        open={showForm}
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {editingTournament ? '定期開催試合の編集' : '定期開催試合の登録'}
            <IconButton onClick={handleCloseForm} aria-label="閉じる">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <RecurringTournamentForm
              onSubmit={editingTournament ? handleUpdateTournament : handleCreateTournament}
              onCancel={handleCloseForm}
              facilities={facilities}
              currentUserId={user.uid}
              initialData={editingTournament || undefined}
              isEdit={!!editingTournament}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};
