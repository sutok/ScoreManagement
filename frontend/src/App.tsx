import { useState } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { auth } from './firebase/config';

function App() {
  const [user] = useState(auth.currentUser);

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          🎳 ボーリングスコア管理
        </Typography>

        <Typography variant="h6" color="text.secondary" gutterBottom>
          Firebase + React プロジェクトセットアップ完了
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="body1" paragraph>
            ✅ React + TypeScript + Vite
          </Typography>
          <Typography variant="body1" paragraph>
            ✅ Firebase SDK インストール済み
          </Typography>
          <Typography variant="body1" paragraph>
            ✅ Material-UI セットアップ済み
          </Typography>
          <Typography variant="body1" paragraph>
            ✅ Firebase エミュレーター設定済み
          </Typography>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            認証状態: {user ? `ログイン中 (${user.email})` : '未ログイン'}
          </Typography>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Button variant="outlined" color="primary" sx={{ mr: 2 }}>
            次のステップ: 認証機能実装
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default App;
