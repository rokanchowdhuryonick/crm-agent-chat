'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api'; // Import from your services folder
import axios from 'axios';
import { chatService } from '../services/chatService';

// Create the context
const AuthContext = createContext(null);

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Client-side only code
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');
      
      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          // if (typeof window !== 'undefined') {
            // Only initialize chat service on client side
            chatService.initialize(savedToken);
            console.log('Echo initialized with saved token');
          // }
        } catch (e) {
          console.error('Failed to parse stored user data:', e);
        }
      }
      
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    console.log('REAL login function called with:', email);
    
    try {
      setLoading(true);
      const data = await api.login(email, password);
      
      console.log('Login API response:', data);
      
      if (data?.token) {
        setToken(data.token);
        setUser(data.user);
        
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));

        // Initialize Echo with the token
        chatService.initialize(data.token);
        
        return { success: true };
      } else {
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    console.log('REAL register function called');
    
    try {
      setLoading(true);
      const data = await api.register(userData);
      
      if (data?.token) {
        setToken(data.token);
        setUser(data.user);
        
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        
        return { success: true };
      } else {
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call the logout API endpoint
      if (token) {
        await api.logout();
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local storage and state even if API call fails
      setToken(null);
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  };

  const updateToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem('auth_token', newToken);
    
    // Re-initialize Echo with the new token
    chatService.initialize(newToken);
  };

  // Create the context value object
  const contextValue = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateToken,
    isAuthenticated: !!token
  };

  // Provide the context value to children
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}