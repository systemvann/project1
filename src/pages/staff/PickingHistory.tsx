import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { queryDocs, getAll } from '../../services/firestore';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface PickingRecord {
  id: string;
  orderId: string;
  staffId: string;
  staffName: string;
  items: OrderItem[];
  total: number;
  customerInfo: {
    fullName: string;
    phone: string;
    address: string;
  };
  pickedAt: any;
  status: string;
  trackingNumber?: string;
  shippingNotes?: string;
}

const PickingHistory = () => {
  const { currentUser } = useAuth();
  const [pickingHistory, setPickingHistory] = useState<PickingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPickingHistory = async () => {
      if (!currentUser) return;
      
      try {
        // ดึงประวัติการเบิกของ staff คนนั้นๆ
        const myPicking = await queryDocs('picking', 'staffId', '==', currentUser.uid);
        setPickingHistory(myPicking as PickingRecord[]);
        
        // ดึงออเดอร์ที่ถูกมอบหมายให้ตัวเองแต่ยังไม่ได้เบิก
        const allOrders = await getAll('orders');
        const assignedOrders = (allOrders as any[]).filter(
          (order) => order.assignedTo === currentUser.uid && order.status === 'รอดำเนินการ'
        );
        
        // แปลงออเดอร์ที่มอบหมายให้เป็นรูปแบบ picking record
        const assignedRecords = assignedOrders.map(order => ({
          id: order.id,
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
          pickedAt: order.assignedAt,
          status: 'มอบหมายแล้ว',
          trackingNumber: '',
          shippingNotes: '',
        }));
        
        // รวมประวัติเดิมกับออเดอร์ที่มอบหมายใหม่
        setPickingHistory([...assignedRecords, ...myPicking as PickingRecord[]]);
      } catch (e) {
        console.error('Failed to load picking history', e);
      } finally {
        setLoading(false);
      }
    };

    loadPickingHistory();
  }, [currentUser]);

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
        ประวัติการเบิกสินค้า
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        รายการการเบิกสินค้าและออเดอร์ที่คุณได้รับมอบหมาย
      </Typography>
      
      {pickingHistory.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            ยังไม่มีประวัติการเบิกสินค้าหรือออเดอร์ที่ได้รับมอบหมาย
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>เลขที่ออเดอร์</TableCell>
                <TableCell>ลูกค้า</TableCell>
                <TableCell>รายการสินค้า</TableCell>
                <TableCell>ยอดรวม</TableCell>
                <TableCell>วันที่เบิก</TableCell>
                <TableCell>สถานะ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pickingHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      #{record.orderId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {record.customerInfo.fullName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      {record.items.map((item, index) => (
                        <Typography key={item.id || index} variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {item.name} x{item.quantity}
                        </Typography>
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {record.total.toLocaleString('th-TH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} บาท
                  </TableCell>
                  <TableCell>
                    {record.pickedAt?.toDate?.().toLocaleDateString('th-TH') ||
                      record.pickedAt?.toLocaleDateString?.('th-TH') ||
                      '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={record.status}
                      color={
                        record.status === 'จัดส่งแล้ว'
                          ? 'success'
                          : record.status === 'แจ้งเบิก'
                          ? 'warning'
                          : record.status === 'มอบหมายแล้ว'
                          ? 'info'
                          : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default PickingHistory;
