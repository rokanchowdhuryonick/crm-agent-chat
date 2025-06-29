// src/services/api.js
import customAxios from './axios';
import axios from 'axios';

// Helper function to format validation errors
const formatValidationErrors = (errors) => {
  let messages = [];
  for (const key in errors) {
    if (errors.hasOwnProperty(key)) {
      messages = messages.concat(errors[key]); // Add all messages for this key
    }
  }
  // Join messages, limit length if necessary, or just join with newline/space
  return messages.join('. ') || 'Validation failed'; 
};

export const api = {
  async login(email, password) {
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_BASE_URL + '/login', 
        { email, password }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const responseData = error.response.data;
        let errorMessage = 'Login failed'; // Default
        if (responseData?.errors) {
          errorMessage = formatValidationErrors(responseData.errors);
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (responseData?.error) {
          errorMessage = responseData.error;
        }
        throw new Error(errorMessage);
      } else if (error.request) {
        // No response received (server down or no internet)
        throw new Error('No response from server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request
        // Error in request setup
        throw new Error(`Request failed: ${error.message}`);
      }
    }
  },
  
  async register(userData) {
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_BASE_URL + '/register', 
        userData
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        // Server responded with non-2xx status
        const responseData = error.response.data;
        let errorMessage = 'Registration failed'; // Default
        if (responseData?.errors) {
          errorMessage = formatValidationErrors(responseData.errors);
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        }
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error('No response from server');
      } else {
        throw new Error('Request failed');
      }
    }
  },

  async logout() {
    try {
      const response = await customAxios.post('/logout');
      return response.data;
    } catch (error) {
      console.error("API logout error:", error);
      throw error;
    }
  }

};
