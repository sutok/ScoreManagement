import { useState } from 'react';
import {
  Container,
  Typography,
  Alert,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { applyFacility } from '../firebase/facilities';
import { FacilityForm } from '../components/facility/FacilityForm';
import { type Facility } from '../types/facility';
import { AppHeader } from '../components/AppHeader';
import { PageHeader } from '../components/PageHeader';

export const ApplyFacilityPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // デフォルトのcompanyId（実際の運用では適切な値を設定）
  const DEFAULT_COMPANY_ID = 'default-company-id';

  const handleSubmit = async (
    facilityData: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      setError('');
      setSuccess('');

      if (!user) {
        throw new Error(t('common.loginRequired'));
      }

      // approved, createdBy フィールドを除外して申請
      const { approved, createdBy, ...dataToSubmit } = facilityData;

      await applyFacility(dataToSubmit, user.uid);

      setSuccess(t('facility.apply.success'));

      // 3秒後にホームページに戻る
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('Error applying for facility:', err);
      setError(
        err instanceof Error
          ? err.message
          : t('facility.apply.error')
      );
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">{t('common.loginRequired')}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <AppHeader />

      <PageHeader
        title={t('facility.apply.title')}
        icon="📝"
        showBackButton
      />

      {/* Success Message */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Information */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'info.light' }}>
        <Typography variant="body1" gutterBottom>
          <strong>{t('facility.apply.about')}</strong>
        </Typography>
        <Typography variant="body2" component="div">
          <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
            <li>{t('facility.apply.info1')}</li>
            <li>{t('facility.apply.info2')}</li>
            <li>{t('facility.apply.info3')}</li>
            <li>{t('facility.apply.info4')}</li>
          </ul>
        </Typography>
      </Paper>

      {/* Application Form */}
      {!success && (
        <Paper sx={{ p: 3 }}>
          <FacilityForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            companyId={DEFAULT_COMPANY_ID}
          />
        </Paper>
      )}
    </Container>
  );
};
