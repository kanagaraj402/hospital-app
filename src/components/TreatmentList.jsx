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
    <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5">
            All Treatment Records ({filteredTreatments.length})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedDoctor === 'all'
              ? 'Showing treatments from all physiotherapists'
              : 'Filtered by doctor'}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
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
          <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Treatment #</strong></TableCell>
                  <TableCell><strong>Patient Name</strong></TableCell>
                  <TableCell><strong>MRN</strong></TableCell>
                  <TableCell><strong>Date Range</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Days</strong></TableCell>
                  <TableCell><strong>Doctor</strong></TableCell>
                  <TableCell align="right"><strong>Total Amount</strong></TableCell>
                  <TableCell align="right"><strong>Physio Split</strong></TableCell>
                  <TableCell align="right"><strong>Doctor Split</strong></TableCell>
                  <TableCell align="right"><strong>Hospital Split</strong></TableCell>
                  <TableCell><strong>Added By</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTreatments.map((treatment) => {
                  const isMyTreatment =
                    treatment.physiotherapist_id === currentPhysioId;
                  return (
                    <TableRow
                      key={treatment.id}
                      hover
                      sx={{
                        bgcolor: isMyTreatment ? 'success.lighter' : 'inherit'
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
                        {new Date(treatment.from_date).toLocaleDateString()} -{' '}
                        {new Date(treatment.to_date).toLocaleDateString()}
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
                      <TableCell>
                          {treatment.doctor?.name || 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        ₹{treatment.total_amount.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        ₹{treatment.physio_split.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        ₹{treatment.doctor_split.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        ₹{treatment.hospital_split.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={treatment.created_by_name || 'Unknown'}
                          size="small"
                          color={isMyTreatment ? 'success' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow sx={{ bgcolor: 'grey.200' }}>
                  <TableCell colSpan={7}>
                    <Typography fontWeight="bold">
                      TOTAL ({filteredTreatments.length})
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    ₹{totals.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    ₹{totals.physioSplit.toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    ₹{totals.doctorSplit.toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    ₹{totals.hospitalSplit.toFixed(2)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

        </>
      )}
    </Paper>
  );
}

export default TreatmentList;