import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Stack,
} from '@mui/material';
import {
  Place as PlaceIcon,
  AttachMoney as MoneyIcon,
  EventRepeat as EventIcon,
} from '@mui/icons-material';
import { type RecurringTournament } from '../../types/facility';
import { formatRecurringPattern } from '../../utils/recurringPattern';

interface TournamentSearchResultCardProps {
  tournament: RecurringTournament;
  facilityName?: string;
  facilityLocation?: string;
  onClick?: () => void;
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: '初心者',
  intermediate: '中級者',
  advanced: '上級者',
};

export const TournamentSearchResultCard = ({
  tournament,
  facilityName,
  facilityLocation,
  onClick,
}: TournamentSearchResultCardProps) => {
  return (
    <Card
      elevation={2}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Stack spacing={1.5}>
          {/* Title and Status */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 1 }}>
            <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
              {tournament.title}
            </Typography>
            {tournament.isActive ? (
              <Chip label="開催中" color="success" size="small" />
            ) : (
              <Chip label="停止中" color="default" size="small" />
            )}
          </Box>

          {/* Facility information */}
          {facilityName && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PlaceIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {facilityName}
                {facilityLocation && ` (${facilityLocation})`}
              </Typography>
            </Box>
          )}

          {/* Recurring pattern */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {formatRecurringPattern(tournament.pattern)}
            </Typography>
          </Box>

          {/* Entry fee and level */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MoneyIcon fontSize="small" color="action" />
              <Typography variant="body2">
                参加費: ¥{tournament.entryFee.toLocaleString()}
              </Typography>
            </Box>
            {(Array.isArray(tournament.level) ? tournament.level : [tournament.level]).map((level, index) => (
              <Chip
                key={index}
                label={LEVEL_LABELS[level] || level}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>

          {/* Description */}
          {tournament.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {tournament.description}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
