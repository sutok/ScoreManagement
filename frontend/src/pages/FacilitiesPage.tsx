import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
import { useAuth } from '../hooks/useAuth';
import {
  getFacilities,
  createFacility,
  updateFacility,
  deleteFacility,
} from '../firebase/facilities';
import { addManagedFacility } from '../firebase/roles';
import { FacilityList } from '../components/facility/FacilityList';
import { FacilityForm } from '../components/facility/FacilityForm';
import { type Facility } from '../types/facility';
import { AppHeader } from '../components/AppHeader';
import { PageHeader } from '../components/PageHeader';
import { AdBanner } from '../components/AdBanner';
import { useTranslation } from 'react-i18next';
import { AffiBanner } from '../components/AffiBanner';

export const FacilitiesPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);

  // Get user role from auth context (includes role from /roles collection)
  const userRole = user?.role || 'user';
  const canManageFacilities = userRole === 'admin' || userRole === 'facility_manager';

  // TODO: Get company ID from user data or allow selection
  const companyId = 'default-company'; // This should come from user's company

  // Get unique facility names for facility_manager to choose from
  const existingFacilityNames = Array.from(
    new Set(facilities.map((f) => f.name))
  ).sort();

  useEffect(() => {
    // Only load facilities when user information is available
    if (user) {
      loadFacilities();
    }
  }, [user, userRole]); // Re-run when user or userRole changes

  const loadFacilities = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getFacilities();

      // Filter facilities based on user role
      let filteredData = data;
      if (userRole === 'facility_manager' && user?.facilities) {
        // Facility managers can only see their assigned facilities
        filteredData = data.filter(facility => user.facilities?.includes(facility.id));
      }
      // Admin can see all facilities (no filtering)

      setFacilities(filteredData);
    } catch (err) {
      console.error('Error loading facilities:', err);
      setError(t('facility.list.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFacility = async (
    facilityData: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const newFacilityId = await createFacility(facilityData);

      // If facility_manager created the facility, add it to their managed facilities
      if (userRole === 'facility_manager' && user?.uid) {
        await addManagedFacility(user.uid, newFacilityId);
      }

      setShowForm(false);
      await loadFacilities();
    } catch (err) {
      console.error('Error creating facility:', err);
      throw err;
    }
  };

  const handleUpdateFacility = async (
    facilityData: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!editingFacility) return;

    try {
      await updateFacility(editingFacility.id, facilityData);
      setShowForm(false);
      setEditingFacility(null);
      await loadFacilities();
    } catch (err) {
      console.error('Error updating facility:', err);
      throw err;
    }
  };

  const handleEdit = (facility: Facility) => {
    setEditingFacility(facility);
    setShowForm(true);
  };

  const handleDelete = async (facilityId: string) => {
    if (!window.confirm(t('facility.list.deleteConfirm'))) {
      return;
    }

    try {
      await deleteFacility(facilityId);
      await loadFacilities();
    } catch (err) {
      console.error('Error deleting facility:', err);
      setError(t('facility.list.deleteError'));
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingFacility(null);
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

      {/* Advertisement - Top */}
      <AdBanner slot="9320434668" format="horizontal" />

      <PageHeader
        title={t('facility.list.title')}
        icon="🏢"
        showBackButton
      />

      <AffiBanner key={location.key} />

      {canManageFacilities && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
          >
            {t('facility.list.newButton')}
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

      {/* Facility List */}
      {!loading && (
        <FacilityList
          facilities={facilities}
          onEdit={canManageFacilities ? handleEdit : undefined}
          onDelete={canManageFacilities ? handleDelete : undefined}
          canEdit={canManageFacilities}
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
            {editingFacility ? t('facility.form.editTitle') : t('facility.form.newTitle')}
            <IconButton onClick={handleCloseForm} aria-label={t('facility.list.close')}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FacilityForm
              onSubmit={editingFacility ? handleUpdateFacility : handleCreateFacility}
              onCancel={handleCloseForm}
              companyId={companyId}
              initialData={editingFacility || undefined}
              isEdit={!!editingFacility}
              userRole={userRole}
              existingFacilityNames={existingFacilityNames}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};
