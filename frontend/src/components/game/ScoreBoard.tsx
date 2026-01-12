import { Box, Paper, Typography, Grow, Zoom, Fade } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { type Frame } from '../../types/game';
import { keyframes } from '@mui/system';

interface ScoreBoardProps {
  frames: Frame[];
}

export const ScoreBoard = ({ frames }: ScoreBoardProps) => {
  const { t } = useTranslation();
  // Celebration animation for perfect game
  const celebrationAnimation = keyframes`
    0% { transform: scale(1); }
    25% { transform: scale(1.1) rotate(2deg); }
    50% { transform: scale(1.05) rotate(-2deg); }
    75% { transform: scale(1.1) rotate(2deg); }
    100% { transform: scale(1); }
  `;

  // Pulse animation for score updates
  const pulseAnimation = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); }
  `;

  const renderThrow = (value: number | null): string => {
    if (value === null) return '-';
    if (value === 10) return 'X';
    return value.toString();
  };

  const renderFrame = (frame: Frame) => {
    const isFrame10 = frame.frameNumber === 10;

    return (
      <Grow
        in={true}
        timeout={300 + frame.frameNumber * 50}
        key={frame.frameNumber}
      >
        <Box
          sx={{
            flex: '0 0 auto',
            width: isFrame10 ? '100px' : '80px',
          }}
        >
          <Paper
            elevation={1}
            sx={{
              p: 0,
              bgcolor: frame.isStrike
                ? 'success.light'
                : frame.isSpare
                ? 'info.light'
                : 'background.paper',
              transition: 'all 0.3s ease-in-out',
              height: '100%',
            }}
          >
          {/* Frame Number */}
          <Typography
            variant="caption"
            align="center"
            display="block"
            fontWeight="bold"
            sx={{ fontSize: '0.7rem' }}
          >
            {frame.frameNumber}
          </Typography>

          {/* Throws */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 0.25,
              my: 0.25,
              minHeight: 20,
            }}
          >
            {/* Frame 10 - special layout */}
            {isFrame10 ? (
              <>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                  }}
                >
                  {renderThrow(frame.firstThrow)}
                </Box>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                  }}
                >
                  {renderThrow(frame.secondThrow)}
                </Box>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
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
                    width: 20,
                    height: 20,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                  }}
                >
                  {frame.isStrike ? 'X' : renderThrow(frame.firstThrow)}
                </Box>

                {/* Second throw */}
                {!frame.isStrike && (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
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
            variant="body1"
            align="center"
            sx={{
              fontWeight: 'bold',
              fontSize: '0.9rem',
              color: frame.cumulativeScore > 0 ? 'primary.main' : 'text.secondary',
              animation: frame.cumulativeScore > 0 ? `${pulseAnimation} 0.5s ease-in-out` : 'none',
              transition: 'color 0.3s ease',
              mt: 0.25,
            }}
          >
            {frame.cumulativeScore > 0 ? frame.cumulativeScore : '-'}
          </Typography>
        </Paper>
        </Box>
      </Grow>
    );
  };

  const totalScore = frames[9]?.cumulativeScore || 0;

  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
        {t('scoreBoard.title')}
      </Typography>

      {/* Frames */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0,
          justifyContent: 'flex-start',
        }}
      >
        {frames.map((frame) => renderFrame(frame))}
      </Box>

      {/* Total Score */}
      <Zoom in={totalScore > 0} timeout={500}>
        <Paper
          elevation={3}
          sx={{
            mt: 2,
            p: 2,
            bgcolor: totalScore === 300 ? 'success.main' : 'primary.main',
            color: 'white',
            transition: 'all 0.5s ease-in-out',
            animation: totalScore === 300 ? `${celebrationAnimation} 2s ease-in-out infinite` : 'none',
          }}
        >
          <Typography
            variant="h4"
            align="center"
            fontWeight="bold"
            sx={{
              animation: totalScore > 0 ? `${pulseAnimation} 1s ease-in-out` : 'none',
            }}
          >
            {t('scoreBoard.totalScore', { score: totalScore })}
          </Typography>
          {totalScore === 300 && (
            <Fade in={true} timeout={1000}>
              <Typography
                variant="h6"
                align="center"
                sx={{
                  mt: 1,
                  animation: `${celebrationAnimation} 1.5s ease-in-out infinite`,
                }}
              >
                {t('scoreBoard.perfectGame')}
              </Typography>
            </Fade>
          )}
        </Paper>
      </Zoom>
    </Box>
  );
};
