import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      return Promise.reject({
        message: error.response.data?.message || 'Server error occurred',
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject({
        message: 'Network error - please check your connection',
        status: 0
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
        status: 0
      });
    }
  }
);

// API functions
export const searchColleges = async (params = {}) => {
  try {
    const response = await api.get('api/search', { params });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getStates = async () => {
  try {
    const response = await api.get('api/search/states');
    return response;
  } catch (error) {
    throw error;
  }
};

export const getDistricts = async (state) => {
  try {
    const params = state && state !== 'All' ? { state } : {};
    const response = await api.get('api/search/districts', { params });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getCourses = async () => {
  try {
    const response = await api.get('api/search/courses');
    return response;
  } catch (error) {
    throw error;
  }
};

export const sendChatbotMessage = async (message) => {
  try {
    const response = await api.post('/chatbot', { message });
    return response;
  } catch (error) {
    throw error;
  }
};

export default api;