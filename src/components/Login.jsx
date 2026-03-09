import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import {
  Container, Box, TextField, Button, Typography,
  Paper, Alert, Divider
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    setError('');

    try {
      const response = await login(formData);
      const userData = response.data;
      
      localStorage.setItem('user', JSON.stringify(userData));

      if (userData.role === 'admin') {
        navigate('/admin');
      } else if (userData.role === 'physiotherapist') {
        navigate('/dashboard');
      } else {
        setError('Invalid user role');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <LocalHospitalIcon sx={{ fontSize: 50, color: 'primary.main', mr: 1 }} />
            <Typography variant="h4" align="center">
              Hospital Login
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Treatment & Billing System
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box>
            <TextField
              fullWidth
              label="Email / User ID"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              autoFocus
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleLogin}
            >
              Login
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Access Info */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            <Box sx={{ p: 2, bgcolor: 'error.lighter', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AdminPanelSettingsIcon color="error" />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Admin Access
                </Typography>
                <Typography variant="caption">
                  Manage doctors, users, and hospital settings
                </Typography>
              </Box>
            </Box>

            <Box sx={{ p: 2, bgcolor: 'success.lighter', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <MedicalServicesIcon color="success" />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Physiotherapist Access
                </Typography>
                <Typography variant="caption">
                  Create treatment records and view earnings
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
            <Typography variant="caption" display="block">
              <strong>Demo Admin:</strong> admin@hospital.com / admin123
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;