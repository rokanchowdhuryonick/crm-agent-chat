'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { RouteGuard } from '../../../components/auth/RouteGuard';
import { chatService } from '../../../services/chatService';
import { getEcho } from '../../../services/echo';
import { useAuth } from '../../../contexts/AuthContext';
import type { AuthContextType } from '../../../types/auth';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';

type Message = {
  id: number;
  text: string;
  sender: 'bot' | 'user';
};

interface ChatMessage {
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

export default function ChatSessionPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const router = useRouter();
  const { user, token } = useAuth() as AuthContextType;
  const recentlySentRef = useRef<Set<string>>(new Set());

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add a useEffect to ensure chat service is initialized
    useEffect(() => {
        if (typeof window !== 'undefined' && token) {
        // Make sure Echo is initialized before trying to subscribe
        chatService.initialize(token);
        console.log('Echo reinitialized in chat session page');
        }
    }, [token]);

  // Load chat history and subscribe to real-time updates
  useEffect(() => {
    if (typeof window === 'undefined' || !sessionId) return;
    
    let unsubscribe: () => void;
    
    const initializeChat = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Load chat history
        const history = await chatService.loadChatHistory(sessionId);
        // Add this type assertion or type check to fix the error
        const chatMessages = Array.isArray(history) ? history : [];
        
        // Transform history into the expected message format
        const formattedHistory = chatMessages.map((msg: ChatMessage) => ({
          id: msg.id,
          text: msg.message,
          sender: (user && msg.sender_id === user.id) ? 'user' : 'bot'
        })) as Message[];
        
        setMessages(formattedHistory);
        
        // Subscribe to real-time messages with better error handling
        const echo = getEcho(); // Import getEcho if needed
        console.log('Echo instance status:', echo ? 'available' : 'not available');
        
        unsubscribe = chatService.subscribeToChat(sessionId, (newMessage: ChatMessage) => {
        console.log('Real-time message received:', newMessage);
        setMessages(prev => {
          // Don't add if this message ID already exists
          if (prev.some(msg => msg.id === newMessage.id)) {
            console.log('Duplicate message detected, ignoring:', newMessage.id);
            return prev;
          }

          // Check if this is our own recently sent message coming back from the server
          if (newMessage.sender_id === user?.id && 
            recentlySentRef.current.has(newMessage.message)) {
            console.log('Own message detected coming back from server, ignoring');
            return prev;
          }

          // Also check for duplicate content from same sender (handles optimistic updates)
          if (prev.some(msg => 
            msg.text === newMessage.message && 
            msg.sender === (newMessage.sender_id === user?.id ? 'user' : 'bot')
          )) {
            console.log('Duplicate content detected, ignoring message');
            return prev;
          }
          
          return [
            ...prev,
            {
              id: newMessage.id,
              text: newMessage.message,
              sender: newMessage.sender_id === user?.id ? 'user' : 'bot'
            }
          ];
        });
        });
        
      } catch (err) {
        console.error('Chat initialization error:', err);
        setError('Failed to load chat history');
      } finally {
        setLoading(false);
      }
    };
    
    initializeChat();
    
    return () => {
      if (unsubscribe) {
        console.log('Cleaning up chat subscription');
        unsubscribe();
      }
    };
  }, [sessionId, user, token]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !sessionId) return;

    const messageText = newMessage.trim();
    // Track this message to prevent duplication when it comes back from the server
    recentlySentRef.current.add(messageText);
    // Clear tracking after a reasonable time (5 seconds)
    setTimeout(() => {
      recentlySentRef.current.delete(messageText);
    }, 5000);
    
    // Optimistic UI update
    const tempId = Date.now();
    setMessages(prev => [
      ...prev,
      { id: tempId, text: newMessage, sender: 'user' }
    ]);
    
    setNewMessage('');
    setSending(true);
    
    try {
      await chatService.sendMessage(sessionId, messageText);
      // Real message will come through the Pusher channel, but we'll ignore it thanks to our tracking
    } catch (err) {
      console.error('Error sending message:', err);
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setError('Failed to send message');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSending(false);
    }
  };

  return (
    <RouteGuard>
      <DashboardLayout>
        <div className="container mx-auto p-4">
          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() => router.push('/chat')}
              className="text-gray-400 bg-gray-800 border-gray-700 hover:text-white flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Sessions
            </Button>
          </div>
          
          <Card className="w-full h-[calc(100vh-12rem)] flex flex-col bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row justify-between items-center border-b border-gray-700">
              <CardTitle>Chat Session #{sessionId}</CardTitle>
              {loading && <Loader2 className="animate-spin text-gray-400" size={20} />}
            </CardHeader>
            
            {error && (
              <div className="mx-6 mt-2 p-2 bg-red-900/20 border border-red-500 rounded-md text-red-500 text-sm">
                {error}
              </div>
            )}
            
            <CardContent className="flex-1 overflow-hidden py-4">
              <ScrollArea className="h-full pr-4">
                {loading && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No messages yet. Start a conversation!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`rounded-xl px-4 py-3 max-w-[80%] border shadow-md ${
                            message.sender === 'user'
                              ? 'bg-secondary-black text-off-white border-gray-600' 
                              : 'bg-gradient-to-br from-gray-900 to-black text-gray-300 border-gray-600'
                          }`}
                        >
                          {message.text}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            
            <CardFooter className="border-t border-gray-700 p-4">
              <div className="flex w-full space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-secondary-black text-off-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={loading || sending}
                />
                <Button 
                  className="bg-secondary-black hover:bg-primary-black text-off-white"
                  onClick={handleSendMessage}
                  disabled={loading || sending || !newMessage.trim()}
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}