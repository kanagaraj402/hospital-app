import axios from 'axios';

// Use /api proxy when in production (Docker), localhost in development
const API_URL = import.meta.env.DEV 
  ? 'http://localhost:8000'
  : '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// AUTH API
// ============================================

export const login = (credentials) => api.post('/login', credentials);
export const getUser = (userId) => api.get(`/users/${userId}`);

// ============================================
// PHYSIOTHERAPIST API
// ============================================

export const getPhysioByUserId = (userId) => api.get(`/physiotherapists/user/${userId}`);

// ============================================
// ADMIN - DOCTOR API
// ============================================

export const createDoctor = (doctorData, adminUserId) => 
  api.post(`/admin/doctors?admin_user_id=${adminUserId}`, doctorData);

export const getAllDoctors = () => api.get('/admin/doctors');

export const getDoctorById = (doctorId) => api.get(`/admin/doctors/${doctorId}`);

export const updateDoctor = (doctorId, doctorData, adminUserId) => 
  api.put(`/admin/doctors/${doctorId}?admin_user_id=${adminUserId}`, doctorData);

export const deleteDoctor = (doctorId, adminUserId) => 
  api.delete(`/admin/doctors/${doctorId}?admin_user_id=${adminUserId}`);

export const toggleDoctorStatus = (doctorId, adminUserId) =>
  api.patch(`/admin/doctors/${doctorId}/toggle-status?admin_user_id=${adminUserId}`);

// ============================================
// ADMIN - USER API
// ============================================

export const createPhysioUser = (physioData, adminUserId) =>
  api.post(`/admin/users/physiotherapist?admin_user_id=${adminUserId}`, physioData);

export const getAllUsers = (adminUserId, activeOnly = false) =>
  api.get(`/admin/users?admin_user_id=${adminUserId}&active_only=${activeOnly}`);

export const getUserById = (userId, adminUserId) =>
  api.get(`/admin/users/${userId}?admin_user_id=${adminUserId}`);

export const updateUser = (userId, userData, adminUserId) =>
  api.put(`/admin/users/${userId}?admin_user_id=${adminUserId}`, userData);

export const toggleUserStatus = (userId, adminUserId) =>
  api.patch(`/admin/users/${userId}/toggle-status?admin_user_id=${adminUserId}`);

export const resetUserPassword = (userId, newPassword, adminUserId) =>
  api.patch(`/admin/users/${userId}/reset-password?admin_user_id=${adminUserId}&new_password=${newPassword}`);

export const deleteUser = (userId, adminUserId) =>
  api.delete(`/admin/users/${userId}?admin_user_id=${adminUserId}`);

// ============================================
// ADMIN - HOSPITAL CONFIG API
// ============================================

export const getHospitalConfig = () => api.get('/admin/hospital-config');

export const updateHospitalConfig = (configData, adminUserId) =>
  api.put(`/admin/hospital-config?admin_user_id=${adminUserId}`, configData);

// ============================================
// TREATMENT API
// ============================================

export const createTreatment = (treatmentData, physioUserId) => 
  api.post(`/treatments?physio_user_id=${physioUserId}`, treatmentData);

export const calculateTreatmentPreview = (treatmentData, physioUserId) =>
  api.post(`/treatments/calculate-preview?physio_user_id=${physioUserId}`, treatmentData);

export const getDashboardStats = (physioUserId, year = null, month = null) => {
  let url = `/treatments/dashboard-stats?physio_user_id=${physioUserId}`;
  if (year) url += `&year=${year}`;
  if (month) url += `&month=${month}`;
  return api.get(url);
};

export const getMyTreatments = (physioUserId, year = null, month = null) => {
  let url = `/treatments/my-treatments?physio_user_id=${physioUserId}`;
  if (year) url += `&year=${year}`;
  if (month) url += `&month=${month}`;
  return api.get(url);
};

export const getAllTreatmentsList = (year = null, month = null) => {
  let url = '/treatments/all-treatments';
  const params = [];
  if (year) params.push(`year=${year}`);
  if (month) params.push(`month=${month}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  return api.get(url);
};

export const getAllTreatments = () => api.get('/treatments');

export const getTreatmentById = (treatmentId) => api.get(`/treatments/${treatmentId}`);

export default api;