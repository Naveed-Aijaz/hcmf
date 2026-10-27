import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchMe } from './store/authSlice';
import { Typography, Paper, Chip } from '@mui/material';

import AIAssistant from './components/AIAssistant';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Leave from './pages/Leave';
import Employees from './pages/Employees';
import Payroll from './pages/Payroll';

// Clearly marked as unavailable: no fake functionality.
function ComingSoon({ title, subtitle }) {
  return (
    <Paper
      elevation={0}
      sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0', textAlign: 'center', maxWidth: 520, mx: 'auto', mt: 6 }}
    >
      <Typography variant="h5" fontWeight={700} mb={1}>{title}</Typography>
      <Chip label="Coming soon" size="small" color="warning" sx={{ mb: 2 }} />
      <Typography color="text.secondary">{subtitle || 'This module is not available yet.'}</Typography>
    </Paper>
  );
}

const STAFF = ['Admin', 'HR'];

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leaves" element={<Leave />} />
          <Route path="employees" element={<ProtectedRoute roles={STAFF}><Employees /></ProtectedRoute>} />
          <Route path="payroll" element={<ProtectedRoute roles={STAFF}><Payroll /></ProtectedRoute>} />
          <Route path="payslips" element={<ComingSoon title="My Payslips" subtitle="Payslips will appear here once payroll finalisation is implemented." />} />
          <Route path="settings" element={<ProtectedRoute roles={['Admin']}><ComingSoon title="Organization Setup" subtitle="Departments, designations, leave types and holidays." /></ProtectedRoute>} />
          <Route path="ai" element={<AIAssistant />} />
          <Route path="announcements" element={<ProtectedRoute roles={STAFF}><ComingSoon title="Announcements" /></ProtectedRoute>} />
          <Route path="audit" element={<ProtectedRoute roles={['Admin']}><ComingSoon title="Audit Log" subtitle="Tracking of create, update and approve actions." /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
