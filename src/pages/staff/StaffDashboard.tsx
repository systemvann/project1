import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Divider,
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
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAll } from '../../services/firestore';

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

type StaffTab = 'dashboard' | 'orders' | 'history';

const StaffDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState<StaffTab>(location.state?.tab === 'orders' ? 'orders' : 'dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        // โหลดทุกออเดอร์จาก Firestore
        const allOrders = await getAll('orders');
        // แสดงเฉพาะที่ยังไม่เสร็จ (ไม่ใช่ 'จัดส่งสำเร็จ')
        const activeOrders = (allOrders as Order[]).filter(
          (o) => o.status !== 'จัดส่งสำเร็จ'
        );
        setOrders(activeOrders);
      } catch (e) {
        console.error('Failed to load orders for staff', e);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error('Failed to logout', e);
    }
  };

  const renderContent = () => {
    if (tab === 'dashboard') {
      return (
        <>
          <Typography variant="h4" gutterBottom>
            Staff Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Overview of your daily tasks as staff. You can extend this section with key metrics, quick links, or notifications for staff operations.
          </Typography>
        </>
      );
    }

    if (tab === 'orders') {
      if (loading) {
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        );
      }
      return (
        <>
          <Typography variant="h4" gutterBottom>
            คำสั่งซื้อที่ต้องดำเนินการ
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            รายการคำสั่งซื้อที่ยังไม่เสร็จสิ้น (ไม่รวม 'จัดส่งสำเร็จ')
          </Typography>
          {orders.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              ไม่มีคำสั่งซื้อที่ต้องดำเนินการในขณะนี้
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>เลขที่ออเดอร์</TableCell>
                    <TableCell>ลูกค้า</TableCell>
                    <TableCell>ที่อยู่</TableCell>
                    <TableCell>ยอดรวม</TableCell>
                    <TableCell>สถานะ</TableCell>
                    <TableCell>เลขพัสดุ</TableCell>
                    <TableCell>วันที่</TableCell>
                    <TableCell>จัดการ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.fullName}</TableCell>
                      <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {order.address}
                      </TableCell>
                      <TableCell>
                        {order.total.toLocaleString('th-TH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        {order.trackingNumber ? (
                          order.trackingNumber
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            ยังไม่มี
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {order.createdAt?.toDate?.().toLocaleDateString('th-TH') ||
                          order.createdAt?.toLocaleDateString?.('th-TH') ||
                          '-'}
                      </TableCell>
                      <TableCell>
                        <Button variant="outlined" size="small" onClick={() => navigate(`/staff/pick/${order.id}`, { state: { fromStaff: true } })}>
                          เบิกสินค้า
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      );
    }

    return (
      <>
        <Typography variant="h4" gutterBottom>
          ประวัติการจัดการคำสั่งซื้อ
        </Typography>
        <Typography variant="body1" color="text.secondary">
          โซนนี้สำหรับดูประวัติการจัดการคำสั่งซื้อที่พนักงานเคยดำเนินการ เช่น เวลาอัปเดตสถานะ ผู้รับผิดชอบ และรายละเอียดอื่น ๆ (คุณสามารถเพิ่มตารางประวัติหรือฟิลเตอร์ค้นหาได้ในภายหลัง).
        </Typography>
      </>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: 240,
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e0e0e0',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Staff Panel
          </Typography>
        </Box>
        <Divider />
        <List component="nav">
          <ListItemButton
            selected={tab === 'dashboard'}
            onClick={() => setTab('dashboard')}
          >
            <ListItemText primary="Dashboard" />
          </ListItemButton>
          <ListItemButton
            selected={tab === 'orders'}
            onClick={() => setTab('orders')}
          >
            <ListItemText primary="คำสั่งซื้อ" />
          </ListItemButton>
          <ListItemButton
            selected={tab === 'history'}
            onClick={() => setTab('history')}
          >
            <ListItemText primary="ประวัติการจัดการคำสั่งซื้อ" />
          </ListItemButton>
        </List>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            ผู้ใช้: {currentUser?.email}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={handleLogout}
            fullWidth
          >
            ออกจากระบบ
          </Button>
        </Box>
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, p: 3 }}>
        <Paper sx={{ p: 3 }} elevation={2}>
          {renderContent()}
        </Paper>
      </Box>
    </Box>
  );
};

export default StaffDashboard;
