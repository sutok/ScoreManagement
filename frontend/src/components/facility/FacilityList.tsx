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
import { type Facility } from '../../types/facility';
import { AffiBanner } from '../AffiBanner';

interface FacilityListProps {
  facilities: Facility[];
  onEdit?: (facility: Facility) => void;
  onDelete?: (facilityId: string) => void;
  canEdit?: boolean;
}

export const FacilityList = ({
  facilities,
  onEdit,
  onDelete,
  canEdit = false,
}: FacilityListProps) => {
  if (facilities.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          まだ施設が登録されていません
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* 3件ごとにチャンク分割してAffiBannerを挿入 */}
      {Array.from({ length: Math.ceil(facilities.length / 3) }, (_, chunkIndex) => {
        const startIndex = chunkIndex * 3;
        const chunkFacilities = facilities.slice(startIndex, startIndex + 3);
        
        return (
          <Box key={`chunk-${chunkIndex}`}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 2,
                mb: 2,
              }}
            >
              {chunkFacilities.map((facility) => (
                <Card elevation={2} key={facility.id}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 1,
                }}
              >
                <Box>
                  <Typography variant="h6" component="div">
                    {facility.name}
                  </Typography>
                  {facility.branchName && (
                    <Typography variant="caption" color="text.secondary">
                      {facility.branchName}
                    </Typography>
                  )}
                </Box>
                {canEdit && (
                  <Box>
                    {onEdit && (
                      <IconButton
                        size="small"
                        onClick={() => onEdit(facility)}
                        aria-label="編集"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {onDelete && (
                      <IconButton
                        size="small"
                        onClick={() => onDelete(facility.id)}
                        aria-label="削除"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                )}
              </Box>

              <Box sx={{ mb: 1 }}>
                <Chip
                  label={facility.prefecture}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mr: 0.5 }}
                />
                <Chip
                  label={`${facility.numberOfLanes}レーン`}
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                📍 {facility.prefecture}{facility.city}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {facility.address}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                📞 {facility.phoneNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                🕒 {facility.businessHours.open} - {facility.businessHours.close}
              </Typography>
            </CardContent>
          </Card>
              ))}
            </Box>
            
            {/* 各チャンクの後にAffiBannerを表示 */}
            <Box sx={{ my: 3 }}>
              <AffiBanner />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
