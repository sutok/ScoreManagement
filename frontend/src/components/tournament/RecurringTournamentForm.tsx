import { useState, useEffect } from 'react';
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
  FormControlLabel,
  Switch,
  Autocomplete,
  Checkbox,
  FormGroup,
  FormLabel,
} from '@mui/material';
import { type RecurringTournament, type Facility } from '../../types/facility';
import {
  DAYS_OF_WEEK,
  WEEKS_OF_MONTH,
  formatRecurringPattern,
  validateRecurringPattern,
  calculateNextOccurrence,
} from '../../utils/recurringPattern';

interface RecurringTournamentFormProps {
  onSubmit: (tournamentData: Omit<RecurringTournament, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  facilities: Facility[];
  currentUserId: string;
  initialData?: RecurringTournament;
  isEdit?: boolean;
}

export const RecurringTournamentForm = ({
  onSubmit,
  onCancel,
  facilities,
  currentUserId,
  initialData,
  isEdit = false,
}: RecurringTournamentFormProps) => {
  const [formData, setFormData] = useState({
    facilityId: initialData?.facilityId || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    frequency: initialData?.pattern.frequency || 'monthly' as 'monthly' | 'weekly',
    weekOfMonth: initialData?.pattern.weekOfMonth || 3,
    dayOfWeek: initialData?.pattern.dayOfWeek || 3,
    time: initialData?.pattern.time || '19:00',
    entryFee: initialData?.entryFee || 1000,
    levels: (Array.isArray(initialData?.level) ? initialData.level : initialData?.level ? [initialData.level] : ['intermediate']) as ('beginner' | 'intermediate' | 'advanced')[],
    isActive: initialData?.isActive ?? true,
  });

  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextOccurrence, setNextOccurrence] = useState<Date | null>(null);

  // Calculate next occurrence when pattern changes
  useEffect(() => {
    try {
      const pattern = {
        frequency: formData.frequency,
        weekOfMonth: formData.frequency === 'monthly' ? formData.weekOfMonth : undefined,
        dayOfWeek: formData.dayOfWeek,
        time: formData.time,
      };

      const validation = validateRecurringPattern(pattern);
      if (validation.valid) {
        const next = calculateNextOccurrence(pattern);
        setNextOccurrence(next);
      } else {
        setNextOccurrence(null);
      }
    } catch (err) {
      setNextOccurrence(null);
    }
  }, [formData.frequency, formData.weekOfMonth, formData.dayOfWeek, formData.time]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.facilityId) {
      setError('施設を選択してください');
      return false;
    }
    if (!formData.title.trim()) {
      setError('タイトルを入力してください');
      return false;
    }
    if (formData.levels.length === 0) {
      setError('レベルを少なくとも1つ選択してください');
      return false;
    }
    if (formData.entryFee < 0 || formData.entryFee > 100000) {
      setError('参加費は0〜100,000の範囲で入力してください');
      return false;
    }

    const pattern = {
      frequency: formData.frequency,
      weekOfMonth: formData.frequency === 'monthly' ? formData.weekOfMonth : undefined,
      dayOfWeek: formData.dayOfWeek,
      time: formData.time,
    };

