import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, AppBar, Toolbar, Button, Tabs, Tab, Paper
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminDoctors from './AdminDoctors';
import AdminUsers from './AdminUsers';
import AdminHospitalConfig from './AdminHospitalConfig';

function AdminDashboard() {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="static">
        <Toolbar>
          <LocalHospitalIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin Panel - Hospital Configuration
          </Typography>
          <Typography sx={{ mr: 2 }}>{user?.email}</Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ width: '100%', p: 3 }}>
        <Paper elevation={3}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="Doctor Configuration" />
            <Tab label="User Management" />
            <Tab label="Hospital Settings" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {currentTab === 0 && <AdminDoctors adminUserId={user?.id} />}
            {currentTab === 1 && <AdminUsers adminUserId={user?.id} />}
            {currentTab === 2 && <AdminHospitalConfig adminUserId={user?.id} />}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default AdminDashboard;