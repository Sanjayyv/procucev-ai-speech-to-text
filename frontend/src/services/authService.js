
import api from './api';

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};


export const saveTranscription = async (data) => {
  const response = await api.post('/transcriptions', data);
  return response.data;
};

export const getTranscriptions = async () => {
  const response = await api.get('/transcriptions');
  return response.data;
};

export const updateTranscription = async (id, data) => {
  const response = await api.put(`/transcriptions/${id}`, data);
  return response.data;
};

export const deleteTranscription = async (id) => {
  const response = await api.delete(`/transcriptions/${id}`);
  return response.data;
};

export const logoutUser = async () => {
  return (await api.post('/auth/logout')).data;
};

