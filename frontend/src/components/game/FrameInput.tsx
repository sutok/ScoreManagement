import { Box, TextField, Typography, Paper } from '@mui/material';
import { type Frame } from '../../types/game';

interface FrameInputProps {
  frame: Frame;
  onChange: (frame: Frame) => void;
}

export const FrameInput = ({ frame, onChange }: FrameInputProps) => {
  const isFrame10 = frame.frameNumber === 10;

  const handleFirstThrowChange = (value: string) => {
    const numValue = value === '' ? null : parseInt(value, 10);
    onChange({
      ...frame,
      firstThrow: numValue,
      // Clear subsequent throws if first throw changes
      secondThrow: null,
      thirdThrow: null,
    });
  };

  const handleSecondThrowChange = (value: string) => {
    const numValue = value === '' ? null : parseInt(value, 10);
    onChange({
      ...frame,
      secondThrow: numValue,
      // Clear third throw if second throw changes
      thirdThrow: null,
    });
  };

  const handleThirdThrowChange = (value: string) => {
    const numValue = value === '' ? null : parseInt(value, 10);
    onChange({
      ...frame,
      thirdThrow: numValue,
    });
  };

  const getSecondThrowMax = (): number => {
    if (isFrame10) {
      return frame.firstThrow === 10 ? 10 : (10 - (frame.firstThrow ?? 0));
    }
    return frame.firstThrow === 10 ? 0 : (10 - (frame.firstThrow ?? 0));
  };

  const getThirdThrowMax = (): number => {
    if (!isFrame10) return 0;

    // First throw was a strike
    if (frame.firstThrow === 10) {
      // Second throw was also a strike
      if (frame.secondThrow === 10) {
        return 10;
      }
      // Second throw was not a strike
      return 10 - (frame.secondThrow ?? 0);
    }

    // First throw was not a strike but got a spare
    if (frame.firstThrow !== null && frame.secondThrow !== null &&
        frame.firstThrow + frame.secondThrow === 10) {
      return 10;
    }

    return 0;
  };

  const shouldShowSecondThrow = (): boolean => {
    if (frame.firstThrow === null) return false;
    return true;
  };

  const shouldShowThirdThrow = (): boolean => {
    if (!isFrame10) return false;
    if (frame.firstThrow === null || frame.secondThrow === null) return false;

    // Strike in first throw
    if (frame.firstThrow === 10) return true;

    // Spare
    if (frame.firstThrow + frame.secondThrow === 10) return true;

    return false;
  };

  const isStrike = frame.firstThrow === 10 && !isFrame10;
  const maxSecondThrow = getSecondThrowMax();
  const maxThirdThrow = getThirdThrowMax();

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        bgcolor: frame.isStrike ? 'success.light' : frame.isSpare ? 'info.light' : 'background.paper',
        border: 2,
        borderColor: frame.isStrike ? 'success.main' : frame.isSpare ? 'info.main' : 'divider',
      }}
    >
      <Typography variant="h6" gutterBottom align="center">
        {isFrame10 ? '10フレーム' : `${frame.frameNumber}フレーム`}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
        {/* First Throw */}
        <TextField
          label="1投目"
          type="number"
          value={frame.firstThrow ?? ''}
          onChange={(e) => handleFirstThrowChange(e.target.value)}
          inputProps={{ min: 0, max: 10, step: 1 }}
          sx={{ width: 80 }}
          size="small"
        />

        {/* Second Throw */}
        {!isStrike && shouldShowSecondThrow() && (
          <TextField
            label="2投目"
            type="number"
            value={frame.secondThrow ?? ''}
            onChange={(e) => handleSecondThrowChange(e.target.value)}
            inputProps={{ min: 0, max: maxSecondThrow, step: 1 }}
            sx={{ width: 80 }}
            size="small"
            disabled={frame.firstThrow === null}
          />
        )}

        {/* Third Throw (Frame 10 only) */}
        {shouldShowThirdThrow() && (
          <TextField
            label="3投目"
            type="number"
            value={frame.thirdThrow ?? ''}
            onChange={(e) => handleThirdThrowChange(e.target.value)}
            inputProps={{ min: 0, max: maxThirdThrow, step: 1 }}
            sx={{ width: 80 }}
            size="small"
            disabled={frame.secondThrow === null}
          />
        )}
      </Box>

      {/* Score Display */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          フレームスコア: {frame.frameScore}
        </Typography>
        <Typography variant="body1" fontWeight="bold">
          累積スコア: {frame.cumulativeScore}
        </Typography>
        {frame.isStrike && (
          <Typography variant="caption" color="success.main" fontWeight="bold">
            ストライク！
          </Typography>
        )}
        {frame.isSpare && (
          <Typography variant="caption" color="info.main" fontWeight="bold">
            スペア！
          </Typography>
        )}
      </Box>
    </Paper>
  );
};
