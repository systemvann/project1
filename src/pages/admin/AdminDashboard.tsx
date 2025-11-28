import { useEffect, useState } from 'react';
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  CircularProgress,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import { getAll, update, add, remove } from '../../services/firestore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

type AdminTab = 'overview' | 'products' | 'permissions' | 'picking';

type UserRole = 'customer' | 'staff' | 'admin';

interface UserRow {
  id: string;
  email?: string;
  role?: UserRole;
  uid?: string;
}

interface ProductRow {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

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
  trackingNumber: string;
  shippingNotes: string;
}

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [pickingRecords, setPickingRecords] = useState<PickingRecord[]>([]);
  const [loadingPickingRecords, setLoadingPickingRecords] = useState(false);
  const [editingPicking, setEditingPicking] = useState<PickingRecord | null>(null);
  const [pickingForm, setPickingForm] = useState({
    trackingNumber: '',
    shippingNotes: '',
  });
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    imageUrl: '',
  });
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    imageUrl: '',
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const data = await getAll('users');
        setUsers(data as UserRow[]);
      } catch (e) {
        console.error('Failed to load users for permissions', e);
      } finally {
        setLoadingUsers(false);
      }
    };

    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const data = await getAll('products');
        // normalize numeric fields
        const normalized = (data as any[]).map((p) => ({
          id: p.id,
          name: p.name || '',
          description: p.description || '',
          price: Number(p.price) || 0,
          quantity: Number(p.quantity) || 0,
          imageUrl: p.imageUrl || '',
        }));
        setProducts(normalized);
      } catch (e) {
        console.error('Failed to load products', e);
      } finally {
        setLoadingProducts(false);
      }
    };

    const loadOrders = async () => {
      try {
        setLoadingOrders(true);
        const allOrders = await getAll('orders');
        const activeOrders = (allOrders as Order[]).filter(
          (o) => o.status !== 'จัดส่งสำเร็จ'
        );
        setOrders(activeOrders);
      } catch (e) {
        console.error('Failed to load orders for admin', e);
      } finally {
        setLoadingOrders(false);
      }
    };

    const loadPickingRecords = async () => {
      try {
        setLoadingPickingRecords(true);
        const records = await getAll('picking');
        setPickingRecords(records as PickingRecord[]);
      } catch (e) {
        console.error('Failed to load picking records', e);
        // ถ้า collection ยังไม่มี ให้ set เป็น array ว่าง
        setPickingRecords([]);
      } finally {
        setLoadingPickingRecords(false);
      }
    };

    loadUsers();
    loadProducts();
    loadOrders();
    loadPickingRecords();
  }, []);

  const handleRoleChange = async (user: UserRow, newRole: UserRole) => {
    if (!user.id) return;

    const previousRole = user.role;
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)),
    );

    try {
      setSavingId(user.id);
      await update('users', user.id, { role: newRole });
    } catch (e) {
      console.error('Failed to update user role', e);
      // rollback on error
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: previousRole } : u)),
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleNewProductChange = (
    field: keyof typeof newProduct,
    value: string,
  ) => {
    setNewProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;

    const price = Number(newProduct.price) || 0;
    const quantity = Number(newProduct.quantity) || 0;

    try {
      setCreatingProduct(true);
      // create new product
      const created: any = await add('products', {
        name: newProduct.name.trim(),
        description: newProduct.description.trim(),
        price,
        quantity,
        imageUrl: newProduct.imageUrl.trim(),
        createdAt: new Date().toISOString(),
      });

      setProducts((prev) => [
        ...prev,
        {
          id: created.id,
          name: created.name,
          description: created.description,
          price: created.price,
          quantity: created.quantity,
          imageUrl: created.imageUrl,
        },
      ]);

      // reset create form state
      setNewProduct({ name: '', description: '', price: '', quantity: '', imageUrl: '' });
    } catch (e) {
      console.error('Failed to create product', e);
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleIncrementQuantity = async (product: ProductRow) => {
    const newQty = (product.quantity || 0) + 1;
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, quantity: newQty } : p)),
    );

    try {
      await update('products', product.id, { quantity: newQty });
    } catch (e) {
      console.error('Failed to increment quantity', e);
    }
  };

  const handleDeleteProduct = async (product: ProductRow) => {
    if (!window.confirm(`ต้องการลบสินค้า "${product.name}" ใช่หรือไม่?`)) return;

    const previous = products;
    setProducts((prev) => prev.filter((p) => p.id !== product.id));

    try {
      await remove('products', product.id);
    } catch (e) {
      console.error('Failed to delete product', e);
      // rollback
      setProducts(previous);
    }
  };

  const startEditProduct = (product: ProductRow) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      quantity: String(product.quantity),
      imageUrl: product.imageUrl || '',
    });
  };

  const handleEditFormChange = (
    field: keyof typeof editForm,
    value: string,
  ) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEditProduct = async () => {
    if (!editingProduct) return;

    const price = Number(editForm.price) || 0;
    const quantity = Number(editForm.quantity) || 0;

    try {
      await update('products', editingProduct.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        price,
        quantity,
        imageUrl: editForm.imageUrl.trim(),
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: editForm.name.trim(),
                description: editForm.description.trim(),
                price,
                quantity,
                imageUrl: editForm.imageUrl.trim(),
              }
            : p,
        ),
      );
      setEditingProduct(null);
    } catch (e) {
      console.error('Failed to update product', e);
    }
  };

  const handleEditPicking = (record: PickingRecord) => {
    setEditingPicking(record);
    setPickingForm({
      trackingNumber: record.trackingNumber || '',
      shippingNotes: record.shippingNotes || '',
    });
  };

  const handlePickingFormChange = (field: keyof typeof pickingForm, value: string) => {
    setPickingForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSavePicking = async () => {
    if (!editingPicking) return;

    try {
      await update('picking', editingPicking.id, {
        trackingNumber: pickingForm.trackingNumber.trim(),
        shippingNotes: pickingForm.shippingNotes.trim(),
        status: pickingForm.trackingNumber ? 'จัดส่งแล้ว' : 'รอดำเนินการ',
      });

      // อัปเดตสถานะใน orders ด้วย
      if (pickingForm.trackingNumber) {
        await update('orders', editingPicking.orderId, {
          trackingNumber: pickingForm.trackingNumber.trim(),
          status: 'กำลังจัดส่ง',
        });
      }

      setPickingRecords((prev) =>
        prev.map((p) =>
          p.id === editingPicking.id
            ? {
                ...p,
                trackingNumber: pickingForm.trackingNumber.trim(),
                shippingNotes: pickingForm.shippingNotes.trim(),
                status: pickingForm.trackingNumber ? 'จัดส่งแล้ว' : 'รอดำเนินการ',
              }
            : p,
        ),
      );
      setEditingPicking(null);
      setPickingForm({ trackingNumber: '', shippingNotes: '' });
    } catch (e) {
      console.error('Failed to update picking record', e);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error('Failed to logout', e);
    }
  };

  const renderContent = (): React.ReactElement => {
    switch (tab) {
      case 'overview':
        return (
          <>
            <Typography variant="h4" gutterBottom>
              แดชบอร์ดรวม (Admin)
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ภาพรวมระบบ เช่น จำนวนผู้ใช้ สินค้า และออเดอร์ คุณสามารถเพิ่มกราฟ/สถิติต่าง ๆ ได้ภายหลัง
            </Typography>
          </>
        );

      case 'picking':
        if (loadingPickingRecords) {
          return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <CircularProgress />
            </Box>
          );
        }
        return (
          <>
            <Typography variant="h4" gutterBottom>
              การเบิกสินค้า
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              รายการที่สตาฟเบิกสินค้าแล้ว รอดำเนินการจัดส่ง
            </Typography>
            {pickingRecords.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                ยังไม่มีรายการเบิกสินค้า
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ผู้เบิก</TableCell>
                      <TableCell>ลูกค้า</TableCell>
                      <TableCell>ที่อยู่จัดส่ง</TableCell>
                      <TableCell>วันที่เบิก</TableCell>
                      <TableCell>ยอดรวม</TableCell>
                      <TableCell>เลขพัสดุ</TableCell>
                      <TableCell>สถานะ</TableCell>
                      <TableCell>จัดการ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pickingRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.staffName}</TableCell>
                        <TableCell>{record.customerInfo.fullName}</TableCell>
                        <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {record.customerInfo.address}
                        </TableCell>
                        <TableCell>
                          {record.pickedAt?.toDate?.().toLocaleDateString('th-TH') ||
                            record.pickedAt?.toLocaleDateString?.('th-TH') ||
                            '-'}
                        </TableCell>
                        <TableCell>
                          {record.total.toLocaleString('th-TH', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          {record.trackingNumber || (
                            <Typography variant="body2" color="text.secondary">
                              ยังไม่มี
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={record.status}
                            color={
                              record.status === 'จัดส่งแล้ว'
                                ? 'success'
                                : record.status === 'กำลังจัดส่ง'
                                ? 'warning'
                                : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="outlined" size="small" onClick={() => handleEditPicking(record)}>
                            จัดการขนส่ง
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
      case 'products':
        return (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ชื่อสินค้า</TableCell>
                  <TableCell>คำอธิบาย</TableCell>
                  <TableCell align="right">ราคา</TableCell>
                  <TableCell align="right">จำนวน</TableCell>
                  <TableCell>รูปภาพ</TableCell>
                  <TableCell align="right">จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell align="right">{product.price.toFixed(2)}</TableCell>
                    <TableCell align="right">{product.quantity}</TableCell>
                    <TableCell>
                      {product.imageUrl ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            component="img"
                            src={product.imageUrl}
                            alt={product.name}
                            sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1, border: '1px solid #e0e0e0' }}
                          />
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleIncrementQuantity(product)}
                      >
                        <AddIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="inherit"
                        onClick={() => startEditProduct(product)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteProduct(product)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        </>
        );

      case 'permissions':
        return (
          <>
            <Typography variant="h4" gutterBottom>
              จัดการสิทธิ์ผู้ใช้
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              เลือก role ให้กับผู้ใช้แต่ละคน (customer / staff / admin)
            </Typography>

            {loadingUsers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>UID</TableCell>
                    <TableCell align="right">Role</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.email || '-'}</TableCell>
                      <TableCell>{user.uid || '-'}</TableCell>
                      <TableCell align="right">
                        <Select
                          size="small"
                          value={user.role || 'customer'}
                          onChange={(e) =>
                            handleRoleChange(user, e.target.value as UserRole)
                          }
                          disabled={savingId === user.id}
                          sx={{ minWidth: 140 }}
                        >
                          <MenuItem value="customer">ลูกค้า (customer)</MenuItem>
                          <MenuItem value="staff">พนักงาน (staff)</MenuItem>
                          <MenuItem value="admin">แอดมิน (admin)</MenuItem>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        );

      default:
        return (
          <>
            <Typography variant="h4" gutterBottom>
              แดชบอร์ดรวม (Admin)
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ภาพรวมระบบ เช่น จำนวนผู้ใช้ สินค้า และออเดอร์ คุณสามารถเพิ่มกราฟ/สถิติต่าง ๆ ได้ภายหลัง
            </Typography>
          </>
        );
    }
  };

  return (
    <>
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
              Admin Panel
            </Typography>
          </Box>
          <Divider />
          <List component="nav">
            <ListItemButton
              selected={tab === 'overview'}
              onClick={() => setTab('overview')}
            >
              <ListItemText primary="แดชบอร์ดรวม" />
            </ListItemButton>
            <ListItemButton
              selected={tab === 'products'}
              onClick={() => setTab('products')}
            >
              <ListItemText primary="สินค้า" />
            </ListItemButton>
            <ListItemButton
              selected={tab === 'picking'}
              onClick={() => setTab('picking')}
            >
              <ListItemText primary="การเบิก" />
            </ListItemButton>
            <ListItemButton
              selected={tab === 'permissions'}
              onClick={() => setTab('permissions')}
            >
              <ListItemText primary="จัดการสิทธิ์" />
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

      {/* Edit product dialog */}
      <Dialog open={!!editingProduct} onClose={() => setEditingProduct(null)} fullWidth maxWidth="sm">
        <DialogTitle>แก้ไขสินค้า</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'grid', gap: 2 }}>
          <TextField
            label="ชื่อสินค้า"
            value={editForm.name}
            onChange={(e) => handleEditFormChange('name', e.target.value)}
            required
          />
          <TextField
            label="คำอธิบายสินค้า"
            value={editForm.description}
            onChange={(e) => handleEditFormChange('description', e.target.value)}
            multiline
            minRows={2}
          />
          <TextField
            label="ราคา"
            type="number"
            value={editForm.price}
            onChange={(e) => handleEditFormChange('price', e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            label="จำนวน"
            type="number"
            value={editForm.quantity}
            onChange={(e) => handleEditFormChange('quantity', e.target.value)}
            inputProps={{ min: 0, step: 1 }}
          />
          <TextField
            label="ลิ้งค์รูปภาพ (URL)"
            value={editForm.imageUrl}
            onChange={(e) => handleEditFormChange('imageUrl', e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingProduct(null)}>ยกเลิก</Button>
          <Button onClick={handleSaveEditProduct} variant="contained">
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit picking dialog */}
      <Dialog open={!!editingPicking} onClose={() => setEditingPicking(null)} fullWidth maxWidth="sm">
        <DialogTitle>จัดการขนส่ง</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'grid', gap: 2 }}>
          <TextField
            label="เลขพัสดุ"
            value={pickingForm.trackingNumber}
            onChange={(e) => handlePickingFormChange('trackingNumber', e.target.value)}
            placeholder="กรอกเลขพัสดุ"
          />
          <TextField
            label="หมายเหตุการจัดส่ง"
            value={pickingForm.shippingNotes}
            onChange={(e) => handlePickingFormChange('shippingNotes', e.target.value)}
            multiline
            minRows={2}
            placeholder="บันทึกเพิ่มเติมเกี่ยวกับการจัดส่ง"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingPicking(null)}>ยกเลิก</Button>
          <Button onClick={handleSavePicking} variant="contained">
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </>

  );
};

export default AdminDashboard;
