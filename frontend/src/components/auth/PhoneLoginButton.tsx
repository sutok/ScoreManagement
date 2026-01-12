import { useState, useEffect } from 'react';
import { Button, Alert, TextField, Box } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import { RecaptchaVerifier, type ConfirmationResult } from 'firebase/auth';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../firebase/config';
import { OTPVerificationDialog } from './OTPVerificationDialog';

export const PhoneLoginButton = () => {
  const { loginWithPhone, verifyOTP } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    // Initialize RecaptchaVerifier
    const verifier = new RecaptchaVerifier(
      'recaptcha-container',
      {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved - allow user to proceed
        },
        'expired-callback': () => {
          setError('reCAPTCHAの有効期限が切れました。もう一度お試しください。');
        }
      },
      auth
    );
    setRecaptchaVerifier(verifier);

    return () => {
      verifier.clear();
    };
  }, []);

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError('電話番号を入力してください');
      return;
    }

    // Validate phone number format (must start with +)
    if (!phoneNumber.startsWith('+')) {
      setError('電話番号は国際形式で入力してください（例: +819012345678）');
      return;
    }

    if (!recaptchaVerifier) {
      setError('reCAPTCHAの初期化に失敗しました。ページを再読み込みしてください。');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const result = await loginWithPhone(phoneNumber, recaptchaVerifier);
      setConfirmationResult(result);
      setDialogOpen(true);
    } catch (err: any) {
      console.error('Phone login error:', err);
      const errorCode = err?.code || 'unknown';
      let errorMessage = err?.message || 'SMS送信に失敗しました';

      // Provide user-friendly error messages
      if (errorCode === 'auth/invalid-phone-number') {
        errorMessage = '電話番号の形式が正しくありません';
      } else if (errorCode === 'auth/too-many-requests') {
        errorMessage = 'リクエストが多すぎます。しばらくしてから再度お試しください';
      } else if (errorCode === 'auth/quota-exceeded') {
        errorMessage = 'SMS送信の上限に達しました';
      }

      setError(`エラー: ${errorCode}\n${errorMessage}`);

      // Recreate recaptcha verifier on error
      recaptchaVerifier.clear();
      const newVerifier = new RecaptchaVerifier(
        'recaptcha-container',
        { size: 'invisible' },
        auth
      );
      setRecaptchaVerifier(newVerifier);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (code: string) => {
    if (!confirmationResult) {
      throw new Error('認証セッションが無効です');
    }
    await verifyOTP(confirmationResult, code);
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
              {error}
            </pre>
          </Alert>
        )}
        <TextField
          fullWidth
          label="電話番号"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+819012345678"
          disabled={loading}
          helperText="国際形式で入力（例: +819012345678）"
          inputProps={{
            inputMode: 'tel',
          }}
        />
        <Button
          variant="outlined"
          startIcon={<PhoneIcon />}
          onClick={handleSendOTP}
          fullWidth
          disabled={loading}
          sx={{
            py: 1.5,
            borderColor: '#4CAF50',
            color: '#4CAF50',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#4CAF50',
              bgcolor: 'rgba(76, 175, 80, 0.04)',
            }
          }}
        >
          {loading ? 'SMS送信中...' : '電話番号でログイン'}
        </Button>
      </Box>
      <div id="recaptcha-container"></div>
      <OTPVerificationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        confirmationResult={confirmationResult}
        phoneNumber={phoneNumber}
        onVerify={handleVerifyOTP}
      />
    </>
  );
};
