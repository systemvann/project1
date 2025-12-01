import React from 'react';
import {
  Box,
  Typography,
  Chip,
  useTheme,
} from '@mui/material';

interface ActivityItem {
  id: string;
  type: 'success' | 'pending' | 'shipping';
  orderId: string;
  productName: string;
  status: string;
  time: string;
  icon: string;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const theme = useTheme();

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'success':
        return {
          background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
          color: '#047857',
          border: '#6EE7B7',
        };
      case 'pending':
        return {
          background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
          color: '#B45309',
          border: '#FCD34D',
        };
      case 'shipping':
        return {
          background: 'linear-gradient(135deg, #E0F2FE, #BAE6FD)',
          color: '#075985',
          border: '#7DD3FC',
        };
      default:
        return {
          background: theme.palette.background.paper,
          color: theme.palette.text.secondary,
          border: theme.palette.divider,
        };
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {activities.map((activity, index) => {
        const statusColors = getStatusColor(activity.type);
        
        return (
          <Box
            key={activity.id}
            sx={{
              display: 'flex',
              gap: 2,
              position: 'relative',
              animation: `slideInLeft 0.5s ease ${index * 0.1}s backwards`,
            }}
          >
            {/* Timeline */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                  boxShadow: '0 0 0 4px rgba(30, 58, 138, 0.1)',
                  animation: 'dotPulse 2s ease infinite',
                }}
              />
              {index < activities.length - 1 && (
                <Box
                  sx={{
                    width: 2,
                    flex: 1,
                    background: 'linear-gradient(to bottom, #1E3A8A, transparent)',
                    marginTop: 1,
                    minHeight: 40,
                  }}
                />
              )}
            </Box>

            {/* Content */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 249, 245, 0.7))',
                border: `1px solid ${theme.palette.primary.main}20`,
                borderRadius: '12px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateX(4px)',
                  boxShadow: theme.shadows[2],
                  background: theme.palette.background.paper,
                },
              }}
            >
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box
                  sx={{
                    fontSize: 24,
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.1), rgba(59, 130, 246, 0.1))',
                    borderRadius: '12px',
                  }}
                >
                  {activity.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                    {activity.orderId}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {activity.productName}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                <Chip
                  label={activity.status}
                  size="small"
                  sx={{
                    background: statusColors.background,
                    color: statusColors.color,
                    border: `1px solid ${statusColors.border}`,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                />
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {activity.time}
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default ActivityTimeline;
