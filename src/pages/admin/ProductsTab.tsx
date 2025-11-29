import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { add, update, remove } from '../../services/firestore';

interface ProductRow {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface ProductsTabProps {
  products: ProductRow[];
  loadingProducts: boolean;
  creatingProduct: boolean;
  editingProduct: ProductRow | null;
  newProduct: {
    name: string;
    description: string;
    price: string;
    quantity: string;
    imageUrl: string;
  };
  editForm: {
    name: string;
    description: string;
    price: string;
    quantity: string;
    imageUrl: string;
  };
  onNewProductChange: (field: 'name' | 'description' | 'price' | 'quantity' | 'imageUrl', value: string) => void;
  onCreateProduct: (e: React.FormEvent) => void;
  onIncrementQuantity: (product: ProductRow) => void;
  onDeleteProduct: (product: ProductRow) => void;
  onStartEditProduct: (product: ProductRow) => void;
  onEditFormChange: (field: 'name' | 'description' | 'price' | 'quantity' | 'imageUrl', value: string) => void;
  onSaveEditProduct: () => void;
  onCancelEdit: () => void;
}

const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  loadingProducts,
  creatingProduct,
  editingProduct,
  newProduct,
  editForm,
  onNewProductChange,
  onCreateProduct,
  onIncrementQuantity,
  onDeleteProduct,
  onStartEditProduct,
  onEditFormChange,
  onSaveEditProduct,
  onCancelEdit,
}) => {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        จัดการสินค้า
      </Typography>
      
      {/* Create Product Form */}
      <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          เพิ่มสินค้าใหม่
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
          <TextField
            label="ชื่อสินค้า"
            value={newProduct.name}
            onChange={(e) => onNewProductChange('name', e.target.value)}
            required
          />
          <TextField
            label="ราคา"
            type="number"
            value={newProduct.price}
            onChange={(e) => onNewProductChange('price', e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            label="จำนวน"
            type="number"
            value={newProduct.quantity}
            onChange={(e) => onNewProductChange('quantity', e.target.value)}
            inputProps={{ min: 0, step: 1 }}
          />
          <TextField
            label="ลิ้งค์รูปภาพ (URL)"
            value={newProduct.imageUrl}
            onChange={(e) => onNewProductChange('imageUrl', e.target.value)}
          />
        </Box>
        <TextField
          label="คำอธิบายสินค้า"
          value={newProduct.description}
          onChange={(e) => onNewProductChange('description', e.target.value)}
          multiline
          minRows={2}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={onCreateProduct}
          disabled={creatingProduct || !newProduct.name.trim()}
          startIcon={creatingProduct ? <CircularProgress size={20} /> : <AddIcon />}
        >
          {creatingProduct ? 'กำลังเพิ่ม...' : 'เพิ่มสินค้า'}
        </Button>
      </Box>

      {/* Products Table */}
      {loadingProducts ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
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
                      onClick={() => onIncrementQuantity(product)}
                    >
                      <AddIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="inherit"
                      onClick={() => onStartEditProduct(product)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDeleteProduct(product)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onClose={onCancelEdit} fullWidth maxWidth="sm">
        <DialogTitle>แก้ไขสินค้า</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'grid', gap: 2 }}>
          <TextField
            label="ชื่อสินค้า"
            value={editForm.name}
            onChange={(e) => onEditFormChange('name', e.target.value)}
            required
          />
          <TextField
            label="คำอธิบายสินค้า"
            value={editForm.description}
            onChange={(e) => onEditFormChange('description', e.target.value)}
            multiline
            minRows={2}
          />
          <TextField
            label="ราคา"
            type="number"
            value={editForm.price}
            onChange={(e) => onEditFormChange('price', e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            label="จำนวน"
            type="number"
            value={editForm.quantity}
            onChange={(e) => onEditFormChange('quantity', e.target.value)}
            inputProps={{ min: 0, step: 1 }}
          />
          <TextField
            label="ลิ้งค์รูปภาพ (URL)"
            value={editForm.imageUrl}
            onChange={(e) => onEditFormChange('imageUrl', e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancelEdit}>ยกเลิก</Button>
          <Button onClick={onSaveEditProduct} variant="contained">
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductsTab;
