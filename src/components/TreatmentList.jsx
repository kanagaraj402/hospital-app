import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Box, TextField, MenuItem, Grid
} from '@mui/material';

function TreatmentList({ treatments, currentPhysioId }) {
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [doctors, setDoctors] = useState([]);
  const [filteredTreatments, setFilteredTreatments] = useState([]);

  useEffect(() => {
    const uniqueDoctors = [];
    const doctorMap = new Map();

    treatments.forEach(treatment => {
      if (treatment.doctor_id && !doctorMap.has(treatment.doctor_id)) {
        doctorMap.set(treatment.doctor_id, {
          id: treatment.doctor_id,
          name: treatment.doctor?.name || `Doctor ${treatment.doctor_id}`
        });
        uniqueDoctors.push(doctorMap.get(treatment.doctor_id));
      }
    });

    setDoctors(uniqueDoctors);
  }, [treatments]);

  // Filter treatments by selected doctor
  useEffect(() => {
    if (selectedDoctor === 'all') {
      setFilteredTreatments(treatments);
    } else {
      const filtered = treatments.filter(t => t.doctor_id === parseInt(selectedDoctor));
      setFilteredTreatments(filtered);
    }
  }, [selectedDoctor, treatments]);

  // Calculate totals
  const totals = filteredTreatments.reduce((acc, treatment) => {
    return {
      totalAmount: acc.totalAmount + treatment.total_amount,
      physioSplit: acc.physioSplit + treatment.physio_split,
      doctorSplit: acc.doctorSplit + treatment.doctor_split,
      hospitalSplit: acc.hospitalSplit + treatment.hospital_split,
    };
  }, {
    totalAmount: 0,
    physioSplit: 0,
    doctorSplit: 0,
    hospitalSplit: 0,
  });

  const getTypeColor = (type) => {
    return type === 'op' ? 'primary' : 'secondary';
  };

  const getOPTypeColor = (opType) => {
    return opType === 'direct' ? 'success' : 'info';
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Grid xs={12} md={6}>
          <Typography variant="h5">
            All Treatment Records ({filteredTreatments.length})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedDoctor === 'all' 
              ? 'Showing treatments from all physiotherapists' 
              : `Filtered by doctor`}
          </Typography>
        </Grid>
        
        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="Filter by Doctor"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            size="small"
          >
            <MenuItem value="all">All Doctors</MenuItem>
            {doctors.map((doctor) => (
              <MenuItem key={doctor.id} value={doctor.id}>
                {doctor.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {filteredTreatments.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No treatment records found 📋
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Treatment #</strong></TableCell>
                  <TableCell><strong>Patient Name</strong></TableCell>
                  <TableCell><strong>MRN</strong></TableCell>
                  <TableCell><strong>Date Range</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Days</strong></TableCell>
                  <TableCell align="right"><strong>Total Amount</strong></TableCell>
                  <TableCell align="right"><strong>Physio Split</strong></TableCell>
                  <TableCell align="right"><strong>Doctor Split</strong></TableCell>
                  <TableCell align="right"><strong>Hospital Split</strong></TableCell>
                  <TableCell><strong>Added By</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTreatments.map((treatment) => {
                  const isMyTreatment = treatment.physiotherapist_id === currentPhysioId;
                  
                  return (
                    <TableRow 
                      key={treatment.id} 
                      hover
                      sx={{ 
                        bgcolor: isMyTreatment ? 'success.lighter' : 'inherit',
                        '&:hover': {
                          bgcolor: isMyTreatment ? 'success.light' : 'action.hover'
                        }
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {treatment.treatment_number}
                        </Typography>
                      </TableCell>
                      <TableCell>{treatment.patient_name}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {treatment.medical_record_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(treatment.from_date).toLocaleDateString()} - {new Date(treatment.to_date).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexDirection: 'column' }}>
                          <Chip
                            label={treatment.treatment_type.toUpperCase()}
                            color={getTypeColor(treatment.treatment_type)}
                            size="small"
                          />
                          {treatment.op_type && (
                            <Chip
                              label={treatment.op_type.toUpperCase()}
                              color={getOPTypeColor(treatment.op_type)}
                              size="small"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{treatment.number_of_days}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" fontWeight="bold" color="primary">
                          ₹{treatment.total_amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body1" 
                          color="success.main"
                          fontWeight={isMyTreatment ? 'bold' : 'normal'}
                        >
                          ₹{treatment.physio_split.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" color="info.main">
                          ₹{treatment.doctor_split.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" color="warning.main">
                          ₹{treatment.hospital_split.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={treatment.created_by_name || 'Unknown'}
                          color={isMyTreatment ? 'success' : 'default'}
                          size="small"
                          variant={isMyTreatment ? 'filled' : 'outlined'}
                        />
                        {isMyTreatment && (
                          <Typography variant="caption" display="block" color="success.main">
                            You
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* Totals Row */}
                <TableRow sx={{ bgcolor: 'grey.200' }}>
                  <TableCell colSpan={6}>
                    <Typography variant="h6" fontWeight="bold">
                      TOTAL ({filteredTreatments.length} treatments)
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      ₹{totals.totalAmount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      ₹{totals.physioSplit.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" fontWeight="bold" color="info.main">
                      ₹{totals.doctorSplit.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" fontWeight="bold" color="warning.main">
                      ₹{totals.hospitalSplit.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Summary Cards */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, bgcolor: 'primary.lighter', textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Billing
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    ₹{totals.totalAmount.toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, bgcolor: 'success.lighter', textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Physio Split
                  </Typography>
                  <Typography variant="h5" color="success.main" fontWeight="bold">
                    ₹{totals.physioSplit.toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, bgcolor: 'info.lighter', textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Doctor Split
                  </Typography>
                  <Typography variant="h5" color="info.main" fontWeight="bold">
                    ₹{totals.doctorSplit.toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, bgcolor: 'warning.lighter', textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Hospital Split
                  </Typography>
                  <Typography variant="h5" color="warning.main" fontWeight="bold">
                    ₹{totals.hospitalSplit.toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </>
      )}
    </Paper>
  );
}

export default TreatmentList;