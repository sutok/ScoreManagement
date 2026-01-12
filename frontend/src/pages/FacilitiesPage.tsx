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
  getFacilities,
  createFacility,
  updateFacility,
  deleteFacility,
} from '../firebase/facilities';
import { FacilityList } from '../components/facility/FacilityList';
import { FacilityForm } from '../components/facility/FacilityForm';
import { type Facility } from '../types/facility';

export const FacilitiesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getFacilities();
      setFacilities(data);
    } catch (err) {
      console.error('Error loading facilities:', err);
      setError('施設の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFacility = async (
    facilityData: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      await createFacility(facilityData);
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
    if (!window.confirm('この施設を削除しますか？')) {
      return;
    }

    try {
      await deleteFacility(facilityId);
      await loadFacilities();
    } catch (err) {
      console.error('Error deleting facility:', err);
      setError('施設の削除に失敗しました');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingFacility(null);
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
          施設管理
        </Typography>
        {canManageFacilities && (
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
            {editingFacility ? '施設情報の編集' : '新規施設登録'}
            <IconButton onClick={handleCloseForm} aria-label="閉じる">
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
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};
