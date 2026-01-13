import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  Alert,
  Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PREFECTURES } from '../../utils/prefectures';
import { type Facility } from '../../types/facility';

interface FacilityFormProps {
  onSubmit: (facilityData: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  companyId: string;
  initialData?: Facility;
  isEdit?: boolean;
  userRole?: string;
  existingFacilityNames?: string[];
}

export const FacilityForm = ({
  onSubmit,
  onCancel,
  companyId,
  initialData,
  isEdit = false,
  userRole = 'user',
  existingFacilityNames = [],
}: FacilityFormProps) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    branchName: initialData?.branchName || '',
    address: initialData?.address || '',
    prefecture: initialData?.prefecture || '',
    city: initialData?.city || '',
    phoneNumber: initialData?.phoneNumber || '',
    openTime: initialData?.businessHours.open || '10:00',
    closeTime: initialData?.businessHours.close || '22:00',
    numberOfLanes: initialData?.numberOfLanes || 12,
  });

  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError(t('facility.form.errorName'));
      return false;
    }
    if (!formData.prefecture) {
      setError(t('facility.form.errorPrefecture'));
      return false;
    }
    if (!formData.city.trim()) {
      setError(t('facility.form.errorCity'));
      return false;
    }
    if (!formData.address.trim()) {
      setError(t('facility.form.errorAddress'));
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setError(t('facility.form.errorPhone'));
      return false;
    }
    if (formData.numberOfLanes < 1 || formData.numberOfLanes > 100) {
      setError(t('facility.form.errorLanes'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit({
        name: formData.name,
        branchName: formData.branchName || undefined,
        address: formData.address,
        prefecture: formData.prefecture,
        city: formData.city,
        phoneNumber: formData.phoneNumber,
        businessHours: {
          open: formData.openTime,
          close: formData.closeTime,
        },
        numberOfLanes: formData.numberOfLanes,
        companyId,
      });
    } catch (err) {
      console.error('Error submitting facility:', err);
      setError(t('facility.form.errorSave'));
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {isEdit ? t('facility.form.editTitle') : t('facility.form.newTitle')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {/* 施設名 */}
          {userRole === 'facility_manager' && !isEdit ? (
            // facility_manager: 新規作成時は既存の施設名から選択
            <FormControl fullWidth required>
              <InputLabel>{t('facility.form.name')}</InputLabel>
              <Select
                value={formData.name}
                label={t('facility.form.name')}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={isSubmitting}
              >
                {existingFacilityNames.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : userRole === 'facility_manager' && isEdit ? (
            // facility_manager: 編集時は読み取り専用
            <TextField
              required
              fullWidth
              label={t('facility.form.name')}
              value={formData.name}
              disabled
              InputProps={{
                readOnly: true,
              }}
            />
          ) : (
            // admin: 自由に入力・編集可能
            <TextField
              required
              fullWidth
              label={t('facility.form.name')}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={isSubmitting}
            />
          )}

          {/* 支店名 */}
          <TextField
            fullWidth
            label={t('facility.form.branchName')}
            value={formData.branchName}
            onChange={(e) => handleChange('branchName', e.target.value)}
            disabled={isSubmitting}
            placeholder={t('facility.form.branchPlaceholder')}
            helperText={t('facility.form.branchHelper')}
          />

          {/* 都道府県・市区町村 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>{t('facility.form.prefecture')}</InputLabel>
              <Select
                value={formData.prefecture}
                label={t('facility.form.prefecture')}
                onChange={(e) => handleChange('prefecture', e.target.value)}
                disabled={isSubmitting}
              >
                {PREFECTURES.map((pref) => (
                  <MenuItem key={pref} value={pref}>
                    {pref}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              required
              fullWidth
              label={t('facility.form.city')}
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              disabled={isSubmitting}
            />
          </Box>

          {/* 住所 */}
          <TextField
            required
            fullWidth
            label={t('facility.form.address')}
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            disabled={isSubmitting}
            placeholder={t('facility.form.addressPlaceholder')}
          />

          {/* 電話番号・レーン数 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              required
              fullWidth
              label={t('facility.form.phoneNumber')}
              value={formData.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              disabled={isSubmitting}
              placeholder={t('facility.form.phonePlaceholder')}
            />

            <TextField
              required
              fullWidth
              type="number"
              label={t('facility.form.numberOfLanes')}
              value={formData.numberOfLanes}
              onChange={(e) => handleChange('numberOfLanes', parseInt(e.target.value) || 0)}
              disabled={isSubmitting}
              inputProps={{ min: 1, max: 100 }}
            />
          </Box>

          {/* 営業時間 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              required
              fullWidth
              type="time"
              label={t('facility.form.openTime')}
              value={formData.openTime}
              onChange={(e) => handleChange('openTime', e.target.value)}
              disabled={isSubmitting}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              required
              fullWidth
              type="time"
              label={t('facility.form.closeTime')}
              value={formData.closeTime}
              onChange={(e) => handleChange('closeTime', e.target.value)}
              disabled={isSubmitting}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Stack>

        {/* アクションボタン */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('facility.form.submitting') : isEdit ? t('facility.form.update') : t('facility.form.submit')}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
