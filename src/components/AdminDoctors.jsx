import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, TextField,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions,
  Alert, Switch, Chip, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllDoctors, createDoctor, updateDoctor, deleteDoctor, toggleDoctorStatus } from '../services/api';

function AdminDoctors({ adminUserId }) {
  const [doctors, setDoctors] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    education: '',
    department: '',
    phone: '',
    indirect_op_split: 30,
    ip_split: 30,
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const response = await getAllDoctors();
      setDoctors(response.data);
    } catch (err) {
      setError('Failed to load doctors');
    }
  };

  const openPopup = (doctor) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({
        name: doctor.name,
        education: doctor.education || '',
        department: doctor.department || '',
        phone: doctor.phone || '',
        indirect_op_split: doctor.indirect_op_split,
        ip_split: doctor.ip_split,
      });
    } else {
      setEditingDoctor(null);
      setFormData({
        name: '',
        education: '',
        department: '',
        phone: '',
        indirect_op_split: 30,
        ip_split: 30,
      });
    }
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setEditingDoctor(null);
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
      if (editingDoctor) {
        await updateDoctor(editingDoctor.id, formData, adminUserId);
        setSuccess('Doctor updated successfully');
      } else {
        await createDoctor(formData, adminUserId);
        setSuccess('Doctor created successfully');
      }
      
      loadDoctors();
      setTimeout(() => {
        closePopup();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save doctor');
    }
  };

  const handleDelete = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await deleteDoctor(doctorId, adminUserId);
        loadDoctors();
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to delete doctor');
      }
    }
  };

  const handleToggleStatus = async (doctorId) => {
    try {
      await toggleDoctorStatus(doctorId, adminUserId);
      loadDoctors();
    } catch (err) {
      setError('Failed to toggle status');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Doctor Configuration</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openPopup(null)}
        >
          Add Doctor
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Doctor ID</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Education</strong></TableCell>
              <TableCell><strong>Department</strong></TableCell>
              <TableCell><strong>Indirect OP Split</strong></TableCell>
              <TableCell><strong>IP Split</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {doctors.map((doctor) => (
              <TableRow key={doctor.id}>
                <TableCell>{doctor.doctor_id}</TableCell>
                <TableCell>{doctor.name}</TableCell>
                <TableCell>{doctor.education || '-'}</TableCell>
                <TableCell>{doctor.department || '-'}</TableCell>
                <TableCell>{doctor.indirect_op_split}%</TableCell>
                <TableCell>{doctor.ip_split}%</TableCell>
                <TableCell>
                  <Switch
                    checked={doctor.is_active}
                    onChange={() => handleToggleStatus(doctor.id)}
                    size="small"
                  />
                  <Chip 
                    label={doctor.is_active ? 'Active' : 'Inactive'}
                    color={doctor.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => openPopup(doctor)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(doctor.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Popup Dialog */}
      <Dialog open={showPopup} onClose={closePopup} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Doctor Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                size="small"
              />
            </Grid>

            <Grid xs={12}>
              <TextField
                fullWidth
                label="Education"
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="MBBS, MD, etc."
                size="small"
              />
            </Grid>

            <Grid xs={12}>
              <TextField
                fullWidth
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Orthopedics, Neurology, etc."
                size="small"
              />
            </Grid>

            <Grid xs={12}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                size="small"
              />
            </Grid>

            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Indirect OP Split %"
                name="indirect_op_split"
                type="number"
                value={formData.indirect_op_split}
                onChange={handleChange}
                inputProps={{ min: 0, max: 100 }}
                required
                size="small"
              />
            </Grid>

            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="IP Split %"
                name="ip_split"
                type="number"
                value={formData.ip_split}
                onChange={handleChange}
                inputProps={{ min: 0, max: 100 }}
                required
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closePopup}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingDoctor ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminDoctors;