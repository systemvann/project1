import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
} from '@mui/material';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  change?: string;
  icon: string;
  gradient: string;
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  change,
  icon,
  gradient,
  delay = 0,
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.primary.main}20`,
        borderRadius: '18px',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-6px) scale(1.02)',
          boxShadow: theme.shadows[4],
        },
        animation: `fadeInUp 0.6s ease ${delay}s backwards`,
      }}
    >
      {/* Background Gradient Circle */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: gradient,
          opacity: 0.05,
          transition: 'transform 0.5s ease, opacity 0.5s ease',
        }}
      />
      
      <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
              boxShadow: theme.shadows[2],
              transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <Typography sx={{ fontSize: 36 }}>{icon}</Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              fontSize: '1rem',
              fontWeight: 700,
              color: theme.palette.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Value */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
          <Typography
            variant="h3"
            sx={{
              fontSize: '3rem',
              fontWeight: 800,
              fontFamily: '"Playfair Display", serif',
              background: gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>
          {change && (
            <Typography
              variant="body1"
              sx={{
                fontSize: '1rem',
                fontWeight: 600,
                color: theme.palette.success.main,
              }}
            >
              {change}
            </Typography>
          )}
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.95rem',
            color: theme.palette.text.secondary,
            fontWeight: 500,
          }}
        >
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
