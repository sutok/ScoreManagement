import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box, CircularProgress, Container } from '@mui/material';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Footer } from './components/Footer';

// Lazy load route components for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const NewGamePage = lazy(() => import('./pages/NewGamePage').then(m => ({ default: m.NewGamePage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage').then(m => ({ default: m.HistoryPage })));
const FacilitiesPage = lazy(() => import('./pages/FacilitiesPage').then(m => ({ default: m.FacilitiesPage })));
const RecurringTournamentsPage = lazy(() => import('./pages/RecurringTournamentsPage').then(m => ({ default: m.RecurringTournamentsPage })));
const TournamentSearchPage = lazy(() => import('./pages/TournamentSearchPage').then(m => ({ default: m.TournamentSearchPage })));
const DebugTournamentsPage = lazy(() => import('./pages/DebugTournamentsPage').then(m => ({ default: m.DebugTournamentsPage })));
const ApplyFacilityPage = lazy(() => import('./pages/ApplyFacilityPage').then(m => ({ default: m.ApplyFacilityPage })));
const PendingFacilitiesPage = lazy(() => import('./pages/PendingFacilitiesPage').then(m => ({ default: m.PendingFacilitiesPage })));
const FacilityRegistrationInfoPage = lazy(() => import('./pages/FacilityRegistrationInfoPage').then(m => ({ default: m.FacilityRegistrationInfoPage })));

// Loading fallback component
const LoadingFallback = () => (
  <Container maxWidth="sm">
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <CircularProgress />
    </Box>
  </Container>
);

function App() {
  return (
    <BrowserRouter>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/new-game"
                element={
                  <ProtectedRoute>
                    <NewGamePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <HistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/facilities"
                element={
                  <ProtectedRoute>
                    <FacilitiesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recurring-tournaments"
                element={
                  <ProtectedRoute>
                    <RecurringTournamentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tournament-search"
                element={
                  <ProtectedRoute>
                    <TournamentSearchPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/debug-tournaments"
                element={
                  <ProtectedRoute>
                    <DebugTournamentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/apply-facility"
                element={
                  <ProtectedRoute>
                    <ApplyFacilityPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pending-facilities"
                element={
                  <ProtectedRoute>
                    <PendingFacilitiesPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/facility-registration-info" element={<FacilityRegistrationInfoPage />} />
            </Routes>
          </Suspense>
        </Box>
        <Footer />
      </Box>
    </BrowserRouter>
  );
}

export default App;
