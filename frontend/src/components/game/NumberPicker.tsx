import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

type ThrowType = 'first' | 'second' | 'third';

interface NumberPickerProps {
  value: number | null;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  disabled?: boolean;
  throwType?: ThrowType;
}

export const NumberPicker = ({
  value,
  onChange,
  min = 0,
  max = 10,
  label,
  disabled = false,
  throwType = 'first',
}: NumberPickerProps) => {
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  const getDisplayValue = (num: number): string => {
    if (throwType === 'first') {
      if (num === 0) return 'G';
      if (num === 10) return 'X';
      return num.toString();
    }

    if (throwType === 'second') {
      if (num === 0) return '-';
      if (num === max) return '/';
      return num.toString();
    }

    if (throwType === 'third') {
      if (num === 0) return '-';
      if (num === 10) return 'X';
      return num.toString();
    }

    return num.toString();
  };

  return (
    <Box sx={{ textAlign: 'center', minWidth: 100 }}>
      <FormControl fullWidth size="small" disabled={disabled}>
        {label && <InputLabel>{label}</InputLabel>}
        <Select
          value={value ?? ''}
          label={label}
          onChange={(e) => {
            const newValue = e.target.value;
            if (typeof newValue === 'number') {
              onChange(newValue);
            }
          }}
        >
          {value === null && (
            <MenuItem value="">
              <em>選択</em>
            </MenuItem>
          )}
          {numbers.map((num) => (
            <MenuItem key={num} value={num}>
              {getDisplayValue(num)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
