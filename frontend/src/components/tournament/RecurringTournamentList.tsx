import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Paper,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { type RecurringTournament } from '../../types/facility';
import { formatRecurringPattern } from '../../utils/recurringPattern';

interface RecurringTournamentWithFacility extends RecurringTournament {
  facilityName?: string;
  facilityLocation?: string;
}

interface RecurringTournamentListProps {
  tournaments: RecurringTournamentWithFacility[];
  onEdit?: (tournament: RecurringTournament) => void;
  onDelete?: (tournamentId: string) => void;
  canEdit?: boolean;
}

export const RecurringTournamentList = ({
  tournaments,
  onEdit,
  onDelete,
  canEdit = false,
}: RecurringTournamentListProps) => {
  const { t } = useTranslation();

  const getLevelLabel = (level: string): string => {
    const levelLabels: Record<string, string> = {
      beginner: t('tournament.recurring.levelBeginner'),
      intermediate: t('tournament.recurring.levelIntermediate'),
      advanced: t('tournament.recurring.levelAdvanced'),
    };
    return levelLabels[level] || level;
  };
  if (tournaments.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          {t('tournament.recurring.noTournaments')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        gap: 2,
      }}
    >
      {tournaments.map((tournament) => (
        <Card elevation={2} key={tournament.id}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 1,
              }}
            >
              <Typography variant="h6" component="div">
                {tournament.title}
              </Typography>
              {canEdit && (
                <Box>
                  {onEdit && (
                    <IconButton
                      size="small"
                      onClick={() => onEdit(tournament)}
                      aria-label={t('tournament.recurring.editLabel')}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                  {onDelete && (
                    <IconButton
                      size="small"
                      onClick={() => onDelete(tournament.id)}
                      aria-label={t('tournament.recurring.deleteLabel')}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              )}
            </Box>

            <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(Array.isArray(tournament.level) ? tournament.level : [tournament.level]).map((level, index) => (
                <Chip
                  key={index}
                  label={getLevelLabel(level)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
              <Chip
                label={`¥${tournament.entryFee.toLocaleString()}`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={tournament.isActive ? t('tournament.recurring.active') : t('tournament.recurring.inactive')}
                size="small"
                color={tournament.isActive ? 'success' : 'default'}
              />
            </Box>

            {tournament.facilityName && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                📍 {tournament.facilityName}
                {tournament.facilityLocation && ` (${tournament.facilityLocation})`}
              </Typography>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              📅 {formatRecurringPattern(tournament.pattern)}
            </Typography>

            {tournament.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {tournament.description}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};
