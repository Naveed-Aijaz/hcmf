import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Stack, TextField, MenuItem, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, CircularProgress, Pagination, InputAdornment, Switch,
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { listUsersApi, createUserApi, updateUserApi } from '../api/userApi';
import { errorMessage } from '../api/axios';

const emptyForm = { name: '', email: '', password: '', role: 'Employee', department: '', designation: '' };

export default function Employees() {
  const { user: me } = useSelector((s) => s.auth);
  const isAdmin = me?.role === 'Admin';

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const limit = 20;

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => { setQuery(q); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await listUsersApi({ page, limit, q: query || undefined, role: role || undefined });
      setRows(res.data || []);
      setTotal(res.total || 0);
    } catch (e) {
      setError(errorMessage(e, 'Failed to load employees'));
    } finally {
      setLoading(false);
    }
  }, [page, query, role]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    setSaving(true);
    setFormError('');
    try {
      const payload = { ...form };
      if (!payload.department) delete payload.department;
      if (!payload.designation) delete payload.designation;
      await createUserApi(payload);
      setOpen(false);
      setForm(emptyForm);
      setNotice('Account created. Share the temporary password with the user securely.');
      load();
    } catch (e) {
      setFormError(errorMessage(e, 'Failed to create account'));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u) => {
    setError('');
    try {
      await updateUserApi(u._id, { isActive: !u.isActive });
      load();
    } catch (e) {
      setError(errorMessage(e, 'Failed to update user'));
    }
  };

  const changeRole = async (u, newRole) => {
    setError('');
    try {
      await updateUserApi(u._id, { role: newRole });
      load();
    } catch (e) {
      setError(errorMessage(e, 'Failed to update role'));
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Employees</Typography>
          <Typography variant="body2" color="text.secondary">{total} total</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setFormError(''); setOpen(true); }}>
          Add account
        </Button>
      </Stack>

      {notice && <Alert severity="success" onClose={() => setNotice('')} sx={{ mb: 2 }}>{notice}</Alert>}
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField
          size="small" placeholder="Search name, email, department" value={q}
          onChange={(e) => setQ(e.target.value)} sx={{ minWidth: { sm: 320 } }}
          inputProps={{ 'aria-label': 'Search employees' }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
        />
        <TextField select size="small" label="Role" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} sx={{ minWidth: 140 }}>
          <MenuItem value="">All roles</MenuItem>
          <MenuItem value="Admin">Admin</MenuItem>
          <MenuItem value="HR">HR</MenuItem>
          <MenuItem value="Employee">Employee</MenuItem>
        </TextField>
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Active</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={24} /></TableCell></TableRow>
              )}
              {!loading && rows.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center">No employees found</TableCell></TableRow>
              )}
              {!loading && rows.map((u) => {
                const self = u._id === me?.id;
                return (
                  <TableRow key={u._id} hover>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.department || '-'}</TableCell>
                    <TableCell>
                      {isAdmin && !self ? (
                        <TextField select size="small" variant="standard" value={u.role} onChange={(e) => changeRole(u, e.target.value)} aria-label={`Role for ${u.name}`}>
                          <MenuItem value="Admin">Admin</MenuItem>
                          <MenuItem value="HR">HR</MenuItem>
                          <MenuItem value="Employee">Employee</MenuItem>
                        </TextField>
                      ) : (
                        <Chip size="small" label={u.role} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        size="small" checked={u.isActive !== false} disabled={!isAdmin || self}
                        onChange={() => toggleActive(u)} inputProps={{ 'aria-label': `Active status for ${u.name}` }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {total > limit && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination count={Math.ceil(total / limit)} page={page} onChange={(_, p) => setPage(p)} />
          </Box>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add account</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <TextField label="Temporary password (min 8 chars)" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <TextField select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} disabled={!isAdmin} helperText={!isAdmin ? 'HR can create Employee accounts only' : ''}>
              <MenuItem value="Employee">Employee</MenuItem>
              {isAdmin && <MenuItem value="HR">HR</MenuItem>}
              {isAdmin && <MenuItem value="Admin">Admin</MenuItem>}
            </TextField>
            <TextField label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            <TextField label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving || !form.name || !form.email || form.password.length < 8}>
            {saving ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
