import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import { type ConfirmationResult } from 'firebase/auth';

interface OTPVerificationDialogProps {
  open: boolean;
  onClose: () => void;
  confirmationResult: ConfirmationResult | null;
  phoneNumber: string;
  onVerify: (code: string) => Promise<void>;
}

export const OTPVerificationDialog = ({
  open,
  onClose,
  confirmationResult,
  phoneNumber,
  onVerify,
}: OTPVerificationDialogProps) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code.trim()) {
      setError('認証コードを入力してください');
      return;
    }

    if (!confirmationResult) {
      setError('認証セッションが無効です');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await onVerify(code);
      setCode('');
      onClose();
    } catch (err: any) {
      console.error('OTP verification error:', err);
      const errorCode = err?.code || 'unknown';
      const errorMessage = err?.message || '認証コードの確認に失敗しました';
      setError(`エラー: ${errorCode}\n${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>SMS認証コードを入力</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {phoneNumber} に送信された6桁の認証コードを入力してください
          </Typography>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
              {error}
            </pre>
          </Alert>
        )}
        <TextField
          autoFocus
          fullWidth
          label="認証コード"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
          placeholder="123456"
          inputProps={{
            maxLength: 6,
            inputMode: 'numeric',
            pattern: '[0-9]*',
          }}
          disabled={loading}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleVerify();
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          キャンセル
        </Button>
        <Button onClick={handleVerify} variant="contained" disabled={loading || code.length !== 6}>
          {loading ? '確認中...' : '確認'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
