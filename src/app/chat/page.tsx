'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { RouteGuard } from '../../components/auth/RouteGuard';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, Loader2, Clock, RefreshCw, Tag  } from 'lucide-react';
import { AuthContextType } from '@/types/auth';

interface ChatSession {
  id: number;
  uuid: string,
  name: string,
  customer_id: number;
  agent_id: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function ChatSessionsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const { user } =  useAuth() as AuthContextType;
  const router = useRouter();

  // Load chat sessions on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loadSessions = async () => {
      try {
        setLoading(true);
        const data = await chatService.getChatSessions();
        setSessions(data);
      } catch (err) {
        console.error('Error loading chat sessions:', err);
        setError('Failed to load chat sessions');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadSessions();
    }
  }, [user]);

  // Start a new chat session
  const handleCreateSession = async () => {
    if (!user) return;
    
    try {
      setCreating(true);
      const sessionData = await chatService.startChatSession(user.id);
      // Navigate to the new chat session
      router.push(`/chat/${sessionData.session.uuid}`);
    } catch (err) {
      console.error('Error creating chat session:', err);
      setError('Failed to create new chat session');
      setCreating(false);
    }
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <RouteGuard>
      <DashboardLayout>
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Chat Sessions</h1>
            <Button 
              onClick={handleCreateSession} 
              disabled={creating}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquarePlus className="h-4 w-4" />}
              {creating ? 'Creating...' : 'New Chat Session'}
            </Button>
          </div>
          
          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-500 p-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : sessions.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-400 mb-4">No chat sessions found.</p>
                <Button 
                  onClick={handleCreateSession}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Start a New Conversation
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((session) => (
                <Card 
                  key={session.id} 
                  className="bg-gray-800 border-gray-700 hover:border-blue-500 cursor-pointer transition-all"
                  onClick={() => router.push(`/chat/${session.uuid}`)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{session.name || `Session #${session.id}`}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-gray-400 mb-2">
                      <Clock className="h-4 w-4 mr-2" />
                      Created: {formatDate(session.created_at)}
                    </div>
                    <div className="flex items-center text-sm text-gray-400 mb-2">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Last updated: {formatDate(session.updated_at)}
                    </div>
                    <div className="flex items-center mt-2">
                      <Tag className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-400">Status: </span>
                      <span className={`ml-1 px-2 py-1 rounded text-xs ${
                        session.status === 'active' ? 'bg-green-900/30 text-green-400' :
                        session.status === 'closed' ? 'bg-red-900/30 text-red-400' :
                        'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {session.status.toUpperCase()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}