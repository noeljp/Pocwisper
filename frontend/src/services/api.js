import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8010';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },

  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await axios.post(`${API_URL}/auth/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Transcription services
export const transcriptionService = {
  create: async (formData) => {
    const response = await api.post('/transcriptions/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  process: async (transcriptionId) => {
    const response = await api.post(`/transcriptions/${transcriptionId}/process`);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/transcriptions/');
    return response.data;
  },

  getOne: async (transcriptionId) => {
    const response = await api.get(`/transcriptions/${transcriptionId}`);
    return response.data;
  },

  download: async (transcriptionId) => {
    const response = await api.get(`/transcriptions/${transcriptionId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  delete: async (transcriptionId) => {
    await api.delete(`/transcriptions/${transcriptionId}`);
  },
};

export default api;
