import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initializeErrorTracking } from './utils/errorTracking';
import './i18n/config';
import './index.css';

// Initialize global error handlers
initializeErrorTracking();

// MUIテーマ設定
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    warning: {
      main: '#ed6c02',
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
