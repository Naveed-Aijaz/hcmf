import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Stack, TextField, MenuItem, Button, Alert, CircularProgress, Divider } from '@mui/material';
import API, { errorMessage } from '../api/axios';
import { listUsersApi } from '../api/userApi';

const now = new Date();

export default function Payroll() {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState('');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listUsersApi({ limit: 100, role: 'Employee' })
      .then((r) => setUsers(r.data || []))
      .catch((e) => setError(errorMessage(e, 'Failed to load employees')));
  }, []);

  const run = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await API.post('/payroll/generate', { userId, month: Number(month), year: Number(year) });
      setResult(res.data.data);
    } catch (e) {
      setError(errorMessage(e, 'Failed to calculate payroll'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 640 }}>
      <Typography variant="h4" fontWeight="bold" mb={0.5}>Payroll estimate</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Attendance-based estimate for one employee and month. Results are not saved and no payslips are issued yet.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <Stack spacing={2}>
          <TextField select label="Employee" value={userId} onChange={(e) => setUserId(e.target.value)}>
            {users.map((u) => <MenuItem key={u._id} value={u._id}>{u.name} ({u.email})</MenuItem>)}
          </TextField>
          <Stack direction="row" spacing={2}>
            <TextField select label="Month" value={month} onChange={(e) => setMonth(e.target.value)} fullWidth>
              {Array.from({ length: 12 }, (_, i) => <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>)}
            </TextField>
            <TextField label="Year" type="number" value={year} onChange={(e) => setYear(e.target.value)} fullWidth />
          </Stack>
          <Button variant="contained" onClick={run} disabled={!userId || loading}>
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Calculate'}
          </Button>
        </Stack>
        {result && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography><strong>{result.name}</strong> — {result.month}/{result.year}</Typography>
            <Typography>Days present/late: {result.presentDays}</Typography>
            <Typography>Daily rate: {result.dailyRate}</Typography>
            <Typography variant="h6" mt={1}>Estimated total: {result.totalSalary}</Typography>
          </>
        )}
      </Paper>
    </Box>
  );
}
