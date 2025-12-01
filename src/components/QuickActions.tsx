import React from 'react';
import {
  Box,
  Button,
  Typography,
  useTheme,
} from '@mui/material';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string | React.ReactNode;
  onClick: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(280px, 1fr))' },
        gap: 3,
      }}
    >
      {actions.map((action) => (
        <Button
          key={action.id}
          onClick={action.onClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 3,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 249, 245, 0.7))',
            border: `1px solid ${theme.palette.primary.main}20`,
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            width: '100%',
            textAlign: 'left',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: 0,
              height: '100%',
              background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
              opacity: 0.1,
              transition: 'width 0.3s ease',
            },
            '&:hover::before': {
              width: '100%',
            },
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[3],
              background: theme.palette.background.paper,
            },
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: theme.palette.background.paper,
              borderRadius: '12px',
              boxShadow: theme.shadows[1],
              transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              flexShrink: 0,
            }}
          >
            {typeof action.icon === 'string' ? (
              <Typography sx={{ fontSize: 28 }}>{action.icon}</Typography>
            ) : (
              action.icon
            )}
          </Box>
          
          <Box sx={{ flex: 1, textAlign: 'left' }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 0.5,
                fontFamily: '"Playfair Display", serif',
              }}
            >
              {action.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.9rem',
                color: theme.palette.text.secondary,
              }}
            >
              {action.description}
            </Typography>
          </Box>
          
          <Box
            sx={{
              fontSize: '1.25rem',
              color: theme.palette.primary.main,
              transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
              opacity: 0,
              flexShrink: 0,
            }}
            className="action-arrow"
          >
            →
          </Box>
        </Button>
      ))}
    </Box>
  );
};

export default QuickActions;
