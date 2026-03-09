import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      lighter: '#e8f5e9',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      lighter: '#e1f5fe',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      lighter: '#fff3e0',
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Physiotherapist Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['physiotherapist']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Redirect based on role */}
          <Route 
            path="/" 
            element={
              <RoleBasedRedirect />
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

// Component to redirect based on user role
function RoleBasedRedirect() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (user.role === 'admin') {
    return <Navigate to="/admin" />;
  } else if (user.role === 'physiotherapist') {
    return <Navigate to="/dashboard" />;
  }
  
  return <Navigate to="/login" />;
}

export default App;