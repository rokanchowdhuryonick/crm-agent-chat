// src/services/api.js
import axios from './axios';

export const api = {
  async login(email, password) {
    try {
      const response = await axios.post('/login', { email, password });
      return response.data;
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(error.response.data.message || 'Login failed');
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server');
      } else {
        // Something happened in setting up the request
        throw new Error('Request failed');
      }
    }
  },
  
  async register(userData) {
    try {
      const response = await axios.post('/register', userData);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Registration failed');
      } else if (error.request) {
        throw new Error('No response from server');
      } else {
        throw new Error('Request failed');
      }
    }
  },

  async logout() {
    try {
      const response = await axios.post('/logout');
      return response.data;
    } catch (error) {
      console.error("API logout error:", error);
      throw error;
    }
  }

};
