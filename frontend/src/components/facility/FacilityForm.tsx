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
      setError('施設名を入力してください');
      return false;
    }
    if (!formData.prefecture) {
      setError('都道府県を選択してください');
      return false;
    }
    if (!formData.city.trim()) {
      setError('市区町村を入力してください');
      return false;
    }
    if (!formData.address.trim()) {
      setError('住所を入力してください');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setError('電話番号を入力してください');
      return false;
    }
    if (formData.numberOfLanes < 1 || formData.numberOfLanes > 100) {
      setError('レーン数は1〜100の範囲で入力してください');
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
      setError('施設の保存に失敗しました');
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {isEdit ? '施設情報の編集' : '新規施設登録'}
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
              <InputLabel>施設名</InputLabel>
              <Select
                value={formData.name}
                label="施設名"
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
              label="施設名"
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
              label="施設名"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={isSubmitting}
            />
          )}

          {/* 支店名 */}
          <TextField
            fullWidth
            label="支店名"
            value={formData.branchName}
            onChange={(e) => handleChange('branchName', e.target.value)}
            disabled={isSubmitting}
            placeholder="例: 新宿店、渋谷店"
            helperText="複数店舗がある場合に入力してください（任意）"
          />

          {/* 都道府県・市区町村 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>都道府県</InputLabel>
              <Select
                value={formData.prefecture}
                label="都道府県"
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
              label="市区町村"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              disabled={isSubmitting}
            />
          </Box>

          {/* 住所 */}
          <TextField
            required
            fullWidth
            label="住所"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            disabled={isSubmitting}
            placeholder="例: 中央区銀座1-1-1"
          />

          {/* 電話番号・レーン数 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              required
              fullWidth
              label="電話番号"
              value={formData.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              disabled={isSubmitting}
              placeholder="例: 03-1234-5678"
            />

            <TextField
              required
              fullWidth
              type="number"
              label="レーン数"
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
              label="営業開始時刻"
              value={formData.openTime}
              onChange={(e) => handleChange('openTime', e.target.value)}
              disabled={isSubmitting}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              required
              fullWidth
              type="time"
              label="営業終了時刻"
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
            キャンセル
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : isEdit ? '更新' : '登録'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
