import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
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

export const GameForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [frames, setFrames] = useState<Frame[]>(initializeFrames());
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Recalculate scores whenever frames change
  useEffect(() => {
    const updatedFrames = calculateTotalScore(frames);
    setFrames(updatedFrames);
  }, [frames.map(f => `${f.firstThrow}-${f.secondThrow}-${f.thirdThrow}`).join('|')]);

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
      return;
    }

    if (!isGameComplete(frames)) {
      setError('すべてのフレームを入力してください');
      return;
    }

    try {
      setSaving(true);
      await createGame(user.uid, frames, memo);
      setSuccess(true);

      // Redirect to history page after 2 seconds
      setTimeout(() => {
        navigate('/history');
      }, 2000);
    } catch (err) {
      console.error('Failed to save game:', err);
      setError('ゲームの保存に失敗しました');
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
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        {gameComplete ? (
          <Alert severity="success">
            ゲーム完了！合計スコア: {totalScore}点
          </Alert>
        ) : (
          <Alert severity="info">
            すべてのフレームを入力してください
          </Alert>
        )}
      </Box>
    </Box>
  );
};
