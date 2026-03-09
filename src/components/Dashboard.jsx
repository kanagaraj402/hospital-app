import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPhysioByUserId, getDashboardStats, getAllTreatmentsList } from '../services/api';
import {
  Box, Typography, Button, Paper, AppBar,
  Toolbar, Card, CardContent, CircularProgress,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, MenuItem, TextField, Alert, Grid2
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import TreatmentForm from './TreatmentForm';
import TreatmentList from './TreatmentList';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [physio, setPhysio] = useState(null);
  const [stats, setStats] = useState(null);
  const [allTreatments, setAllTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedYear, selectedMonth]);

  const loadData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!userData) {
        navigate('/login');
        return;
      }

      // Check if admin - redirect to admin panel
      if (userData.role === 'admin') {
        navigate('/admin');
        return;
      }

      setUser(userData);

      // Get physiotherapist profile
      try {
        const physioRes = await getPhysioByUserId(userData.id);
        setPhysio(physioRes.data);

        // Get dashboard stats with month filter
        const month = selectedMonth === 'all' ? null : parseInt(selectedMonth);
        const statsRes = await getDashboardStats(userData.id, selectedYear, month);
        setStats(statsRes.data);

        // Get ALL treatments (not just current physio's)
        const treatmentsRes = await getAllTreatmentsList(selectedYear, month);
        setAllTreatments(treatmentsRes.data);
      } catch (err) {
        setError('Failed to load physiotherapist data. Please contact admin.');
        console.error('Error:', err);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleTreatmentCreated = () => {
    setShowForm(false);
    loadData();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !physio) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
        <AppBar position="static">
          <Toolbar>
            <LocalHospitalIcon sx={{ mr: 2 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Treatment & Billing System
            </Typography>
            <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            {error}
            <br />
            <br />
            You are logged in as: {user?.email} ({user?.role})
            <br />
            This account is not linked to a physiotherapist profile.
          </Alert>
        </Box>
      </Box>
    );
  }

  // Generate year options (last 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Month options
  const months = [
    { value: 'all', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="static">
        <Toolbar>
          <LocalHospitalIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Treatment & Billing System
          </Typography>
          <Typography sx={{ mr: 2 }}>{user?.email}</Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        {/* Welcome Card */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Grid2 container spacing={2} alignItems="center">
            <Grid2>
              <MedicalServicesIcon sx={{ fontSize: 60, color: 'primary.main' }} />
            </Grid2>
            <Grid2 xs>
              <Typography variant="h4">
                Welcome, {physio?.first_name} {physio?.last_name}!
              </Typography>
              <Typography color="text.secondary">
                Physiotherapist ID: {physio?.physio_id}
              </Typography>
              <Typography color="text.secondary">
                Phone: {physio?.phone}
              </Typography>
            </Grid2>
          </Grid2>
        </Paper>

        {/* Year & Month Selectors */}
        <Grid2 container spacing={2} sx={{ mb: 3 }}>
          <Grid2 xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Select Year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              size="small"
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
          
          <Grid2 xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Select Month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              size="small"
            >
              {months.map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
        </Grid2>

        {/* Stats Cards */}
        <Grid2 container spacing={3} sx={{ mb: 3 }}>
          <Grid2 xs={12} sm={6} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                  Total Treatments (All Physios)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {selectedMonth !== 'all' ? months.find(m => m.value === selectedMonth)?.label : 'Year'} {selectedYear}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {stats?.total_treatments || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid2>
          <Grid2 xs={12} sm={6} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                  Total Billing (All Physios)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {selectedMonth !== 'all' ? months.find(m => m.value === selectedMonth)?.label : 'Year'} {selectedYear}
                </Typography>
                <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                  ₹{stats?.total_billing?.toFixed(2) || '0.00'}
                </Typography>
              </CardContent>
            </Card>
          </Grid2>
          <Grid2 xs={12} sm={6} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                  Your Earnings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {selectedMonth !== 'all' ? months.find(m => m.value === selectedMonth)?.label : 'Year'} {selectedYear}
                </Typography>
                <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>
                  ₹{stats?.physio_earnings?.toFixed(2) || '0.00'}
                </Typography>
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>

        {/* Monthly Breakdown - Only show when "All Months" selected */}
        {selectedMonth === 'all' && stats?.monthly_stats && stats.monthly_stats.length > 0 && (
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Breakdown - {selectedYear}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Month</strong></TableCell>
                    <TableCell align="right"><strong>Treatments</strong></TableCell>
                    <TableCell align="right"><strong>Total Amount</strong></TableCell>
                    <TableCell align="right"><strong>Your Earnings</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.monthly_stats.map((month, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{month.month}</TableCell>
                      <TableCell align="right">{month.total_treatments}</TableCell>
                      <TableCell align="right">₹{month.total_amount.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <Typography color="success.main" fontWeight="bold">
                          ₹{month.physio_earnings.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell><strong>TOTAL</strong></TableCell>
                    <TableCell align="right"><strong>{stats.total_treatments}</strong></TableCell>
                    <TableCell align="right"><strong>₹{stats.total_billing.toFixed(2)}</strong></TableCell>
                    <TableCell align="right">
                      <Typography color="success.main" fontWeight="bold">
                        ₹{stats.physio_earnings.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* New Treatment Button */}
        {!showForm && (
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setShowForm(true)}
            >
              New Treatment Record
            </Button>
          </Box>
        )}

        {/* Treatment Form */}
        {showForm && physio && (
          <TreatmentForm
            physioUserId={user.id}
            onClose={() => setShowForm(false)}
            onSuccess={handleTreatmentCreated}
          />
        )}

        {/* All Treatments List */}
        <TreatmentList treatments={allTreatments} currentPhysioId={physio?.id} />
      </Box>
    </Box>
  );
}

export default Dashboard;