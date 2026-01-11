import { Component, type ReactNode } from 'react';
import { Container, Box, Typography, Button, Paper, Alert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import { trackReactError } from '../utils/errorTracking';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: { componentStack?: string } | null;
}

/**
 * Error Boundary component to catch React errors
 * Displays a user-friendly error UI and tracks errors to analytics
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack?: string }) {
    // Track error to analytics
    trackReactError(error, errorInfo, {
      page: window.location.pathname,
      action: 'component_error',
    });

    // Update state with error details
    this.setState({
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Container maxWidth="md">
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              py: 4,
            }}
          >
            <Paper elevation={3} sx={{ p: 4, maxWidth: '600px', width: '100%' }}>
              <Typography variant="h4" component="h1" gutterBottom align="center" color="error">
                ⚠️ エラーが発生しました
              </Typography>

              <Typography variant="h6" gutterBottom align="center" sx={{ mb: 3 }}>
                申し訳ございません
              </Typography>

              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  アプリケーションでエラーが発生しました。
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  この問題は自動的に記録されました。
                </Typography>
              </Alert>

              {/* Error details (development only) */}
              {import.meta.env.DEV && this.state.error && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 3,
                    bgcolor: 'grey.50',
                    maxHeight: '200px',
                    overflow: 'auto',
                  }}
                >
                  <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace' }}>
                    <strong>Error:</strong> {this.state.error.message}
                  </Typography>
                  {this.state.error.stack && (
                    <Typography
                      variant="caption"
                      component="pre"
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.7rem',
                        mt: 1,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {this.state.error.stack}
                    </Typography>
                  )}
                </Paper>
              )}

              {/* Action buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleReload}
                  size="large"
                >
                  ページを再読み込み
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HomeIcon />}
                  onClick={this.handleGoHome}
                  size="large"
                >
                  ホームに戻る
                </Button>
              </Box>

              {/* Help text */}
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
                問題が解決しない場合は、ブラウザのキャッシュをクリアしてください。
              </Typography>
            </Paper>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}
