import { Select, MenuItem, Box } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import LanguageIcon from '@mui/icons-material/Language';

const languageOptions = [
  { code: 'ja', flag: '🇯🇵', name: '日本語' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'fil', flag: '🇵🇭', name: 'Filipino' },
  { code: 'id', flag: '🇮🇩', name: 'Bahasa Indonesia' }
];

export const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (event: SelectChangeEvent) => {
    const newLanguage = event.target.value;
    i18n.changeLanguage(newLanguage);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LanguageIcon />
      <Select
        value={i18n.language}
        onChange={handleLanguageChange}
        size="small"
        sx={{
          minWidth: 180,
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }
        }}
      >
        {languageOptions.map((option) => (
          <MenuItem key={option.code} value={option.code}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>{option.flag}</span>
              <span>{option.name}</span>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};
