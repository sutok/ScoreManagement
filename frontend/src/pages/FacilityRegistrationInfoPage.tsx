import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const FacilityRegistrationInfoPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <StoreIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          店舗登録について
        </Typography>
        <Typography variant="h6" color="text.secondary">
          ボウリング場の施設管理者として登録する方法
        </Typography>
      </Box>

      {/* Main Content */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          登録の流れ
        </Typography>
        <Divider sx={{ my: 2 }} />

        <List>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="1. ログイン"
              secondary="まずはアカウントを作成してログインしてください"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="2. 店舗登録申請"
              secondary="ログイン後のホームページ下部にある「店舗登録申請はこちら」をクリック"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="3. 必要事項の入力"
              secondary="施設名、住所、営業時間などの情報を入力して申請"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="4. 承認待ち"
              secondary="管理者が内容を確認します（数日かかる場合があります）"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="5. 承認完了"
              secondary="承認されると施設管理者として登録され、定期開催試合の管理などができるようになります"
            />
          </ListItem>
        </List>
      </Paper>

      {/* Requirements */}
      <Paper sx={{ p: 4, mb: 3, bgcolor: 'info.light' }}>
        <Typography variant="h6" gutterBottom>
          必要な情報
        </Typography>
        <Typography variant="body1" component="div">
          <ul style={{ marginTop: 8 }}>
            <li>施設名（ボウリング場の名前）</li>
            <li>支店名（複数店舗がある場合）</li>
            <li>住所（都道府県、市区町村、詳細住所）</li>
            <li>電話番号</li>
            <li>営業時間（開店・閉店時刻）</li>
            <li>レーン数</li>
          </ul>
        </Typography>
      </Paper>

      {/* Benefits */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          施設管理者ができること
        </Typography>
        <Typography variant="body1" component="div">
          <ul style={{ marginTop: 8 }}>
            <li>定期開催試合の登録・管理</li>
            <li>試合スケジュールの設定</li>
            <li>参加費・レベル設定</li>
            <li>施設情報の更新</li>
          </ul>
        </Typography>
      </Paper>

      {/* CTA Buttons */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/login')}
        >
          ログイン / アカウント作成
        </Button>
        <Button variant="outlined" size="large" onClick={() => navigate('/')}>
          トップページへ
        </Button>
      </Box>

      {/* Footer Note */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          ご不明な点がございましたら、お問い合わせください
        </Typography>
      </Box>
    </Container>
  );
};
