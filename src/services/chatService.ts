// src/services/chatService.ts
'use client';

import axios from './axios';
import { initEcho, getEcho } from './echo';

// Export the interface
export interface ChatMessage {
  id: number;
  message: string;
  sender_id: number | null; // Allow null for system messages
  chat_session_id: number;
  attachment: string | null;
  attachment_url?: string | null;
  thumbnail_url?: string | null;
  type: string;
  created_at: string;
  updated_at: string;
  sender?: {
    id: number;
    name: string;
  } | null; // Allow null sender
}

export const chatService = {
  // Add a flag to track initialization
  isInitialized: false,
  // Initialize chat with authentication token
  initialize(token: string) {
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
  async startChatSession(customerId: number) {
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
  
  // Update sendMessage signature to accept File | null for attachment
  async sendMessage(sessionUuid: string, message: string, attachment: File | null = null, type: string = 'text') {
    try {
      if (attachment) {
        const formData = new FormData();
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
        const response = await axios.post(`/chat/${sessionUuid}/send`, {
          message,
          type
        });

        return response.data;
      }
    } catch (error: any) { // Type error as any
      console.error('Error sending message:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.entries(error.response.data.errors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
          .join('\n');
        throw new Error(errorMessages);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Subscribe to a private chat channel
  subscribeToChat(sessionUuid: string, onMessageReceived: (message: ChatMessage) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    let echo = getEcho();
    if (!echo) {
      const savedToken = localStorage.getItem('auth_token');
      if (savedToken) {
        console.log('Attempting to reinitialize Echo in subscribeToChat');
        echo = this.initialize(savedToken);
      }
    }

    if (!echo) {
      console.warn('Echo not initialized, please call initialize() first');
      return () => {};
    }

    console.log(`Subscribing to channel: chat.${sessionUuid}`);
    const channel = echo.private(`chat.${sessionUuid}`);

    channel.listen('.NewMessage', (e: { message: ChatMessage }) => {
      if (onMessageReceived) {
        onMessageReceived(e.message);
      }
    });

    // Return the unsubscribe function
    return () => {
      console.log(`Unsubscribing from channel: chat.${sessionUuid}`);
      channel.stopListening('.NewMessage');
      // Optionally leave the channel if no longer needed
      // echo.leave(`chat.${sessionUuid}`);
    };
  },
  
  // Load chat history for a specific session
  async loadChatHistory(sessionUuid: string): Promise<ChatMessage[]> {
    try {
      const response = await axios.get<{ messages: ChatMessage[] }>(`/chat/${sessionUuid}/messages`);
      return response.data.messages || [];
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  },

  // Get details for a specific chat session
  async getChatSession(sessionUuid: string): Promise<{ name?: string, status?: string } | null> {
    try {
      const response = await axios.get(`/chat/${sessionUuid}/details`);
      return response.data;
    } catch (error) {
      console.error('Error getting chat session details:', error);
      throw error;
    }
  },

  async updateChatSessionName(sessionUuid: string, name: string): Promise<any> {
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