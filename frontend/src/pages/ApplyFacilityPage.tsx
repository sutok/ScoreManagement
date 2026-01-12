import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Alert,
  Paper,
  IconButton,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { applyFacility } from '../firebase/facilities';
import { FacilityForm } from '../components/facility/FacilityForm';
import { type Facility } from '../types/facility';

export const ApplyFacilityPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
        throw new Error('ログインが必要です');
      }

      // approved, createdBy フィールドを除外して申請
      const { approved, createdBy, ...dataToSubmit } = facilityData;

      await applyFacility(dataToSubmit, user.uid);

      setSuccess('店舗登録申請を送信しました。承認までお待ちください。');

      // 3秒後にホームページに戻る
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('Error applying for facility:', err);
      setError(
        err instanceof Error
          ? err.message
          : '申請の送信に失敗しました。もう一度お試しください。'
      );
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">ログインが必要です</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/')} aria-label="戻る">
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          店舗登録申請
        </Typography>
      </Box>

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
          <strong>申請について</strong>
        </Typography>
        <Typography variant="body2" component="div">
          <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
            <li>入力した情報は管理者が確認します</li>
            <li>承認されると、施設管理者として登録されます</li>
            <li>承認までに数日かかる場合があります</li>
            <li>
              申請状況はログイン後のホームページで確認できます（承認後）
            </li>
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
