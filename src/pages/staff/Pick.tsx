import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getAll, add, update } from '../../services/firestore';
import { useAuth } from '../../contexts/AuthContext';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface Order {
  id: string;
  uid: string;
  createdAt?: any;
  items: OrderItem[];
  total: number;
  fullName: string;
  phone: string;
  address: string;
  status?: string;
  trackingNumber?: string;
}

const Pick = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const handleBackToOrders = () => {
    // ถ้ามาจากหน้า staff dashboard ให้กลับไปที่เดิมและเลือกแถบคำสั่งซื้อ
    if (location.state?.fromStaff) {
      navigate('/', { state: { tab: 'orders' } });
    } else {
      navigate('/');
    }
  };

  const handleConfirmPick = async () => {
    if (!order || !currentUser) return;
    setConfirming(true);
    try {
      // บันทึกประวัติการเบิกสินค้า
      await add('picking', {
        orderId: order.id,
        staffId: currentUser.uid,
        staffName: currentUser.email || 'พนักงาน',
        items: order.items,
        total: order.total,
        customerInfo: {
          fullName: order.fullName,
          phone: order.phone,
          address: order.address,
        },
        pickedAt: new Date(),
        status: 'รอดำเนินการ',
        trackingNumber: '',
        shippingNotes: '',
      });

      // อัปเดตสถานะออเดอร์เป็น 'กำลังเตรียมสินค้า'
      await update('orders', order.id, {
        status: 'กำลังเตรียมสินค้า',
      });

      handleBackToOrders();
    } catch (e) {
      console.error('Failed to confirm pick', e);
    } finally {
      setConfirming(false);
    }
  };

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;
      try {
        const allOrders = await getAll('orders');
        const found = (allOrders as Order[]).find((o) => o.id === orderId);
        setOrder(found || null);
      } catch (e) {
        console.error('Failed to load order', e);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          ไม่พบคำสั่งซื้อนี้
        </Typography>
        <Button variant="outlined" sx={{ mt: 2 }} onClick={handleBackToOrders}>
          กลับไปหน้าสตาฟ
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f7fb', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          เบิกสินค้า: คำสั่งซื้อ #{order.id}
        </Typography>

        {/* Order Info */}
        <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            ข้อมูลลูกค้า
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="ชื่อ" secondary={order.fullName} />
            </ListItem>
            <ListItem>
              <ListItemText primary="เบอร์โทร" secondary={order.phone} />
            </ListItem>
            <ListItem>
              <ListItemText primary="ที่อยู่จัดส่ง" secondary={order.address} />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="วันที่สั่งซื้อ"
                secondary={
                  order.createdAt?.toDate?.().toLocaleString('th-TH') ||
                  order.createdAt?.toLocaleString?.('th-TH') ||
                  '-'
                }
              />
            </ListItem>
          </List>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="subtitle2">สถานะ:</Typography>
            <Chip
              label={order.status || 'รอดำเนินการ'}
              color={
                order.status === 'จัดส่งสำเร็จ'
                  ? 'success'
                  : order.status === 'กำลังจัดส่ง'
                  ? 'warning'
                  : 'default'
              }
              size="small"
            />
            {order.trackingNumber && (
              <>
                <Typography variant="subtitle2">เลขพัสดุ:</Typography>
                <Typography variant="body2">{order.trackingNumber}</Typography>
              </>
            )}
          </Box>
        </Paper>

        {/* Items to Pick */}
        <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            รายการสินค้าที่ต้องเบิก
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>สินค้า</TableCell>
                  <TableCell align="right">จำนวน</TableCell>
                  <TableCell align="right">ราคา/ชิ้น</TableCell>
                  <TableCell align="right">รวม</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">
                      {item.price.toLocaleString('th-TH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell align="right">
                      {(item.price * item.quantity).toLocaleString('th-TH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} sx={{ fontWeight: 600 }}>
                    ยอดรวม
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {order.total.toLocaleString('th-TH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={handleBackToOrders}>
            กลับ
          </Button>
          <Button variant="contained" color="primary" onClick={handleConfirmPick} disabled={confirming}>
            {confirming ? 'กำลังยืนยัน...' : 'ยืนยันการเบิกสินค้า'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Pick;
