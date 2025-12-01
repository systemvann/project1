import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  Container,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { queryDocs, add } from '../../services/firestore';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ShippingForm {
  fullName: string;
  phone: string;
  address: string;
}

const Cart = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<'checkout' | 'success'>('checkout');
  const [form, setForm] = useState<ShippingForm>({
    fullName: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    const raw = localStorage.getItem('cartItems');
    if (raw) {
      try {
        const parsed: CartItem[] = JSON.parse(raw);
        setItems(parsed);
      } catch (e) {
        console.error('Failed to parse cartItems from localStorage', e);
      }
    }
  }, []);

  useEffect(() => {
    const loadUserInfo = async () => {
      if (!currentUser) return;

      try {
        const users = await queryDocs('users', 'uid', '==', currentUser.uid);
        const userDoc: any | undefined = users[0];

        if (userDoc) {
          setForm((prev) => ({
            ...prev,
            fullName: `${userDoc.firstName || ''} ${userDoc.lastName || ''}`.trim(),
            phone: userDoc.phone || prev.phone,
            address: userDoc.address || prev.address,
          }));
        }
      } catch (e) {
        console.error('Failed to load user info for checkout', e);
      }
    };

    loadUserInfo();
  }, [currentUser]);

  const handleChange = (field: keyof ShippingForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const shippingCost = 0; // คุณสามารถเปลี่ยนให้คำนวณจริงได้ภายหลัง
  const total = subtotal + shippingCost;

  const handleConfirmOrder = async () => {
    setSaving(true);
    try {
      if (!currentUser) throw new Error('User not authenticated');

      // บันทึกคำสั่งซื้อลง Firestore
      const orderPayload = {
        uid: currentUser.uid,
        items,
        total,
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
        status: 'รอดำเนินการ',
        createdAt: new Date(),
      };

      await add('orders', orderPayload);

      // เคลียร์ตะกร้าใน localStorage
      localStorage.removeItem('cartItems');
      setSaving(false);
      setStep('success');
    } catch (e) {
      console.error('Failed to confirm order', e);
      setSaving(false);
    }
  };

  if (step === 'success') {
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
          <Paper
            sx={{
              p: 6,
              maxWidth: 600,
              mx: 'auto',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transform: 'perspective(1000px) rotateX(0deg)',
              '&:hover': {
                transform: 'perspective(1000px) rotateX(-1deg) translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
              }
            }}
          >
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: '#4caf50' }}>
              สั่งซื้อสำเร็จ
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              ขอบคุณที่สั่งซื้อสินค้ากับเรา เราได้รับคำสั่งซื้อของคุณแล้ว
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="outlined" onClick={() => navigate('/orders')}>
                ดูคำสั่งซื้อของฉัน
              </Button>
              <Button variant="contained" onClick={() => navigate('/')}>
                เลือกสินค้าเพิ่ม
              </Button>
            </Box>
          </Paper>
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
      
      <Paper
        sx={{
          p: 4,
          maxWidth: 900,
          mx: 'auto',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          transform: 'perspective(1000px) rotateX(0deg)',
          '&:hover': {
            transform: 'perspective(1000px) rotateX(-1deg) translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
          }
        }}
      >
        {/* Steps */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="primary">
              1 ตะกร้า
            </Typography>
            <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
              2 ชำระเงิน
            </Typography>
            <Typography variant="body2" color="text.disabled">
              3 เสร็จสิ้น
            </Typography>
          </Box>
          <Box
            sx={{
              height: 4,
              borderRadius: 999,
              backgroundColor: '#e0e7ff',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ width: '66%', height: '100%', backgroundColor: '#4caf50' }} />
          </Box>
        </Box>

        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
          ชำระเงิน
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' },
            gap: 3,
          }}
        >
          {/* Shipping form */}
          <Paper 
            sx={{ 
              p: 3, 
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
            }} 
            elevation={0}
          >
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              ที่อยู่จัดส่ง
            </Typography>
            <Box
              component="form"
              sx={{ display: 'grid', gap: 2 }}
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirmOrder();
              }}
            >
              <TextField
                label="ชื่อ - นามสกุล"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                fullWidth
                required
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
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                fullWidth
                required
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
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                fullWidth
                required
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
          </Paper>

          {/* Order summary */}
          <Paper 
            sx={{ 
              p: 3, 
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
            }} 
            elevation={0}
          >
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              สรุปรายการ
            </Typography>
            <Box sx={{ mb: 2 }}>
              {items.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  ยังไม่มีสินค้าในตะกร้า
                </Typography>
              )}
              {items.map((item) => (
                <Box
                  key={item.id}
                  sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
                >
                  <Typography variant="body2" noWrap sx={{ maxWidth: '65%' }}>
                    {item.name} 
× {item.quantity}
                  </Typography>
                  <Typography variant="body2">
                    {((item.price || 0) * item.quantity).toLocaleString('th-TH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">ค่าสินค้า</Typography>
              <Typography variant="body2">
                {subtotal.toLocaleString('th-TH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">ค่าจัดส่ง</Typography>
              <Typography variant="body2" color="text.secondary">
                {shippingCost === 0 ? 'คำนวณตอนจัดส่ง' : shippingCost}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                ยอดรวม
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {total.toLocaleString('th-TH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Box>
            <Button
              fullWidth
              variant="contained"
              disabled={saving || items.length === 0}
              onClick={handleConfirmOrder}
              sx={{
                py: 1.5,
                fontWeight: 600,

                background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)'

                }
              }}
            >
              {saving ? 'กำลังยืนยันคำสั่งซื้อ...' : 'ยืนยันคำสั่งซื้อ'}
            </Button>
          </Paper>
        </Box>
      </Paper>
    </Container>
  );
};

export default Cart;
