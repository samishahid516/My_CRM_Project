import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Email APIs
export const getEmails = (params) => api.get('/emails', { params });
export const getEmailById = (id) => api.get(`/emails/${id}`);
export const createEmail = (data) => api.post('/emails', data);
export const updateEmail = (id, data) => api.put(`/emails/${id}`, data);
export const deleteEmail = (id) => api.delete(`/emails/${id}`);
export const replyToEmail = (id) => api.post(`/emails/${id}/reply`);
export const analyzeEmail = (id) => api.post(`/emails/${id}/analyze`);
export const toggleStar = (id) => api.post(`/emails/${id}/star`);

// Analytics API
export const getAnalytics = () => api.get('/analytics');

export default api;