    const patternValidation = validateRecurringPattern(pattern);
    if (!patternValidation.valid) {
      setError(patternValidation.error || 'パターンが正しくありません');
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
        facilityId: formData.facilityId,
        title: formData.title,
        description: formData.description,
        pattern: {
          frequency: formData.frequency,
          weekOfMonth: formData.frequency === 'monthly' ? formData.weekOfMonth : undefined,
          dayOfWeek: formData.dayOfWeek,
          time: formData.time,
        },
        entryFee: formData.entryFee,
        level: formData.levels.length === 1 ? formData.levels[0] : formData.levels,
        isActive: formData.isActive,
        createdBy: currentUserId,
      });
    } catch (err) {
      console.error('Error submitting recurring tournament:', err);
      setError('定期開催試合の保存に失敗しました');
      setIsSubmitting(false);
    }
  };

  const patternString = formatRecurringPattern({
    frequency: formData.frequency,
    weekOfMonth: formData.frequency === 'monthly' ? formData.weekOfMonth : undefined,
    dayOfWeek: formData.dayOfWeek,
    time: formData.time,
  });

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {isEdit ? '定期開催試合の編集' : '定期開催試合の登録'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {/* 施設選択 */}
          <Autocomplete
            fullWidth
            options={facilities}
            value={facilities.find((f) => f.id === formData.facilityId) || null}
            onChange={(_, newValue) => {
              handleChange('facilityId', newValue?.id || '');
            }}
            getOptionLabel={(option) =>
              `${option.name}${option.branchName ? ` - ${option.branchName}` : ''} (${option.prefecture}${option.city})`
            }
            disabled={isSubmitting}
            renderInput={(params) => (
              <TextField
                {...params}
                label="開催施設"
                required
                placeholder="施設名で検索..."
              />
            )}
            noOptionsText="該当する施設が見つかりません"
          />

          {/* タイトル */}
          <TextField
            required
            fullWidth
            label="タイトル"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            disabled={isSubmitting}
            placeholder="例: 月例リーグ戦"
          />

          {/* 説明 */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="説明"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            disabled={isSubmitting}
            placeholder="試合の詳細や参加条件など"
          />

          {/* 開催パターン */}
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            開催パターン
          </Typography>

          {/* 頻度 */}
          <FormControl fullWidth required>
            <InputLabel>頻度</InputLabel>
            <Select
              value={formData.frequency}
              label="頻度"
              onChange={(e) => handleChange('frequency', e.target.value)}
              disabled={isSubmitting}
            >
              <MenuItem value="monthly">毎月</MenuItem>
              <MenuItem value="weekly">毎週</MenuItem>
            </Select>
          </FormControl>

          {/* 週（月例の場合のみ） */}
          {formData.frequency === 'monthly' && (
            <FormControl fullWidth required>
              <InputLabel>週</InputLabel>
              <Select
                value={formData.weekOfMonth}
                label="週"
                onChange={(e) => handleChange('weekOfMonth', e.target.value)}
                disabled={isSubmitting}
              >
                {WEEKS_OF_MONTH.map((week) => (
                  <MenuItem key={week.value} value={week.value}>
                    {week.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* 曜日・時刻 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>曜日</InputLabel>
              <Select
                value={formData.dayOfWeek}
                label="曜日"
                onChange={(e) => handleChange('dayOfWeek', e.target.value)}
                disabled={isSubmitting}
              >
                {DAYS_OF_WEEK.map((day, index) => (
                  <MenuItem key={index} value={index}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              required
              fullWidth
              type="time"
              label="開始時刻"
              value={formData.time}
              onChange={(e) => handleChange('time', e.target.value)}
              disabled={isSubmitting}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* パターン表示 */}
          <Alert severity="info">
            <Typography variant="body2">
              開催パターン: {patternString}
            </Typography>
            {nextOccurrence && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                次回開催予定: {nextOccurrence.toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            )}
          </Alert>

          {/* 参加費 */}
          <TextField
            required
            fullWidth
            type="number"
            label="参加費（円）"
            value={formData.entryFee}
            onChange={(e) => handleChange('entryFee', parseInt(e.target.value) || 0)}
            disabled={isSubmitting}
            inputProps={{ min: 0, max: 100000, step: 100 }}
          />

          {/* レベル */}
          <FormControl component="fieldset" required error={formData.levels.length === 0}>
            <FormLabel component="legend">レベル（複数選択可）</FormLabel>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.levels.includes('beginner')}
                    onChange={(e) => {
                      const newLevels = e.target.checked
                        ? [...formData.levels, 'beginner']
                        : formData.levels.filter((l) => l !== 'beginner');
                      handleChange('levels', newLevels);
                    }}
                    disabled={isSubmitting}
                  />
                }
                label="初心者"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.levels.includes('intermediate')}
                    onChange={(e) => {
                      const newLevels = e.target.checked
                        ? [...formData.levels, 'intermediate']
                        : formData.levels.filter((l) => l !== 'intermediate');
                      handleChange('levels', newLevels);
                    }}
                    disabled={isSubmitting}
                  />
                }
                label="中級者"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.levels.includes('advanced')}
                    onChange={(e) => {
                      const newLevels = e.target.checked
                        ? [...formData.levels, 'advanced']
                        : formData.levels.filter((l) => l !== 'advanced');
                      handleChange('levels', newLevels);
                    }}
                    disabled={isSubmitting}
                  />
                }
                label="上級者"
              />
            </FormGroup>
          </FormControl>

          {/* 有効/無効 */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                disabled={isSubmitting}
              />
            }
            label="有効にする"
          />
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
