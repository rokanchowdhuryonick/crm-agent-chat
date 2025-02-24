// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { ChatScreen } from '@/components/chat/ChatScreen';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! How can I help you today?", sender: "bot" },
    { id: 2, text: "Hi! I have a question about your services.", sender: "user" },
  ]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleSendMessage = (text: string) => {
    setMessages(prev => [
      ...prev,
      { id: prev.length + 1, text, sender: 'user' },
      { id: prev.length + 2, text: 'This is a mock response!', sender: 'bot' }
    ]);
  };

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return <ChatScreen messages={messages} onSendMessage={handleSendMessage} />;
}