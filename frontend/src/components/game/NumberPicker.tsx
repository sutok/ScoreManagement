import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

interface NumberPickerProps {
  value: number | null;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  disabled?: boolean;
}

export const NumberPicker = ({
  value,
  onChange,
  min = 0,
  max = 10,
  label,
  disabled = false,
}: NumberPickerProps) => {
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

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
              {num}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
