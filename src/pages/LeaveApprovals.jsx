import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  Chip, Button, Stack, Alert, CircularProgress, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import { getAllLeavesApi, updateLeaveStatusApi } from '../api/leaveApi';
import { errorMessage } from '../api/axios';

const statusColor = { Pending: 'warning', Approved: 'success', Rejected: 'error' };
const fmt = (d) => new Date(d).toLocaleDateString();

export default function LeaveApprovals() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllLeavesApi(filter === 'All' ? undefined : filter);
      setRows(res.data || []);
    } catch (e) {
      setError(errorMessage(e, 'Failed to load leave requests'));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const decide = async (id, status) => {
    setBusyId(id);
    setError('');
    try {
      await updateLeaveStatusApi(id, status);
      await load();
    } catch (e) {
      setError(errorMessage(e, 'Failed to update request'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>Team leave requests</Typography>
      <ToggleButtonGroup exclusive size="small" value={filter} onChange={(_, v) => v && setFilter(v)} sx={{ mb: 2 }}>
        {['Pending', 'Approved', 'Rejected', 'All'].map((f) => (
          <ToggleButton key={f} value={f} sx={{ textTransform: 'none' }}>{f}</ToggleButton>
        ))}
      </ToggleButtonGroup>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell><TableCell>Type</TableCell><TableCell>From</TableCell>
                <TableCell>To</TableCell><TableCell>Reason</TableCell><TableCell>Status</TableCell><TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={24} /></TableCell></TableRow>}
              {!loading && rows.length === 0 && <TableRow><TableCell colSpan={7} align="center">No requests</TableCell></TableRow>}
              {!loading && rows.map((l) => (
                <TableRow key={l._id} hover>
                  <TableCell>{l.userId?.name || 'Unknown'}</TableCell>
                  <TableCell>{l.leaveType}</TableCell>
                  <TableCell>{fmt(l.startDate)}</TableCell>
                  <TableCell>{fmt(l.endDate)}</TableCell>
                  <TableCell sx={{ maxWidth: 240 }}>{l.reason}</TableCell>
                  <TableCell><Chip size="small" label={l.status} color={statusColor[l.status]} /></TableCell>
                  <TableCell align="right">
                    {l.status === 'Pending' && (
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" variant="contained" color="success" disabled={busyId === l._id} onClick={() => decide(l._id, 'Approved')}>Approve</Button>
                        <Button size="small" variant="outlined" color="error" disabled={busyId === l._id} onClick={() => decide(l._id, 'Rejected')}>Reject</Button>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
