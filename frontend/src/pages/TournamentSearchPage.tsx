import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import {
  searchRecurringTournaments,
  type TournamentSearchFilters,
} from '../firebase/tournaments';
import { getFacilities } from '../firebase/facilities';
import { TournamentSearchFilters as SearchFilters } from '../components/tournament/TournamentSearchFilters';
import { TournamentSearchResultCard } from '../components/tournament/TournamentSearchResultCard';
import { type RecurringTournament, type Facility } from '../types/facility';
import { AppHeader } from '../components/AppHeader';
import { PageHeader } from '../components/PageHeader';
import { AdBanner } from '../components/AdBanner';

interface EnrichedTournament extends RecurringTournament {
  facilityName?: string;
  facilityLocation?: string;
}

export const TournamentSearchPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [tournaments, setTournaments] = useState<EnrichedTournament[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load facilities for enrichment
      const facilitiesData = await getFacilities();
      setFacilities(facilitiesData);

      // Load all active tournaments initially
      const initialFilters: TournamentSearchFilters = {
        isActive: true,
      };
      await performSearch(initialFilters, facilitiesData);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError(t('tournament.search.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (
    filters: TournamentSearchFilters,
    facilitiesData?: Facility[]
  ) => {
    try {
      setSearching(true);
      setError('');

      const tournamentsData = await searchRecurringTournaments(filters);
      const facilitiesToUse = facilitiesData || facilities;

      // Filter by prefecture/city if specified
      let filteredTournaments = tournamentsData;
      if (filters.prefecture || filters.city) {
        const matchingFacilities = facilitiesToUse.filter((f) => {
          const prefectureMatch = !filters.prefecture || f.prefecture === filters.prefecture;
          const cityMatch = !filters.city || f.city.includes(filters.city);
          return prefectureMatch && cityMatch;
        });
        const matchingFacilityIds = new Set(matchingFacilities.map((f) => f.id));
        filteredTournaments = tournamentsData.filter((t) =>
          matchingFacilityIds.has(t.facilityId)
        );
      }

      // Enrich with facility information
      const enrichedTournaments = filteredTournaments.map((tournament) => {
        const facility = facilitiesToUse.find((f) => f.id === tournament.facilityId);
        return {
          ...tournament,
          facilityName: facility?.name,
          facilityLocation: facility ? `${facility.prefecture}${facility.city}` : undefined,
        };
      });

      setTournaments(enrichedTournaments);
      setHasSearched(true);
    } catch (err) {
      console.error('Error searching tournaments:', err);
      setError(t('tournament.search.searchError'));
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = async (filters: TournamentSearchFilters) => {
    await performSearch(filters);
  };

  const handleClear = async () => {
    const initialFilters: TournamentSearchFilters = {
      isActive: true,
    };
    await performSearch(initialFilters);
    setHasSearched(false);
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">{t('common.loginRequired')}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Advertisement - Top */}
      <AdBanner slot="9320434668" />

      {/* Header */}
      <AppHeader />

      <PageHeader
        title={t('tournament.search.title')}
        icon="🔍"
        showBackButton
      />

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search Filters */}
      {!loading && (
        <SearchFilters onSearch={handleSearch} onClear={handleClear} />
      )}

      {/* Advertisement */}
      <AdBanner slot="3456789012" format="horizontal" />

      {/* Loading State */}
      {(loading || searching) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Search Results */}
      {!loading && !searching && (
        <>
          {/* Result count */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" color="text.secondary">
              {hasSearched
                ? t('tournament.search.resultsFound', { count: tournaments.length })
                : t('tournament.search.activeTournaments', { count: tournaments.length })}
            </Typography>
          </Box>

          {/* Results grid */}
          {tournaments.length > 0 ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 2,
              }}
            >
              {tournaments.map((tournament) => (
                <TournamentSearchResultCard
                  key={tournament.id}
                  tournament={tournament}
                  facilityName={tournament.facilityName}
                  facilityLocation={tournament.facilityLocation}
                />
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('tournament.search.noResults')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('tournament.search.noResultsHint')}
              </Typography>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};
