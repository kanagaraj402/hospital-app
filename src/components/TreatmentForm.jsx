import React, { useState, useEffect } from 'react';
import { getAllDoctors, createTreatment, calculateTreatmentPreview } from '../services/api';
import {
  Paper, Typography, TextField, Button, Alert,
  MenuItem, Box, InputAdornment, Divider, Grid
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

function TreatmentForm({ physioUserId, onSuccess, onClose }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    patient_name: '',
    medical_record_number: '',
    from_date: dayjs(),
    to_date: dayjs().add(1, 'week'),
    treatment_type: 'op',
    op_type: 'direct',
    doctor_id: '',
    number_of_days: 8,
    charge_per_day: 0,
  });

  const [splitData, setSplitData] = useState({
    calculated_days: 8,
    total_amount: 0,
    physio_split: 0,
    doctor_split: 0,
    hospital_split: 0,
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  // Auto-calculate days when dates change
  useEffect(() => {
    if (formData.from_date && formData.to_date) {
      const days = formData.to_date.diff(formData.from_date, 'day') + 1;
      if (days > 0) {
        setFormData(prev => ({ ...prev, number_of_days: days }));
      }
    }
  }, [formData.from_date, formData.to_date]);

  // Fetch splits when relevant fields change
  useEffect(() => {
    if (formData.doctor_id && formData.number_of_days > 0 && formData.charge_per_day > 0) {
      fetchSplitPreview();
    } else {
      // Reset splits if inputs are invalid
      setSplitData({
        calculated_days: formData.number_of_days,
        total_amount: 0,
        physio_split: 0,
        doctor_split: 0,
        hospital_split: 0,
      });
    }
  }, [formData.doctor_id, formData.number_of_days, formData.charge_per_day, formData.treatment_type, formData.op_type]);

  // Auto-select doctor based on treatment type
  useEffect(() => {
    if (formData.treatment_type === 'op' && formData.op_type === 'direct') {
      if (doctors.length > 0 && !formData.doctor_id) {
        setFormData(prev => ({ ...prev, doctor_id: doctors[0].id }));
      }
    } else if (formData.treatment_type === 'ip') {
      // For IP, clear OP type and allow doctor selection
      setFormData(prev => ({ ...prev, op_type: null }));
    }
  }, [formData.treatment_type, formData.op_type, doctors]);

  const loadDoctors = async () => {
    try {
      const response = await getAllDoctors();
      // Filter only active doctors
      const activeDoctors = response.data.filter(d => d.is_active);
      setDoctors(activeDoctors);
      
      if (activeDoctors.length > 0) {
        setFormData(prev => ({ ...prev, doctor_id: activeDoctors[0].id }));
      }
    } catch (err) {
      setError('Failed to load doctors');
    }
  };

  const fetchSplitPreview = async () => {
    try {
      const dataToSend = {
        patient_name: formData.patient_name || 'Preview',
        medical_record_number: formData.medical_record_number || '000000',
        from_date: formData.from_date.format('YYYY-MM-DD'),
        to_date: formData.to_date.format('YYYY-MM-DD'),
        treatment_type: formData.treatment_type,
        op_type: formData.op_type,
        doctor_id: parseInt(formData.doctor_id),
        number_of_days: parseInt(formData.number_of_days),
        charge_per_day: parseFloat(formData.charge_per_day),
      };

      console.log('Fetching split preview with:', dataToSend);

      const response = await calculateTreatmentPreview(dataToSend, physioUserId);
      console.log('Split preview response:', response.data);
      
      setSplitData(response.data);
    } catch (err) {
      console.error('Failed to fetch split preview:', err);
      // Don't show error to user for preview
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
   if (name === 'medical_record_number') {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 6);  
  setFormData({
    ...formData,
    [name]: digitsOnly,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Validate MRN - exactly 6 digits
      if (!/^\d{6}$/.test(formData.medical_record_number)) {  // ✅ Fixed
  setError('Medical Record Number must be exactly 6 digits');
  setLoading(false);
  return;
}
      if (!formData.patient_name) {
        setError('Patient name is required');
        setLoading(false);
        return;
      }

      if (!formData.doctor_id) {
        setError('Please select a doctor');
        setLoading(false);
        return;
      }

      if (formData.charge_per_day <= 0) {
        setError('Treatment charge must be greater than zero');
        setLoading(false);
        return;
      }

      const dataToSend = {
        patient_name: formData.patient_name,
        medical_record_number: formData.medical_record_number,
        from_date: formData.from_date.format('YYYY-MM-DD'),
        to_date: formData.to_date.format('YYYY-MM-DD'),
        treatment_type: formData.treatment_type,
        op_type: formData.treatment_type === 'op' ? formData.op_type : null,
        doctor_id: parseInt(formData.doctor_id),
        number_of_days: parseInt(formData.number_of_days),
        charge_per_day: parseFloat(formData.charge_per_day),
      };

      console.log('Creating treatment with:', dataToSend);

      await createTreatment(dataToSend, physioUserId);
      setSuccess(true);

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      console.error('Create treatment error:', err);
      setError(err.response?.data?.detail || 'Failed to create treatment record');
      setLoading(false);
    }
  };

  const isDoctorEditable = !(formData.treatment_type === 'op' && formData.op_type === 'direct');

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          New Treatment Record
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fill in the patient and treatment details below
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Treatment record created successfully!
        </Alert>
      )}

      <Box>
        {/* Patient Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
            Patient Information
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Patient Name"
                name="patient_name"
                value={formData.patient_name}
                onChange={handleChange}
                required
                placeholder="Enter patient's full name"
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Medical Record Number (6 Digits)"
                name="medical_record_number"
                value={formData.medical_record_number}
                onChange={handleChange}
                required
                placeholder="000000"
                inputProps={{ maxLength: 6 }}
                helperText={`${formData.medical_record_number.length}/6 digits`}
                error={formData.medical_record_number.length > 0 && formData.medical_record_number.length !== 6}
                size="small"
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Treatment Period */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
            Treatment Period
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="From Date"
                  value={formData.from_date}
                  onChange={(newValue) => setFormData({...formData, from_date: newValue})}
                  slotProps={{ textField: { fullWidth: true, required: true, size: 'small' } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="To Date"
                  value={formData.to_date}
                  onChange={(newValue) => setFormData({...formData, to_date: newValue})}
                  minDate={formData.from_date}
                  slotProps={{ textField: { fullWidth: true, required: true, size: 'small' } }}
                />
              </LocalizationProvider>
            </Grid>

           <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Number of Days"
                name="number_of_days"
                type="number"
                value={formData.number_of_days}
                onChange={handleChange}
                inputProps={{ min: 1 }}
                helperText={`Auto-calculated: ${splitData.calculated_days} days`}
                size="small"
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Treatment Details */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
            Treatment Details
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                select
                label="OP / IP"
                name="treatment_type"
                value={formData.treatment_type}
                onChange={handleChange}
                required
                size="small"
              >
                <MenuItem value="op">OP (Out Patient)</MenuItem>
                <MenuItem value="ip">IP (In Patient)</MenuItem>
              </TextField>
            </Grid>

            {formData.treatment_type === 'op' && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  select
                  label="Direct / Indirect OP"
                  name="op_type"
                  value={formData.op_type}
                  onChange={handleChange}
                  required
                  size="small"
                >
                  <MenuItem value="direct">Direct OP</MenuItem>
                  <MenuItem value="indirect">Indirect OP</MenuItem>
                </TextField>
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                select
                label="Doctor Name"
                name="doctor_id"
                value={formData.doctor_id}
                onChange={handleChange}
                required
                disabled={!isDoctorEditable}
                helperText={
                  !isDoctorEditable 
                    ? "Auto-selected for Direct OP" 
                    : "Select the referring doctor"
                }
                size="small"
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.department || 'General'}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Billing */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
            Billing Information
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Treatment Charges Per Day"
                name="charge_per_day"
                type="number"
                value={formData.charge_per_day}
                onChange={handleChange}
                inputProps={{ min: 0, step: 50 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                required
                placeholder="Enter charge"
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Total Amount"
                value={splitData.total_amount.toFixed(2)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  readOnly: true,
                }}
                sx={{ 
                  bgcolor: 'grey.50',
                  '& .MuiInputBase-input': {
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    color: 'primary.main'
                  }
                }}
                size="small"
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Split Details */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
            Split Details (Auto-calculated from Configuration)
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Physiotherapist Split"
                value={splitData.physio_split.toFixed(2)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  readOnly: true,
                }}
                sx={{ 
                  bgcolor: 'success.lighter',
                  '& .MuiInputBase-input': {
                    fontWeight: 'bold',
                    color: 'success.dark'
                  }
                }}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Doctor Split"
                value={splitData.doctor_split.toFixed(2)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  readOnly: true,
                }}
                sx={{ 
                  bgcolor: 'info.lighter',
                  '& .MuiInputBase-input': {
                    fontWeight: 'bold',
                    color: 'info.dark'
                  }
                }}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Hospital Split"
                value={splitData.hospital_split.toFixed(2)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  readOnly: true,
                }}
                sx={{ 
                  bgcolor: 'warning.lighter',
                  '& .MuiInputBase-input': {
                    fontWeight: 'bold',
                    color: 'warning.dark'
                  }
                }}
                size="small"
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Action Buttons */}
        <Grid container spacing={2} justifyContent="flex-end">
          <Grid>
            <Button
              variant="outlined"
              size="large"
              onClick={onClose}
              disabled={success || loading}
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
          </Grid>
          <Grid>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading || success}
              startIcon={<SaveIcon />}
            >
              {success ? 'Created Successfully!' : loading ? 'Creating...' : 'Create Treatment Record'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}

export default TreatmentForm;