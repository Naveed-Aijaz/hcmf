import API from './axios';

export const listUsersApi = async (params = {}) => (await API.get('/users', { params })).data;
export const createUserApi = async (payload) => (await API.post('/users', payload)).data;
export const updateUserApi = async (id, payload) => (await API.put(`/users/${id}`, payload)).data;
