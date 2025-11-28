import { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Paper } from '@mui/material';
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
  const [docId, setDocId] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileForm>({
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }} elevation={2}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          โปรไฟล์ลูกค้า
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="ชื่อ"
              value={form.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              fullWidth
            />
            <TextField
              label="นามสกุล"
              value={form.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              fullWidth
            />
          </Box>
          <TextField
            label="อีเมล"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            fullWidth
          />
          <TextField
            label="เบอร์โทร"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            fullWidth
          />
          <TextField
            label="ที่อยู่"
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;
