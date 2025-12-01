import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress, 
  Paper, 
  Container,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Home,
  Edit,
  Close,
  AccountCircle,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { queryDocs, add, update } from '../../services/firestore';

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

const Profile = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [docId, setDocId] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [editForm, setEditForm] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) return;

      try {
        const users = await queryDocs('users', 'uid', '==', currentUser.uid);
        const userDoc: any | undefined = users[0];

        if (userDoc) {
          setDocId(userDoc.id);
          setForm({
            firstName: userDoc.firstName || '',
            lastName: userDoc.lastName || '',
            email: userDoc.email || currentUser.email || '',
            phone: userDoc.phone || '',
            address: userDoc.address || '',
          });
        } else {
          setForm((prev) => ({
            ...prev,
            email: currentUser.email || '',
          }));
        }
      } catch (e) {
        console.error('Failed to load profile', e);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser]);

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditChange = (field: keyof ProfileForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    setEditForm({ ...form });
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setSaving(true);
      const payload = {
        uid: currentUser.uid,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        address: form.address,
      };

      if (docId) {
        await update('users', docId, payload);
      } else {
        const created = await add('users', payload);
        setDocId(created.id);
      }
    } catch (e) {
      console.error('Failed to save profile', e);
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setSaving(true);
      const payload = {
        uid: currentUser.uid,
        email: editForm.email,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
        address: editForm.address,
      };

      if (docId) {
        await update('users', docId, payload);
      } else {
        const created = await add('users', payload);
        setDocId(created.id);
      }

      // Update form with new data
      setForm(editForm);
      setEditMode(false);
    } catch (e) {
      console.error('Failed to save profile', e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #F1F5F9 100%)',
            zIndex: -1,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.4) 0%, transparent 50%)',
              zIndex: -1
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
              zIndex: -1
            }
          }}
        />
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #F1F5F9 100%)',
          zIndex: -1,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.4) 0%, transparent 50%)',
            zIndex: -1
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
            zIndex: -1
          }
        }}
      />
      
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Paper
          sx={{
            p: 4,
            maxWidth: 800,
            mx: 'auto',
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            transform: 'perspective(1000px) rotateX(0deg) translateY(0)',
            '&:hover': {
              transform: 'perspective(1000px) rotateX(-2deg) translateY(-8px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
            },
            position: 'relative'
          }}
          elevation={0}
        >
          {/* Edit Button - Top Right Corner */}
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={handleEdit}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
              color: 'white',
              boxShadow: '0 2px 4px rgba(30, 58, 138, 0.3)',
              fontSize: '0.8rem',
              py: 0.75,
              px: 1.5,
              '&:hover': {
                background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
                boxShadow: '0 4px 8px rgba(30, 58, 138, 0.4)'
              }
            }}
          >
            แก้ไขข้อมูล
          </Button>

          {/* Header Section */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)'
              }}
            >
              <AccountCircle sx={{ color: 'white', fontSize: 32 }} />
            </Avatar>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
              โปรไฟล์ลูกค้า
            </Typography>
            <Typography variant="body1" color="text.secondary">
              จัดการข้อมูลส่วนตัวของคุณ
            </Typography>
          </Box>

          {/* Profile Display */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* ข้อมูลส่วนตัว */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                    mr: 2
                  }}
                >
                  <Person sx={{ color: 'white', fontSize: 16 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B' }}>
                  ข้อมูลส่วนตัว
                </Typography>
              </Box>
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>ชื่อจริง</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                    {form.firstName || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>นามสกุล</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                    {form.lastName || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>เบอร์โทรศัพท์</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2, display: 'flex', alignItems: 'center' }}>
                    <Phone sx={{ fontSize: 16, mr: 1, color: '#6B7280' }} />
                    {form.phone || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>อีเมล</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2, display: 'flex', alignItems: 'center' }}>
                    <Email sx={{ fontSize: 16, mr: 1, color: '#6B7280' }} />
                    {form.email || '-'}
                  </Typography>
                </Box>
                <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>ที่อยู่</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2, display: 'flex', alignItems: 'flex-start' }}>
                    <Home sx={{ fontSize: 16, mr: 1, color: '#6B7280', mt: 0.5 }} />
                    {form.address || '-'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={editMode}
        onClose={handleCancelEdit}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 3,
          background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: 'rgba(255,255,255,0.2)',
                mr: 2
              }}
            >
              <Edit sx={{ color: 'white', fontSize: 20 }} />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              แก้ไขข้อมูลโปรไฟล์
            </Typography>
          </Box>
          <IconButton onClick={handleCancelEdit} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="ชื่อ"
                  value={editForm.firstName}
                  onChange={(e) => handleEditChange('firstName', e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#3B82F6'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1E3A8A'
                      }
                    }
                  }}
                />
                <TextField
                  label="นามสกุล"
                  value={editForm.lastName}
                  onChange={(e) => handleEditChange('lastName', e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#3B82F6'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1E3A8A'
                      }
                    }
                  }}
                />
              </Box>
              <TextField
                label="อีเมล"
                type="email"
                value={editForm.email}
                onChange={(e) => handleEditChange('email', e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#3B82F6'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1E3A8A'
                    }
                  }
                }}
              />
              <TextField
                label="เบอร์โทร"
                value={editForm.phone}
                onChange={(e) => handleEditChange('phone', e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#3B82F6'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1E3A8A'
                    }
                  }
                }}
              />
              <TextField
                label="ที่อยู่"
                value={editForm.address}
                onChange={(e) => handleEditChange('address', e.target.value)}
                fullWidth
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#3B82F6'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1E3A8A'
                    }
                  }
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button 
              onClick={handleCancelEdit}
              sx={{
                px: 3,
                py: 1,
                borderColor: '#1E3A8A',
                color: '#1E3A8A',
                '&:hover': {
                  borderColor: '#1E40AF',
                  background: 'rgba(30, 58, 138, 0.04)'
                }
              }}
            >
              ยกเลิก
            </Button>
            <Button 
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{
                px: 3,
                py: 1,
                background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)'
                }
              }}
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Profile;
