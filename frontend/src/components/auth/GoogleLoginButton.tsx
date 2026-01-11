import { Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../../hooks/useAuth';

export const GoogleLoginButton = () => {
  const { loginWithGoogle } = useAuth();

  return (
    <Button
      variant="contained"
      startIcon={<GoogleIcon />}
      onClick={loginWithGoogle}
      fullWidth
      sx={{ py: 1.5 }}
    >
      Googleでログイン
    </Button>
  );
};
