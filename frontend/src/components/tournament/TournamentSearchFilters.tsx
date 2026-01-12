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
import { PREFECTURES } from '../../utils/prefectures';
import { type TournamentSearchFilters as SearchFilters } from '../../firebase/tournaments';

interface TournamentSearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
}

const LEVEL_OPTIONS = [
  { value: 'beginner', label: '初心者' },
  { value: 'intermediate', label: '中級者' },
  { value: 'advanced', label: '上級者' },
];

export const TournamentSearchFilters = ({ onSearch, onClear }: TournamentSearchFiltersProps) => {
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
        試合検索
      </Typography>

      <Stack spacing={2}>
        {/* Location filters */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>都道府県</InputLabel>
            <Select
              value={filters.prefecture || ''}
              onChange={handlePrefectureChange}
              label="都道府県"
            >
              <MenuItem value="">
                <em>すべて</em>
              </MenuItem>
              {PREFECTURES.map((pref) => (
                <MenuItem key={pref} value={pref}>
                  {pref}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="市区町村"
            value={filters.city || ''}
            onChange={handleCityChange}
            sx={{ minWidth: 200 }}
            placeholder="例: 渋谷区"
          />
        </Box>

        {/* Entry fee filters */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            参加費
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              type="number"
              label="最低料金"
              value={filters.minEntryFee || ''}
              onChange={handleMinFeeChange}
              sx={{ width: 150 }}
              InputProps={{
                endAdornment: <span>円</span>,
              }}
            />
            <Typography>〜</Typography>
            <TextField
              type="number"
              label="最高料金"
              value={filters.maxEntryFee || ''}
              onChange={handleMaxFeeChange}
              sx={{ width: 150 }}
              InputProps={{
                endAdornment: <span>円</span>,
              }}
            />
          </Box>
        </Box>

        {/* Level filter */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>レベル</InputLabel>
          <Select
            value={filters.level || ''}
            onChange={handleLevelChange}
            label="レベル"
          >
            <MenuItem value="">
              <em>すべて</em>
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
            検索
          </Button>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleClear}
            disabled={!hasActiveFilters}
          >
            クリア
          </Button>
        </Box>

        {/* Active filters display */}
        {hasActiveFilters && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pt: 1 }}>
            {filters.prefecture && (
              <Chip label={`都道府県: ${filters.prefecture}`} size="small" />
            )}
            {filters.city && (
              <Chip label={`市区町村: ${filters.city}`} size="small" />
            )}
            {filters.minEntryFee !== undefined && (
              <Chip label={`最低料金: ${filters.minEntryFee}円`} size="small" />
            )}
            {filters.maxEntryFee !== undefined && (
              <Chip label={`最高料金: ${filters.maxEntryFee}円`} size="small" />
            )}
            {filters.level && (
              <Chip
                label={`レベル: ${LEVEL_OPTIONS.find(o => o.value === filters.level)?.label}`}
                size="small"
              />
            )}
          </Box>
        )}
      </Stack>
    </Paper>
  );
};
