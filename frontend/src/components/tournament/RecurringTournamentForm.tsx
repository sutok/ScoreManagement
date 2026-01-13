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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
      setError(t('tournament.recurring.errorSelectFacility'));
      return false;
    }
    if (!formData.title.trim()) {
      setError(t('tournament.recurring.errorTitle'));
      return false;
    }
    if (formData.levels.length === 0) {
      setError(t('tournament.recurring.errorLevel'));
      return false;
    }
    if (formData.entryFee < 0 || formData.entryFee > 100000) {
      setError(t('tournament.recurring.errorEntryFee'));
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
      setError(patternValidation.error || t('tournament.recurring.errorPattern'));
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
      setError(t('tournament.recurring.saveError'));
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
        {isEdit ? t('tournament.recurring.editTitle') : t('tournament.recurring.createTitle')}
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
                label={t('tournament.recurring.facilityLabel')}
                required
                placeholder={t('tournament.recurring.facilityPlaceholder')}
              />
            )}
            noOptionsText={t('tournament.recurring.facilityNoOptions')}
          />

          {/* タイトル */}
          <TextField
            required
            fullWidth
            label={t('tournament.recurring.titleLabel')}
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            disabled={isSubmitting}
            placeholder={t('tournament.recurring.titlePlaceholder')}
          />

          {/* 説明 */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t('tournament.recurring.descriptionLabel')}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            disabled={isSubmitting}
            placeholder={t('tournament.recurring.descriptionPlaceholder')}
          />

          {/* 開催パターン */}
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            {t('tournament.recurring.patternTitle')}
          </Typography>

          {/* 頻度 */}
          <FormControl fullWidth required>
            <InputLabel>{t('tournament.recurring.frequencyLabel')}</InputLabel>
            <Select
              value={formData.frequency}
              label={t('tournament.recurring.frequencyLabel')}
              onChange={(e) => handleChange('frequency', e.target.value)}
              disabled={isSubmitting}
            >
              <MenuItem value="monthly">{t('tournament.recurring.frequencyMonthly')}</MenuItem>
              <MenuItem value="weekly">{t('tournament.recurring.frequencyWeekly')}</MenuItem>
            </Select>
          </FormControl>

          {/* 週（月例の場合のみ） */}
          {formData.frequency === 'monthly' && (
            <FormControl fullWidth required>
              <InputLabel>{t('tournament.recurring.weekLabel')}</InputLabel>
              <Select
                value={formData.weekOfMonth}
                label={t('tournament.recurring.weekLabel')}
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
              <InputLabel>{t('tournament.recurring.dayOfWeekLabel')}</InputLabel>
              <Select
                value={formData.dayOfWeek}
                label={t('tournament.recurring.dayOfWeekLabel')}
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
              label={t('tournament.recurring.timeLabel')}
              value={formData.time}
              onChange={(e) => handleChange('time', e.target.value)}
              disabled={isSubmitting}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* パターン表示 */}
          <Alert severity="info">
            <Typography variant="body2">
              {t('tournament.recurring.patternInfo')}: {patternString}
            </Typography>
            {nextOccurrence && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {t('tournament.recurring.nextOccurrence')}: {nextOccurrence.toLocaleString('ja-JP', {
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
            label={t('tournament.recurring.entryFeeLabel')}
            value={formData.entryFee}
            onChange={(e) => handleChange('entryFee', parseInt(e.target.value) || 0)}
            disabled={isSubmitting}
            inputProps={{ min: 0, max: 100000, step: 100 }}
          />

          {/* レベル */}
          <FormControl component="fieldset" required error={formData.levels.length === 0}>
            <FormLabel component="legend">{t('tournament.recurring.levelLabel')}</FormLabel>
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
                label={t('tournament.recurring.levelBeginner')}
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
                label={t('tournament.recurring.levelIntermediate')}
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
                label={t('tournament.recurring.levelAdvanced')}
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
            label={t('tournament.recurring.activeSwitch')}
          />
        </Stack>

        {/* アクションボタン */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t('tournament.recurring.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('tournament.recurring.saving') : isEdit ? t('tournament.recurring.update') : t('tournament.recurring.create')}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
