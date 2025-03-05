// src/services/auth-service.js
import axios from 'axios';

// Create a separate axios instance to avoid circular dependencies
const refreshAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Function to refresh token
export const refreshToken = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('No refresh token available');
    }
    
    // Call the refresh endpoint with the current token in the header
    return await refreshAxios.post('/refresh', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};