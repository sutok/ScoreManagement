import { Box } from '@mui/material';
import { useEffect } from 'react';

interface AdBannerProps {
  slot: string; // Google AdSense slot ID
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  responsive?: boolean;
  style?: React.CSSProperties;
}

/**
 * Google AdSense Banner Component
 *
 * Usage:
 * <AdBanner slot="XXXXXXXXXX" format="horizontal" />
 */
export const AdBanner = ({
  slot,
  format = 'auto',
  responsive = true,
  style
}: AdBannerProps) => {
  useEffect(() => {
    try {
      // Push ad to AdSense queue
      // @ts-ignore - adsbygoogle is injected by Google AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  // Minimum height based on format
  const getMinHeight = () => {
    switch (format) {
      case 'horizontal':
        return 90;
      case 'vertical':
        return 600;
      case 'rectangle':
        return 250;
      default:
        return 280;
    }
  };

  return (
    <Box
      sx={{
        my: 3,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: getMinHeight(),
        bgcolor: 'background.default',
        borderRadius: 1,
        overflow: 'hidden',
        ...style,
      }}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
        }}
        data-ad-client="ca-pub-6217657676827047"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </Box>
  );
};
