// src/services/chatService.js
'use client';

import axios from './axios';
import { initEcho, getEcho } from './echo';

export interface ChatMessage {
  id: number;
  message: string;
  sender_id: number;
  chat_session_id: number;
  attachment: string | null;
  type: string;
  created_at: string;
  updated_at: string;
  sender?: {
    id: number;
    name: string;
  };
}

export const chatService = {
    // Add a flag to track initialization
  isInitialized: false,
  // Initialize chat with authentication token
  initialize(token) {
    if (typeof window === 'undefined') return;
    if (token) {
        const echo = initEcho(token);
        this.isInitialized = !!echo;
        console.log('Chat service initialized:', this.isInitialized);
        return echo;
    }
    return null;
  },
  
  // Get all chat sessions for current user
  async getChatSessions() {
    try {
      const response = await axios.get('/chat/sessions');
      return response.data;
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      throw error;
    }
  },
  
  // Start a new chat session
  async startChatSession(customerId) {
    try {
      const response = await axios.post('/chat/start', { 
        customer_id: customerId 
      });
      return response.data;
    } catch (error) {
      console.error('Error starting chat session:', error);
      throw error;
    }
  },
  
  // Send a message in a specific session
  async sendMessage(sessionUuid, message, attachment = null, type = 'text') {
    try {
      // Create FormData if there's an attachment
      if (attachment) {
        const formData = new FormData();
        // Only append message if it's not empty
        if (message && message.trim()) {
          formData.append('message', message);
        }
        formData.append('type', type);
        formData.append('attachment', attachment);
        
        const response = await axios.post(`/chat/${sessionUuid}/send`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        return response.data;
      } else {
        // Regular text message
        const response = await axios.post(`/chat/${sessionUuid}/send`, {
          message,
          type
        });
        
        return response.data;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle validation errors with nested error objects
      if (error.response?.data?.errors) {
        // For validation errors, create a formatted message from all error fields
        const errorMessages = Object.entries(error.response.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        
        throw new Error(errorMessages);
      }
      // Handle simple error messages
      else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw error;
    }
  },
  
  // Subscribe to a private chat channel
  subscribeToChat(sessionUuid, onMessageReceived) {
    if (typeof window === 'undefined') return () => {};
    
    let echo = getEcho();  // Change from const to let
    if (!echo) {
      // Try to get token and reinitialize
      const savedToken = localStorage.getItem('auth_token');
      if (savedToken) {
        console.log('Attempting to reinitialize Echo in subscribeToChat');
        echo = this.initialize(savedToken);  // Now this assignment is valid
      }
    }
    
    if (!echo) {
      console.warn('Echo not initialized, please call initialize() first');
      return () => {};
    }
      
    console.log(`Subscribing to channel: chat.${sessionUuid}`);
    
    // Use the correct channel format that your Laravel app expects
    const channel = echo.private(`chat.${sessionUuid}`);
    
    // Listen to the MessageSent event
    channel.listen('.NewMessage', (e) => {
      if (onMessageReceived) {
        onMessageReceived(e.message);
      }
    });
    
    return () => {
      channel.stopListening('.NewMessage');
    };
  },
  
  // Load chat history for a specific session
  async loadChatHistory(sessionUuid) {
    try {
      const response = await axios.get(`/chat/${sessionUuid}/messages`);
      // Extract the messages array if it exists, otherwise return the whole response data
      // return response.data.messages || response.data || [];
      return (response.data.messages || response.data || []) as ChatMessage[];
    } catch (error) {
      console.error('Error loading chat history:', error);
      // throw error;
      return [];
    }
  },

  // Get details for a specific chat session
  async getChatSession(sessionUuid) {
    try {
      const response = await axios.get(`/chat/${sessionUuid}/details`);
      return response.data;
    } catch (error) {
      console.error('Error getting chat session details:', error);
      throw error;
    }
  },

  async updateChatSessionName(sessionUuid, name) {
    try {
      const response = await axios.put(`/chat/${sessionUuid}/details`, {
        name
      });
      return response.data;
    } catch (error) {
      console.error('Error updating chat session name:', error);
      throw error;
    }
  }


};