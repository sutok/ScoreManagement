import { Box, Typography } from '@mui/material';
import { useRef, useEffect, useState } from 'react';

interface NumberPickerProps {
  value: number | null;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  disabled?: boolean;
}

export const NumberPicker = ({
  value,
  onChange,
  min = 0,
  max = 10,
  label,
  disabled = false,
}: NumberPickerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  // Generate numbers array
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  // Item height in pixels
  const ITEM_HEIGHT = 48;

  // Scroll to selected value on mount or value change
  useEffect(() => {
    if (containerRef.current && value !== null) {
      const index = numbers.indexOf(value);
      if (index !== -1) {
        containerRef.current.scrollTop = index * ITEM_HEIGHT;
      }
    }
  }, [value, numbers]);

  const handleScroll = () => {
    if (!containerRef.current || isDragging) return;

    const scrollTop = containerRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const newValue = numbers[index];

    if (newValue !== undefined && newValue !== value) {
      onChange(newValue);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    setStartY(e.pageY);
    setScrollTop(containerRef.current?.scrollTop || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const y = e.pageY;
    const walk = (startY - y) * 2;
    containerRef.current.scrollTop = scrollTop + walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    handleScroll();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(true);
    setStartY(e.touches[0].pageY);
    setScrollTop(containerRef.current?.scrollTop || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const y = e.touches[0].pageY;
    const walk = (startY - y) * 2;
    containerRef.current.scrollTop = scrollTop + walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    handleScroll();
  };

  const handleItemClick = (num: number) => {
    if (disabled) return;
    onChange(num);
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      {label && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          {label}
        </Typography>
      )}
      <Box
        sx={{
          position: 'relative',
          width: 100,
          height: ITEM_HEIGHT * 3,
          margin: '0 auto',
          overflow: 'hidden',
          borderRadius: 2,
          bgcolor: disabled ? 'action.disabledBackground' : 'background.paper',
          border: 2,
          borderColor: disabled ? 'action.disabled' : 'primary.main',
        }}
      >
        {/* Selection indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: ITEM_HEIGHT,
            left: 0,
            right: 0,
            height: ITEM_HEIGHT,
            bgcolor: 'primary.main',
            opacity: 0.1,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Scrollable list */}
        <Box
          ref={containerRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          sx={{
            height: '100%',
            overflowY: 'scroll',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            cursor: disabled ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
            paddingTop: `${ITEM_HEIGHT}px`,
            paddingBottom: `${ITEM_HEIGHT}px`,
          }}
        >
          {numbers.map((num) => (
            <Box
              key={num}
              onClick={() => handleItemClick(num)}
              sx={{
                height: ITEM_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                userSelect: 'none',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: value === num ? 'bold' : 'normal',
                  color: value === num ? 'primary.main' : 'text.secondary',
                  opacity: disabled ? 0.5 : value === num ? 1 : 0.5,
                  fontSize: value === num ? '2rem' : '1.5rem',
                  transition: 'all 0.2s ease',
                }}
              >
                {num}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Top fade */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: ITEM_HEIGHT,
            background: 'linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0))',
            pointerEvents: 'none',
          }}
        />

        {/* Bottom fade */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: ITEM_HEIGHT,
            background: 'linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))',
            pointerEvents: 'none',
          }}
        />
      </Box>
    </Box>
  );
};
