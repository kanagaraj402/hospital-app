import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Grid, Alert, Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { getHospitalConfig, updateHospitalConfig } from '../services/api';

function AdminHospitalConfig({ adminUserId }) {
  const [config, setConfig] = useState(null);
  const [formData, setFormData] = useState({
    direct_op_split: 30,
    indirect_op_split: 30,
    ip_split: 30,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await getHospitalConfig();
      setConfig(response.data);
      setFormData({
        direct_op_split: response.data.direct_op_split,
        indirect_op_split: response.data.indirect_op_split,
        ip_split: response.data.ip_split,
      });
    } catch (err) {
      setError('Failed to load configuration');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value),
    });
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (formData.direct_op_split < 0 || formData.direct_op_split > 100) {
      setError('Split percentages must be between 0 and 100');
      return;
    }

    try {
      await updateHospitalConfig(formData, adminUserId);
      setSuccess('Hospital configuration updated successfully');
      loadConfig();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update configuration');
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Hospital Split Configuration
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Configure hospital split percentages for different treatment types.
          The remaining percentage will be automatically allocated to physiotherapist and doctor.
        </Typography>

        <Grid container spacing={3}>
          <Grid xs={12}>
            <Divider sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Direct OP Configuration</Typography>
            </Divider>
          </Grid>

          <Grid xs={12} md={4}>
            <TextField
              fullWidth
              label="Hospital Direct OP Split %"
              name="direct_op_split"
              type="number"
              value={formData.direct_op_split}
              onChange={handleChange}
              inputProps={{ min: 0, max: 100, step: 0.5 }}
              helperText="Physio gets the remaining %"
              size="small"
            />
          </Grid>

          <Grid xs={12} md={8}>
            <Box sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Direct OP Split:</strong> Hospital {formData.direct_op_split}% | 
                Physio {(100 - formData.direct_op_split).toFixed(1)}%
              </Typography>
            </Box>
          </Grid>

          <Grid xs={12}>
            <Divider sx={{ my: 2 }}>
              <Typography variant="subtitle2">Indirect OP Configuration</Typography>
            </Divider>
          </Grid>

          <Grid xs={12} md={4}>
            <TextField
              fullWidth
              label="Hospital Indirect OP Split %"
              name="indirect_op_split"
              type="number"
              value={formData.indirect_op_split}
              onChange={handleChange}
              inputProps={{ min: 0, max: 100, step: 0.5 }}
              helperText="Doctor split is configured per doctor"
              size="small"
            />
          </Grid>

          <Grid xs={12} md={8}>
            <Box sx={{ p: 2, bgcolor: 'warning.lighter', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Indirect OP Split:</strong> Hospital {formData.indirect_op_split}% | 
                Doctor (varies) | Physio (remaining %)
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Note: Doctor split is configured individually for each doctor
              </Typography>
            </Box>
          </Grid>

          <Grid xs={12}>
            <Divider sx={{ my: 2 }}>
              <Typography variant="subtitle2">IP Configuration</Typography>
            </Divider>
          </Grid>

          <Grid xs={12} md={4}>
            <TextField
              fullWidth
              label="Hospital IP Split %"
              name="ip_split"
              type="number"
              value={formData.ip_split}
              onChange={handleChange}
              inputProps={{ min: 0, max: 100, step: 0.5 }}
              helperText="Doctor split is configured per doctor"
              size="small"
            />
          </Grid>

          <Grid xs={12} md={8}>
            <Box sx={{ p: 2, bgcolor: 'success.lighter', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>IP Split:</strong> Hospital {formData.ip_split}% | 
                Doctor (varies) | Physio (remaining %)
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Note: Doctor split is configured individually for each doctor
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            size="large"
          >
            Save Configuration
          </Button>
        </Box>

        {config && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Last updated: {new Date(config.updated_at).toLocaleString()}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default AdminHospitalConfig;