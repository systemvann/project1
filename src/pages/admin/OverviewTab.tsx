import React from 'react';
import { Typography, Box } from '@mui/material';

const OverviewTab = () => {
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
};

export default OverviewTab;
