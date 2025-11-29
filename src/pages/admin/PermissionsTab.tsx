import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';

type UserRole = 'customer' | 'staff' | 'admin';

interface UserRow {
  id: string;
  email?: string;
  role?: UserRole;
  uid?: string;
}

interface PermissionsTabProps {
  users: UserRow[];
  loadingUsers: boolean;
  savingId: string | null;
  onRoleChange: (user: UserRow, newRole: UserRole) => void;
}

const PermissionsTab: React.FC<PermissionsTabProps> = ({
  users,
  loadingUsers,
  savingId,
  onRoleChange,
}) => {
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
                      onRoleChange(user, e.target.value as UserRole)
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
};

export default PermissionsTab;
