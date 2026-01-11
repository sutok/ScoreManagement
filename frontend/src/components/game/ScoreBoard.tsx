import { Box, Paper, Typography } from '@mui/material';
import { type Frame } from '../../types/game';

interface ScoreBoardProps {
  frames: Frame[];
}

export const ScoreBoard = ({ frames }: ScoreBoardProps) => {
  const renderThrow = (value: number | null): string => {
    if (value === null) return '-';
    if (value === 10) return 'X';
    return value.toString();
  };

  const renderFrame = (frame: Frame) => {
    const isFrame10 = frame.frameNumber === 10;

    return (
      <Box key={frame.frameNumber} sx={{ flex: isFrame10 ? '0 0 16%' : '0 0 8%', minWidth: '80px' }}>
        <Paper
          elevation={1}
          sx={{
            p: 1,
            bgcolor: frame.isStrike
              ? 'success.light'
              : frame.isSpare
              ? 'info.light'
              : 'background.paper',
          }}
        >
          {/* Frame Number */}
          <Typography
            variant="caption"
            align="center"
            display="block"
            fontWeight="bold"
          >
            {frame.frameNumber}
          </Typography>

          {/* Throws */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 0.5,
              my: 0.5,
              minHeight: 24,
            }}
          >
            {/* Frame 10 - special layout */}
            {isFrame10 ? (
              <>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  {renderThrow(frame.firstThrow)}
                </Box>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  {renderThrow(frame.secondThrow)}
                </Box>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  {renderThrow(frame.thirdThrow)}
                </Box>
              </>
            ) : (
              <>
                {/* First throw */}
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  {frame.isStrike ? 'X' : renderThrow(frame.firstThrow)}
                </Box>

                {/* Second throw */}
                {!frame.isStrike && (
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {frame.isSpare ? '/' : renderThrow(frame.secondThrow)}
                  </Box>
                )}
              </>
            )}
          </Box>

          {/* Cumulative Score */}
          <Typography
            variant="h6"
            align="center"
            sx={{
              fontWeight: 'bold',
              color: frame.cumulativeScore > 0 ? 'primary.main' : 'text.secondary',
            }}
          >
            {frame.cumulativeScore > 0 ? frame.cumulativeScore : '-'}
          </Typography>
        </Paper>
      </Box>
    );
  };

  const totalScore = frames[9]?.cumulativeScore || 0;

  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
        スコアボード
      </Typography>

      {/* Frames */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {frames.map((frame) => renderFrame(frame))}
      </Box>

      {/* Total Score */}
      <Paper
        elevation={3}
        sx={{
          mt: 2,
          p: 2,
          bgcolor: totalScore === 300 ? 'success.main' : 'primary.main',
          color: 'white',
        }}
      >
        <Typography variant="h4" align="center" fontWeight="bold">
          合計スコア: {totalScore}
        </Typography>
        {totalScore === 300 && (
          <Typography variant="h6" align="center">
            🎉 パーフェクトゲーム！ 🎉
          </Typography>
        )}
      </Paper>
    </Box>
  );
};
