import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Collapse,
  Fade,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import CelebrationIcon from '@mui/icons-material/Celebration';
import { keyframes } from '@mui/system';
import { type Frame } from '../../types/game';
import { useAuth } from '../../hooks/useAuth';
import { createGame } from '../../firebase/firestore';
import {
  initializeFrames,
  calculateTotalScore,
  validateFrame,
  isGameComplete,
} from '../../utils/scoreCalculator';
import { FrameInput } from './FrameInput';
import { ScoreBoard } from './ScoreBoard';
import { useNavigate } from 'react-router-dom';
import { trackGameComplete, trackGameSave } from '../../utils/analytics';
import { trackValidationError, trackFirestoreError } from '../../utils/errorTracking';

export const GameForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [frames, setFrames] = useState<Frame[]>(initializeFrames());
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Celebration animation for perfect game
  const bounceAnimation = keyframes`
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-30px); }
    60% { transform: translateY(-15px); }
  `;

  // Recalculate scores whenever frames change
  useEffect(() => {
    const updatedFrames = calculateTotalScore(frames);
    setFrames(updatedFrames);
  }, [frames.map(f => `${f.firstThrow}-${f.secondThrow}-${f.thirdThrow}`).join('|')]);

  // Track game completion
  useEffect(() => {
    if (isGameComplete(frames)) {
      const totalScore = frames[9]?.cumulativeScore || 0;
      const isPerfect = totalScore === 300;
      trackGameComplete(totalScore, isPerfect);
    }
  }, [frames]);

  const handleFrameChange = (index: number, updatedFrame: Frame) => {
    const newFrames = [...frames];
    newFrames[index] = updatedFrame;
    setFrames(newFrames);
  };

  const handleReset = () => {
    setFrames(initializeFrames());
    setMemo('');
    setError(null);
    setSuccess(false);
  };

  const validateAllFrames = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    for (const frame of frames) {
      const validation = validateFrame(
        frame.frameNumber,
        frame.firstThrow,
        frame.secondThrow,
        frame.thirdThrow
      );

      if (!validation.valid && validation.error) {
        errors.push(`${frame.frameNumber}フレーム: ${validation.error}`);
      }
    }

    return { valid: errors.length === 0, errors };
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('ログインが必要です');
      return;
    }

    setError(null);

    // Validate all frames
    const validation = validateAllFrames();
    if (!validation.valid) {
      setError(validation.errors.join('\n'));
      trackValidationError(validation.errors.join('; '), {
        page: '/new-game',
        action: 'validate_frames',
        metadata: { errorCount: validation.errors.length },
      });
      return;
    }

    if (!isGameComplete(frames)) {
      setError('すべてのフレームを入力してください');
      trackValidationError('Game incomplete', {
        page: '/new-game',
        action: 'check_game_complete',
      });
      return;
    }

    try {
      setSaving(true);
      await createGame(user.uid, frames, memo);
      setSuccess(true);

      // Track game save
      const totalScore = frames[9]?.cumulativeScore || 0;
      trackGameSave(totalScore, !!memo);

      // Redirect to history page after 2 seconds
      setTimeout(() => {
        navigate('/history');
      }, 2000);
    } catch (err) {
      console.error('Failed to save game:', err);
      setError('ゲームの保存に失敗しました');
      trackFirestoreError(err instanceof Error ? err : new Error('Failed to save game'), {
        page: '/new-game',
        action: 'save_game',
        userId: user?.uid,
      });
      setSaving(false);
    }
  };

  const gameComplete = isGameComplete(frames);
  const totalScore = frames[9]?.cumulativeScore || 0;

  return (
    <Box>
      {/* Score Board */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <ScoreBoard frames={frames} />
      </Paper>

      {/* Frame Inputs */}
      <Typography variant="h5" gutterBottom>
        スコア入力
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        {frames.map((frame, index) => (
          <Box key={frame.frameNumber} sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <FrameInput
              frame={frame}
              onChange={(updatedFrame) => handleFrameChange(index, updatedFrame)}
            />
          </Box>
        ))}
      </Box>

      {/* Memo */}
      <TextField
        label="メモ（任意）"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        fullWidth
        multiline
        rows={3}
        sx={{ mb: 3 }}
        placeholder="ゲームの感想やメモを記録できます"
      />

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</pre>
        </Alert>
      )}

      {/* Success Display */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ゲームを保存しました！履歴ページに移動します...
        </Alert>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleReset}
          disabled={saving}
        >
          リセット
        </Button>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSubmit}
          disabled={!gameComplete || saving || success}
          size="large"
        >
          {saving ? '保存中...' : 'ゲームを保存'}
        </Button>
      </Box>

      {/* Game Status */}
      <Collapse in={gameComplete || !gameComplete} timeout={500}>
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          {gameComplete ? (
            <Fade in={true} timeout={600}>
              <Alert
                severity={totalScore === 300 ? 'success' : 'success'}
                sx={{
                  animation: totalScore === 300 ? `${bounceAnimation} 1s ease-in-out` : 'none',
                  position: 'relative',
                  overflow: 'visible',
                }}
                icon={totalScore === 300 ? <CelebrationIcon fontSize="large" /> : undefined}
              >
                <Typography variant="h6" fontWeight="bold">
                  ゲーム完了！合計スコア: {totalScore}点
                </Typography>
                {totalScore === 300 && (
                  <Typography variant="h5" sx={{ mt: 1, fontWeight: 'bold' }}>
                    🏆 パーフェクトゲーム達成！ 🏆
                  </Typography>
                )}
              </Alert>
            </Fade>
          ) : (
            <Fade in={true} timeout={300}>
              <Alert severity="info">
                すべてのフレームを入力してください
              </Alert>
            </Fade>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};
