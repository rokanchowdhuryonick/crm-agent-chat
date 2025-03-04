// src/services/chatService.js
'use client';

import axios from './axios';
import { initEcho, getEcho } from './echo';

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
  async sendMessage(sessionId, message, type = 'text') {
    try {
      const response = await axios.post(`/chat/${sessionId}/send`, {
        chat_session_id: sessionId,
        message,
        type
      });
      
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
  
  // Subscribe to a private chat channel
  subscribeToChat(sessionId, onMessageReceived) {
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
      
    console.log(`Subscribing to channel: chat.${sessionId}`);
    
    // Use the correct channel format that your Laravel app expects
    const channel = echo.private(`chat.${sessionId}`);
    
    // Listen to the MessageSent event
    channel.listen('.NewMessage', (e) => {
      if (onMessageReceived) {
        onMessageReceived(e.message);
      }
    });
    
    return () => {
      channel.stopListening('MessageSent');
    };
  },
  
  // Load chat history for a specific session
  async loadChatHistory(sessionId) {
    try {
      const response = await axios.get(`/chat/${sessionId}/messages`);
      // Extract the messages array if it exists, otherwise return the whole response data
      return response.data.messages || response.data || [];
    } catch (error) {
      console.error('Error loading chat history:', error);
      throw error;
    }
  }
};