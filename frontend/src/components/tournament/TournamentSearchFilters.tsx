import { useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Chip,
  type SelectChangeEvent,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { PREFECTURES } from '../../utils/prefectures';
import { type TournamentSearchFilters as SearchFilters } from '../../firebase/tournaments';

interface TournamentSearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
}

export const TournamentSearchFilters = ({ onSearch, onClear }: TournamentSearchFiltersProps) => {
  const { t } = useTranslation();

  const LEVEL_OPTIONS = [
    { value: 'beginner', label: t('tournament.filters.levelBeginner') },
    { value: 'intermediate', label: t('tournament.filters.levelIntermediate') },
    { value: 'advanced', label: t('tournament.filters.levelAdvanced') },
  ];
  const [filters, setFilters] = useState<SearchFilters>({
    prefecture: '',
    city: '',
    minEntryFee: undefined,
    maxEntryFee: undefined,
    level: '',
    isActive: true,
  });

  const handlePrefectureChange = (event: SelectChangeEvent) => {
    setFilters({ ...filters, prefecture: event.target.value, city: '' });
  };

  const handleLevelChange = (event: SelectChangeEvent) => {
    setFilters({ ...filters, level: event.target.value });
  };

  const handleMinFeeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilters({ ...filters, minEntryFee: value ? Number(value) : undefined });
  };

  const handleMaxFeeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilters({ ...filters, maxEntryFee: value ? Number(value) : undefined });
  };

  const handleCityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, city: event.target.value });
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({
      prefecture: '',
      city: '',
      minEntryFee: undefined,
      maxEntryFee: undefined,
      level: '',
      isActive: true,
    });
    onClear();
  };

  const hasActiveFilters =
    filters.prefecture ||
    filters.city ||
    filters.minEntryFee !== undefined ||
    filters.maxEntryFee !== undefined ||
    filters.level;

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('tournament.filters.title')}
      </Typography>

      <Stack spacing={2}>
        {/* Location filters */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>{t('tournament.filters.prefecture')}</InputLabel>
            <Select
              value={filters.prefecture || ''}
              onChange={handlePrefectureChange}
              label={t('tournament.filters.prefecture')}
            >
              <MenuItem value="">
                <em>{t('tournament.filters.all')}</em>
              </MenuItem>
              {PREFECTURES.map((pref) => (
                <MenuItem key={pref} value={pref}>
                  {pref}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label={t('tournament.filters.city')}
            value={filters.city || ''}
            onChange={handleCityChange}
            sx={{ minWidth: 200 }}
            placeholder={t('tournament.filters.cityPlaceholder')}
          />
        </Box>

        {/* Entry fee filters */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('tournament.filters.entryFee')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              type="number"
              label={t('tournament.filters.minFee')}
              value={filters.minEntryFee || ''}
              onChange={handleMinFeeChange}
              sx={{ width: 150 }}
              InputProps={{
                endAdornment: <span>{t('tournament.filters.currency')}</span>,
              }}
            />
            <Typography>〜</Typography>
            <TextField
              type="number"
              label={t('tournament.filters.maxFee')}
              value={filters.maxEntryFee || ''}
              onChange={handleMaxFeeChange}
              sx={{ width: 150 }}
              InputProps={{
                endAdornment: <span>{t('tournament.filters.currency')}</span>,
              }}
            />
          </Box>
        </Box>

        {/* Level filter */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t('tournament.filters.level')}</InputLabel>
          <Select
            value={filters.level || ''}
            onChange={handleLevelChange}
            label={t('tournament.filters.level')}
          >
            <MenuItem value="">
              <em>{t('tournament.filters.all')}</em>
            </MenuItem>
            {LEVEL_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            size="large"
          >
            {t('tournament.filters.search')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleClear}
            disabled={!hasActiveFilters}
          >
            {t('tournament.filters.clear')}
          </Button>
        </Box>

        {/* Active filters display */}
        {hasActiveFilters && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pt: 1 }}>
            {filters.prefecture && (
              <Chip label={t('tournament.filters.filterPrefecture', { value: filters.prefecture })} size="small" />
            )}
            {filters.city && (
              <Chip label={t('tournament.filters.filterCity', { value: filters.city })} size="small" />
            )}
            {filters.minEntryFee !== undefined && (
              <Chip label={t('tournament.filters.filterMinFee', { value: filters.minEntryFee })} size="small" />
            )}
            {filters.maxEntryFee !== undefined && (
              <Chip label={t('tournament.filters.filterMaxFee', { value: filters.maxEntryFee })} size="small" />
            )}
            {filters.level && (
              <Chip
                label={t('tournament.filters.filterLevel', { value: LEVEL_OPTIONS.find(o => o.value === filters.level)?.label })}
                size="small"
              />
            )}
          </Box>
        )}
      </Stack>
    </Paper>
  );
};
