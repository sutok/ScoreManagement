import { useEffect, useRef } from 'react';
import { Box, Typography, Paper, Slide, Chip } from '@mui/material';
import { type Frame } from '../../types/game';
import { keyframes } from '@mui/system';
import { trackStrike, trackSpare } from '../../utils/analytics';
import { NumberPicker } from './NumberPicker';

interface FrameInputProps {
  frame: Frame;
  onChange: (frame: Frame) => void;
}

export const FrameInput = ({ frame, onChange }: FrameInputProps) => {
  const isFrame10 = frame.frameNumber === 10;
  const prevStrikeRef = useRef(frame.isStrike);
  const prevSpareRef = useRef(frame.isSpare);

  // Track strikes and spares
  useEffect(() => {
    if (frame.isStrike && !prevStrikeRef.current) {
      trackStrike(frame.frameNumber);
    }
    if (frame.isSpare && !frame.isStrike && !prevSpareRef.current) {
      trackSpare(frame.frameNumber);
    }
    prevStrikeRef.current = frame.isStrike;
    prevSpareRef.current = frame.isSpare;
  }, [frame.isStrike, frame.isSpare, frame.frameNumber]);

  // Shine animation for strikes and spares
  const shineAnimation = keyframes`
    0% { box-shadow: 0 0 5px rgba(0, 0, 0, 0.1); }
    50% { box-shadow: 0 0 20px rgba(76, 175, 80, 0.6); }
    100% { box-shadow: 0 0 5px rgba(0, 0, 0, 0.1); }
  `;

  const spareShineAnimation = keyframes`
    0% { box-shadow: 0 0 5px rgba(0, 0, 0, 0.1); }
    50% { box-shadow: 0 0 20px rgba(33, 150, 243, 0.6); }
    100% { box-shadow: 0 0 5px rgba(0, 0, 0, 0.1); }
  `;

  const handleFirstThrowChange = (value: number) => {
    onChange({
      ...frame,
      firstThrow: value,
      // Clear subsequent throws if first throw changes
      secondThrow: null,
      thirdThrow: null,
    });
  };

  const handleSecondThrowChange = (value: number) => {
    onChange({
      ...frame,
      secondThrow: value,
      // Clear third throw if second throw changes
      thirdThrow: null,
    });
  };

  const handleThirdThrowChange = (value: number) => {
    onChange({
      ...frame,
      thirdThrow: value,
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
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: frame.isStrike
          ? `${shineAnimation} 1.5s ease-in-out`
          : frame.isSpare
          ? `${spareShineAnimation} 1.5s ease-in-out`
          : 'none',
        transform: frame.isStrike || frame.isSpare ? 'scale(1.02)' : 'scale(1)',
        '&:hover': {
          transform: 'translateY(-4px) scale(1.02)',
          boxShadow: 4,
        },
      }}
    >
      <Typography variant="h6" gutterBottom align="center">
        {isFrame10 ? '10フレーム' : `${frame.frameNumber}フレーム`}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
        {/* First Throw */}
        <NumberPicker
          label="1投目"
          value={frame.firstThrow}
          onChange={handleFirstThrowChange}
          min={0}
          max={10}
        />

        {/* Second Throw */}
        {!isStrike && shouldShowSecondThrow() && (
          <NumberPicker
            label="2投目"
            value={frame.secondThrow}
            onChange={handleSecondThrowChange}
            min={0}
            max={maxSecondThrow}
            disabled={frame.firstThrow === null}
          />
        )}

        {/* Third Throw (Frame 10 only) */}
        {shouldShowThirdThrow() && (
          <NumberPicker
            label="3投目"
            value={frame.thirdThrow}
            onChange={handleThirdThrowChange}
            min={0}
            max={maxThirdThrow}
            disabled={frame.secondThrow === null}
          />
        )}
      </Box>

      {/* Score Display */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            transition: 'all 0.3s ease',
          }}
        >
          フレームスコア: {frame.frameScore}
        </Typography>
        <Typography
          variant="body1"
          fontWeight="bold"
          sx={{
            transition: 'all 0.3s ease',
            color: frame.cumulativeScore > 0 ? 'primary.main' : 'text.primary',
          }}
        >
          累積スコア: {frame.cumulativeScore}
        </Typography>
        <Slide direction="up" in={frame.isStrike} timeout={300} mountOnEnter unmountOnExit>
          <Chip
            label="ストライク！"
            color="success"
            size="small"
            sx={{ mt: 1, fontWeight: 'bold' }}
          />
        </Slide>
        <Slide direction="up" in={frame.isSpare && !frame.isStrike} timeout={300} mountOnEnter unmountOnExit>
          <Chip
            label="スペア！"
            color="info"
            size="small"
            sx={{ mt: 1, fontWeight: 'bold' }}
          />
        </Slide>
      </Box>
    </Paper>
  );
};
