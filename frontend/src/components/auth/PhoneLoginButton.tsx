import { useState, useEffect } from 'react';
import { Button, Alert, TextField, Box } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import { RecaptchaVerifier, type ConfirmationResult } from 'firebase/auth';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../firebase/config';
import { OTPVerificationDialog } from './OTPVerificationDialog';

// 電話番号を国際形式（E.164）に自動変換
const formatPhoneNumber = (input: string): string => {
  // 数字のみを抽出
  const digitsOnly = input.replace(/\D/g, '');

  // 日本の電話番号（0で始まる10-11桁）を+81形式に変換
  if (digitsOnly.startsWith('0') && (digitsOnly.length === 10 || digitsOnly.length === 11)) {
    return '+81' + digitsOnly.substring(1);
  }

  // +81の後に0が来る場合（+0817...など）、0を削除
  if (input.startsWith('+81') && digitsOnly.startsWith('810')) {
    return '+81' + digitsOnly.substring(3);
  }

  // +から始まる場合はそのまま（数字のみに整形）
  if (input.startsWith('+')) {
    return '+' + digitsOnly;
  }

  // その他の場合は数字のみを返す
  return digitsOnly;
};

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
      auth,
      'recaptcha-container',
      {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved - allow user to proceed
        },
        'expired-callback': () => {
          setError('reCAPTCHAの有効期限が切れました。もう一度お試しください。');
        }
      }
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

    // 自動フォーマット
    const formattedNumber = formatPhoneNumber(phoneNumber);

    // Validate phone number format (must start with +)
    if (!formattedNumber.startsWith('+')) {
      setError('電話番号は国際形式で入力してください（例: +819012345678）');
      return;
    }

    // 入力フィールドをフォーマット済みの値に更新
    setPhoneNumber(formattedNumber);

    if (!recaptchaVerifier) {
      setError('reCAPTCHAの初期化に失敗しました。ページを再読み込みしてください。');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const result = await loginWithPhone(formattedNumber, recaptchaVerifier);
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
        auth,
        'recaptcha-container',
        { size: 'invisible' }
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
          placeholder="09012345678 または +819012345678"
          disabled={loading}
          helperText="日本の番号は自動で国際形式に変換されます（例: 09012345678 → +819012345678）"
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
