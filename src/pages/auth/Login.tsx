import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Container,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  useTheme
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock,
  ArrowForward 
} from '@mui/icons-material';
import { login } from '../../services/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลหรือรหัสผ่าน');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, #ffffff 100%)`,
        px: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        className="bg-decoration-1"
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.secondary.main}10)`,
          filter: 'blur(40px)',
          zIndex: 0,
        }}
      />
      <Box
        className="bg-decoration-2"
        sx={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15, transparent)`,
          filter: 'blur(30px)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={8}
          className="auth-paper"
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.primary.main}10`,
            boxShadow: `0px 20px 60px ${theme.palette.primary.main}15`,
          }}
        >
          {/* Header Section */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Box
              className="auth-icon"
              sx={{
                mb: 2,
                width: 80,
                height: 80,
                mx: 'auto',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0px 8px 24px ${theme.palette.primary.main}30`,
              }}
            >
              <Lock sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography 
              className="auth-title"
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700, 
                mb: 1,
                fontFamily: '"Playfair Display", serif',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              เข้าสู่ระบบ
            </Typography>
            <Typography className="auth-subtitle" variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              จัดการสต็อกสินค้าและคำสั่งซื้อของคุณได้ง่ายๆ ในที่เดียว
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              className="error-shake"
              sx={{ 
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-message': {
                  fontWeight: 500,
                }
              }}
            >
              {error}
            </Alert>
          )}

          {/* Form Section */}
          <Box component="form" onSubmit={handleSubmit} className="auth-form">
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="อีเมล"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: theme.palette.primary.main }} />
                  </InputAdornment>
                ),
              }}
              className="auth-input"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: '#FFFFFF',
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.light,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
                  },
                },
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="รหัสผ่าน"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: theme.palette.primary.main }} />
                  </InputAdornment>
                ),
              }}
              className="auth-input"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: '#FFFFFF',
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.light,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              className="auth-button"
              sx={{ 
                mt: 3, 
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                boxShadow: `0px 8px 24px ${theme.palette.primary.main}30`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0px 12px 32px ${theme.palette.primary.main}40`,
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <>
                  เข้าสู่ระบบ
                  <ArrowForward sx={{ ml: 1, fontSize: 20 }} />
                </>
              )}
            </Button>

            <Button
              fullWidth
              className="auth-button"
              sx={{ 
                mt: 2, 
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 500,
                borderRadius: 3,
                color: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                '&:hover': {
                  background: `${theme.palette.primary.main}10`,
                  borderColor: theme.palette.primary.dark,
                }
              }}
              variant="outlined"
              onClick={() => navigate('/register')}
            >
              ยังไม่มีบัญชี? สมัครสมาชิก
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
