import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
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
import { AppHeader } from '../components/AppHeader';
import { PageHeader } from '../components/PageHeader';

export const RecurringTournamentsPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

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
    // Only load data when user information is available
    if (user) {
      loadData();
    }
  }, [user, userRole]); // Re-run when user or userRole changes

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [tournamentsData, facilitiesData] = await Promise.all([
        getRecurringTournaments(),
        getFacilities(),
      ]);

      // Filter data based on user role
      let filteredFacilities = facilitiesData;
      let filteredTournaments = tournamentsData;

      if (userRole === 'facility_manager' && user?.facilities) {
        // Facility managers can only see their assigned facilities
        filteredFacilities = facilitiesData.filter(facility =>
          user.facilities?.includes(facility.id)
        );

        // And only tournaments for their facilities
        filteredTournaments = tournamentsData.filter(tournament =>
          user.facilities?.includes(tournament.facilityId)
        );
      }
      // Admin can see all tournaments and facilities (no filtering)

      // Enrich tournaments with facility information
      const enrichedTournaments = filteredTournaments.map((tournament) => {
        const facility = filteredFacilities.find((f) => f.id === tournament.facilityId);
        return {
          ...tournament,
          facilityName: facility?.name,
          facilityLocation: facility ? `${facility.prefecture}${facility.city}` : undefined,
        };
      });

      setTournaments(enrichedTournaments);
      setFacilities(filteredFacilities);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(t('tournament.recurring.loadError'));
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
    if (!window.confirm(t('tournament.recurring.deleteConfirm'))) {
      return;
    }

    try {
      await deleteRecurringTournament(tournamentId);
      await loadData();
    } catch (err) {
      console.error('Error deleting recurring tournament:', err);
      setError(t('tournament.recurring.deleteError'));
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTournament(null);
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">{t('common.loginRequired')}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <AppHeader />

      <PageHeader
        title={t('tournament.recurring.title')}
        icon="📅"
        showBackButton
      />

      {canManageTournaments && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
          >
            {t('tournament.recurring.newButton')}
          </Button>
        </Box>
      )}

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
            {editingTournament ? t('tournament.recurring.editTitle') : t('tournament.recurring.createTitle')}
            <IconButton onClick={handleCloseForm} aria-label={t('tournament.recurring.close')}>
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
