import API from './axios';

export const applyLeaveApi = async (leaveData) => (await API.post('/leaves', leaveData)).data;
export const getMyLeavesApi = async () => (await API.get('/leaves/my-leaves')).data;
export const getAllLeavesApi = async (status) =>
  (await API.get('/leaves', { params: status ? { status } : {} })).data;
export const updateLeaveStatusApi = async (id, status) =>
  (await API.put(`/leaves/${id}/status`, { status })).data;
