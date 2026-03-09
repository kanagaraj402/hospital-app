import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, TextField,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions,
  Alert, Switch, Grid2, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import { getAllUsers, createPhysioUser, toggleUserStatus, resetUserPassword, deleteUser } from '../services/api';

function AdminUsers({ adminUserId }) {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await getAllUsers(adminUserId);
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users');
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    try {
      await createPhysioUser(formData, adminUserId);
      setSuccess('User created successfully');
      loadUsers();
      
      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create user');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await toggleUserStatus(userId, adminUserId);
      loadUsers();
    } catch (err) {
      setError('Failed to toggle status');
    }
  };

  const handleOpenPasswordDialog = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setOpenPasswordDialog(true);
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await resetUserPassword(selectedUser.id, newPassword, adminUserId);
      setSuccess('Password reset successfully');
      setTimeout(() => {
        setOpenPasswordDialog(false);
        setSelectedUser(null);
        setNewPassword('');
      }, 1500);
    } catch (err) {
      setError('Failed to reset password');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId, adminUserId);
        loadUsers();
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to delete user');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">User Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add Physiotherapist User
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>User ID</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Created At</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role.toUpperCase()} 
                    color={user.role === 'admin' ? 'error' : 'primary'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={user.is_active}
                    onChange={() => handleToggleStatus(user.id)}
                    size="small"
                    disabled={user.id === adminUserId}
                  />
                  <Chip 
                    label={user.is_active ? 'Active' : 'Inactive'}
                    color={user.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenPasswordDialog(user)}
                    title="Reset Password"
                  >
                    <LockResetIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(user.id)}
                    disabled={user.id === adminUserId}
                    title="Delete User"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Physiotherapist User</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Grid2 container spacing={2} sx={{ mt: 1 }}>
            <Grid2 xs={12}>
              <TextField
                fullWidth
                label="Email (Login ID)"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                size="small"
              />
            </Grid2>

            <Grid2 xs={12}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                helperText="Minimum 6 characters"
                size="small"
              />
            </Grid2>

            <Grid2 xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                size="small"
              />
            </Grid2>

            <Grid2 xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                size="small"
              />
            </Grid2>

            <Grid2 xs={12}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                size="small"
              />
            </Grid2>
          </Grid2>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Typography variant="body2" sx={{ mb: 2 }}>
            Reset password for: <strong>{selectedUser?.email}</strong>
          </Typography>

          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="Minimum 6 characters"
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handleResetPassword} variant="contained">
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminUsers;