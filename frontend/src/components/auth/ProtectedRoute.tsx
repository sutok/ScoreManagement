import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Box, Container, Typography } from '@mui/material';

interface Props {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: Props) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h6">読み込み中...</Typography>
        </Box>
      </Container>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};
