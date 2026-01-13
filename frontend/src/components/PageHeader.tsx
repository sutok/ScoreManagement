import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  icon?: ReactNode;
  showBackButton?: boolean;
}

export const PageHeader = ({ title, icon, showBackButton = false }: PageHeaderProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Box sx={{ position: 'relative', mb: 3 }}>
      {showBackButton && (
        <Box sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}>
          <IconButton onClick={handleBack} aria-label={t('common.backToHome')} sx={{ fontSize: '0.875rem' }}>
            <ArrowBackIcon sx={{ fontSize: '1.25rem' }} /> {t('common.backToHome')}
          </IconButton>
        </Box>
      )}
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontSize: '1rem' }}>
        {icon && <>{icon} </>}
        {title}
      </Typography>
    </Box>
  );
};
