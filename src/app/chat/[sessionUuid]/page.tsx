'use client';

import { useState, useEffect, useRef, useLayoutEffect, useCallback, memo } from 'react';
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
import { Send, ArrowLeft, Loader2, Check, X, Edit2, Paperclip, File as FileIcon } from 'lucide-react';
import Image from 'next/image';

import { showToast } from '../../../utils/toast';


type Message = {
  id: number;
  text: string;
  sender: 'bot' | 'user' | 'system';
  type?: string;
  timestamp?: string;
};

interface ChatMessage {
  id: number;
  message: string;
  sender_id: number | null;
  chat_session_id: number;
  attachment: string | null;
  type: string;
  created_at: string;
  updated_at: string;
  sender?: {
    id: number;
    name: string;
  } | null;
}

// Create a memoized message component to prevent re-renders
const ChatMessage = memo(({ message, getAttachmentUrl }) => {
  return (
    <div
      data-message-id={message.id}
      className={`flex ${
        message.sender === 'user' 
          ? 'justify-end' 
          : message.sender === 'system'
            ? 'justify-center'
            : 'justify-start'
      }`}
    >
      <div
        className={`rounded-xl px-4 py-3 ${
          message.sender === 'system' 
            ? 'max-w-[95%] w-4/5' 
            : 'max-w-[80%]'
        } border shadow-md ${
          message.sender === 'user'
            ? 'bg-secondary-black text-off-white border-gray-600' 
            : message.sender === 'system'
              ? 'bg-gray-900 text-gray-300 border-gray-800 text-sm'
              : 'bg-gradient-to-br from-gray-900 to-black text-gray-300 border-gray-600'
        }`}
      >
        {message.sender === 'system' && <div className="text-xs text-gray-500 mb-1 font-medium">System</div>}
        
        <MessageContent message={message} getAttachmentUrl={getAttachmentUrl} />
        
        {message.timestamp && (
          <div className="text-xs text-gray-500 mt-1 text-right">
            {new Date(message.timestamp).toLocaleString('en-GB', { 
              day: 'numeric',
              month: 'numeric', 
              year: 'numeric',
              hour: '2-digit', 
              minute: '2-digit'
            })}
          </div>
        )}
      </div>
    </div>
  );
});
ChatMessage.displayName = 'ChatMessage';

// Memoize the MessageContent component too
const MessageContent = memo(({ message, getAttachmentUrl }) => {
  switch (message.type) {
    case 'image':
      return (
        <div className="flex flex-col gap-2 chat-message-content">
          {message.text && <p>{message.text}</p>}
          <div className="relative w-full max-w-[300px]">
            <Image 
              // Check if attachment is a blob URL (from optimistic updates) or a server path
              src={message.attachment?.startsWith('blob:') 
                ? message.attachment  // Use blob URL directly
                : getAttachmentUrl(message.attachment)} // Use server URL for paths
              alt={message.text || "Image attachment"} 
              width={300}
              height={300}
              className="rounded-md object-contain"
              style={{
                maxHeight: '300px',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
              }}
              loading="lazy"
              onLoad={() => document.querySelector('[data-message-id="' + message.id + '"]')?.scrollIntoView({ behavior: 'smooth' })}
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />
          </div>
        </div>
      );
      
    case 'video':
      return (
        <div className="flex flex-col gap-2 chat-message-content">
          {message.text && <p>{message.text}</p>}
          <div className="relative w-full max-w-[300px]">
            <video 
              src={message.attachment?.startsWith('blob:') 
                ? message.attachment 
                : getAttachmentUrl(message.attachment)} 
              controls
              preload="metadata"
              className="rounded-md object-contain max-h-[300px] w-auto"
              style={{
                maxWidth: '100%',
                backgroundColor: 'rgba(0,0,0,0.2)'
              }}
              onLoadedData={() => document.querySelector('[data-message-id="' + message.id + '"]')?.scrollIntoView({ behavior: 'smooth' })}
              poster={`${process.env.NEXT_PUBLIC_API_HOST_URL}/public/video-poster.png`}
            />
          </div>
        </div>
      );
      
    case 'file':
      return (
        <div className="flex flex-col gap-2">
          <p>{message.text}</p>
          <a 
            href={getAttachmentUrl(message.attachment)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gray-800 text-blue-400 hover:text-blue-300 p-2 rounded-md"
          >
            <FileIcon className="h-4 w-4" />
            Download Attachment
          </a>
        </div>
      );
    
    case 'stage':
      return <p>{message.text}</p>;
      
    case 'text':
    default:
      return <p>{message.text}</p>;
  }
});
MessageContent.displayName = 'MessageContent';

export default function ChatSessionPage() {
  const [chatSession, setChatSession] = useState<{name?: string, status?: string} | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const sessionUuid = params?.sessionUuid as string;
  const router = useRouter();
  const { user, token } = useAuth() as AuthContextType;
  const recentlySentRef = useRef<Set<string>>(new Set());
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !sessionUuid) return;
    
    const fetchChatSession = async () => {
      try {
        // Add a method to chatService to get a specific chat session
        const sessionData = await chatService.getChatSession(sessionUuid);
        setChatSession(sessionData);
      } catch (err) {
        console.error('Error fetching chat session details:', err);
      }
    };
    
    fetchChatSession();
  }, [sessionUuid]);

  // Scroll to bottom when messages change
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    scrollToBottom();
    
    // Also scroll after a delay to handle image loading
    const timeoutId = setTimeout(scrollToBottom, 500);
    
    return () => clearTimeout(timeoutId);
  }, [messages]);

  useEffect(() => {
    const handleImageLoad = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    // Add event listeners to all images in the message area
    const images = document.querySelectorAll('.chat-message-content img');
    images.forEach(img => img.addEventListener('load', handleImageLoad));
    
    return () => {
      images.forEach(img => img.removeEventListener('load', handleImageLoad));
    };
  }, [messages]);

  // Add a useEffect to ensure chat service is initialized
    // useEffect(() => {
    //     if (typeof window !== 'undefined' && token) {
    //     // Make sure Echo is initialized before trying to subscribe
    //     chatService.initialize(token);
    //     console.log('Echo reinitialized in chat session page');
    //     }
    // }, [token]);
    useEffect(() => {
      if (typeof window !== 'undefined' && token) {
        // Make sure Echo is initialized before trying to subscribe
        chatService.initialize(token);
        console.log('Echo reinitialized in chat session page');
        
        // Add connection status event listeners using Echo's built-in methods
        const echo = getEcho();
        
      }
    }, [token]);
    

  // Load chat history and subscribe to real-time updates
  useEffect(() => {
    if (typeof window === 'undefined' || !sessionUuid) return;
    
    let unsubscribe: () => void;
    
    const initializeChat = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Load chat history
        const history = await chatService.loadChatHistory(sessionUuid);
        // Add this type assertion or type check to fix the error
        const chatMessages = Array.isArray(history) ? history : [];
        
        // Transform history into the expected message format
        const formattedHistory = chatMessages.map((msg: ChatMessage) => ({
          id: msg.id,
          text: msg.message,
          sender: msg.sender_id === user?.id ? 'user' : (msg.type === 'stage' ? 'system' : 'bot'),
          type: msg.type,
          attachment: msg.attachment,
          timestamp: msg.created_at
        })) as Message[];
        
        setMessages(formattedHistory);
        
        // Subscribe to real-time messages with better error handling
        const echo = getEcho(); // Import getEcho if needed
        console.log('Echo instance status:', echo ? 'available' : 'not available');

        // if (echo) {
        //   // These should work without accessing socket directly
        //   echo.connector.on('disconnected', () => {
        //     showToast.error('Connection lost. Reconnecting...');
        //   });
          
        //   echo.connector.on('connected', () => {
        //     showToast.success('Reconnected!');
        //   });
          
        //   // Clean up event listeners on unmount
        //   return () => {
        //     if (echo && echo.connector) {
        //       echo.connector.off('disconnected');
        //       echo.connector.off('connected');
        //     }
        //   };
        // } else {
        //   console.warn('Echo is not available');
        // }
        
        unsubscribe = chatService.subscribeToChat(sessionUuid, (newMessage: ChatMessage) => {
        console.log('Real-time message received:', newMessage);
        setMessages(prev => {
          // Don't add if this message ID already exists
          if (prev.some(msg => msg.id === newMessage.id)) {
            console.log('Duplicate message detected, ignoring:', newMessage.id);
            return prev;
          }

          // Check if this is our own recently sent message coming back from the server
          // BUT only check text messages without attachments!
          if (newMessage.sender_id === user?.id && 
                !newMessage.attachment && 
                newMessage.message && // Add this check for null message
                recentlySentRef.current.has(newMessage.message)) {
              console.log('Own text message detected coming back from server, ignoring');
              return prev;
            }


          // For attachments, check more carefully - only filter if everything matches
          if (newMessage.attachment && 
            prev.some(msg => 
              msg.text === newMessage.message && 
              msg.sender === (newMessage.sender_id === user?.id ? 'user' : 
                             (newMessage.type === 'stage' ? 'system' : 'bot')) &&
              msg.isOptimistic === true // Only filter out optimistic updates
            )) {
            console.log('Replacing optimistic attachment message with server version');
            // Replace the optimistic update with the real message
            return prev.map(msg => 
              (msg.text === newMessage.message && 
              msg.sender === (newMessage.sender_id === user?.id ? 'user' : 
                              (newMessage.type === 'stage' ? 'system' : 'bot')) &&
              msg.isOptimistic === true)
                ? {
                    id: newMessage.id,
                    text: newMessage.message,
                    sender: newMessage.sender_id === user?.id ? 'user' : (newMessage.type === 'stage' ? 'system' : 'bot'),
                    type: newMessage.type,
                    attachment: newMessage.attachment,
                    timestamp: newMessage.created_at
                  }
                : msg
            );
          }
          
          return [
            ...prev,
            {
              id: newMessage.id,
              text: newMessage.message,
              sender: newMessage.sender_id === user?.id ? 'user' : (newMessage.type === 'stage' ? 'system' : 'bot'),
              type: newMessage.type,
              attachment: newMessage.attachment,
              timestamp: newMessage.created_at
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
  }, [sessionUuid, user, token]);

  const handleSendMessage = useCallback( async () => {
    if ((!newMessage.trim() && !attachment) || !sessionUuid) return;

    let messageText = newMessage.trim();
    let messageType = 'text';

    // Determine message type based on attachment
    if (attachment) {
      // Determine the type based on file MIME type
      if (attachment.type.startsWith('image/')) {
        messageType = 'image';
      } else if (attachment.type.startsWith('video/')) {
        messageType = 'video';
      } else {
        messageType = 'file';
      }
      
      // If only attachment is provided (no text), don't track text
      if (messageText) {
        recentlySentRef.current.add(messageText);
        setTimeout(() => {
          recentlySentRef.current.delete(messageText);
        }, 5000);
      }
    } else {
      // Only track text messages without attachments
      recentlySentRef.current.add(messageText);
      setTimeout(() => {
        recentlySentRef.current.delete(messageText);
      }, 5000);
    }
    
    // Optimistic UI update
    const tempId = Date.now();
    // Create a local URL for the attachment preview
    let localAttachmentUrl = null;
    if (attachment) {
      localAttachmentUrl = URL.createObjectURL(attachment);
    }

    setMessages(prev => [
      ...prev,
      { 
        id: tempId, 
        text: messageText, 
        type: messageType, 
        attachment: localAttachmentUrl, 
        sender: 'user', 
        timestamp: new Date().toISOString(), 
        isOptimistic: true 
      }
    ]);
    
    setNewMessage('');
    setSending(true);

    // Show loading toast when uploading attachment
    let uploadId;
    if (attachment) {
      uploadId = showToast.loading(`Uploading ${attachment.type.startsWith('image/') ? 'image' : 'video'}...`);
    }
    
    try {
      await chatService.sendMessage(sessionUuid, messageText, attachment, messageType);
      // Real message will come through the Pusher channel, but we'll ignore it thanks to our tracking
      // Dismiss loading toast if it exists
      if (uploadId) {
        showToast.dismiss(uploadId);
        showToast.success('File uploaded successfully');
      }
      setAttachment(null); // Clear attachment after sending
    } catch (err) {
      console.error('Error sending message:', err);
      // Get the error message from the error object
      const errorMessage = err.message || 'Failed to send message';

      // Dismiss loading toast if it exists
      if (uploadId) {
        showToast.dismiss(uploadId);
      }

      // Show error toast
      showToast.error(errorMessage);

      // Remove the optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    } finally {
      setSending(false);
    }
  },[newMessage, attachment, sessionUuid, recentlySentRef, user]);

  const handleUpdateTitle = async () => {
    if (!editedTitle.trim() || editedTitle === chatSession?.name) {
      setIsEditingTitle(false);
      return;
    }
  
    try {
      await chatService.updateChatSessionName(sessionUuid, editedTitle);
      setChatSession(prev => ({ ...prev, name: editedTitle }));
      setIsEditingTitle(false);
      showToast.success('Chat session renamed');
    } catch (err) {
      console.error('Error updating session name:', err);
      showToast.error('Failed to update session name');
      setError('Failed to update session name');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
    
      // Only allow images and videos
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        setAttachment(file);
        showToast.info(`File attached: ${file.name}`);
      } else {
        showToast.error('Only image and video files are allowed');
        setError('Only image and video files are allowed');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const getAttachmentUrl = useCallback((path) => {
    if (!path) return null;
    return `${process.env.NEXT_PUBLIC_API_HOST_URL}/public-files/${path}`;
  },[]);


  useEffect(() => {
    // Preload next few images that aren't in the viewport yet
    const preloadNextImages = () => {
      const visibleMessageIds = new Set();
      document.querySelectorAll('.chat-message-content img').forEach(img => {
        const messageEl = img.closest('[data-message-id]');
        if (messageEl) {
          visibleMessageIds.add(messageEl.getAttribute('data-message-id'));
        }
      });
      
      // Find messages with images that aren't loaded yet
      const messagesToPreload = messages
        .filter(msg => msg.type === 'image' && !visibleMessageIds.has(msg.id.toString()))
        .slice(0, 5); // Preload next 5 images
      
      // Create image objects to trigger browser preloading
      messagesToPreload.forEach(msg => {
        const img = new Image();
        img.src = getAttachmentUrl(msg.attachment);
      });
    };
    
    preloadNextImages();
  }, [messages]);

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
            <CardTitle className="flex items-center gap-2">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input 
                    className="h-8 py-1 bg-gray-700 text-white"
                    autoFocus
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUpdateTitle()}
                  />
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleUpdateTitle}
                    className="h-8 w-8 p-0"
                  >
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setIsEditingTitle(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="flex items-center cursor-pointer hover:text-blue-400" 
                  onClick={() => {
                    setEditedTitle(chatSession?.name || `Chat Session #${sessionUuid?.substring(0,8) || 'New'}`);
                    setIsEditingTitle(true);
                  }}
                >
                  {chatSession?.name || `Chat Session #${sessionUuid ? sessionUuid.substring(0,8) : 'New'}`}
                  <Edit2 size={14} className="ml-2 opacity-50" />
                </div>
              )}
            </CardTitle>
              {loading && <Loader2 className="animate-spin text-gray-400" size={20} />}
            </CardHeader>
            
            {error && (
              <div className="mx-6 mt-2 p-2 bg-red-900/20 border border-red-500 rounded-md text-red-500 text-sm whitespace-pre-line">
                {error}
              </div>
            )}
            
            <CardContent className="flex-1 overflow-hidden py-4 relative">
              <ScrollArea className="h-full w-full absolute inset-0 pr-4">
                {loading && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No messages yet. Start a conversation!
                  </div>
                ) : (
                  <div className="space-y-4 pt-4">
                    {messages.map((message) => (
                      <ChatMessage 
                      key={message.id}
                      message={message}
                      getAttachmentUrl={getAttachmentUrl}
                    />
                      // <div key={message.id}
                      //   data-message-id={message.id}
                      //   className={`flex ${
                      //     message.sender === 'user' 
                      //       ? 'justify-end' 
                      //       : message.sender === 'system'
                      //         ? 'justify-center'  // Center system messages
                      //         : 'justify-start'
                      //   }`}
                      // >
                      //   <div
                      //     className={`rounded-xl px-4 py-3 ${
                      //       message.sender === 'system' 
                      //         ? 'max-w-[95%] w-4/5' 
                      //         : 'max-w-[80%]'
                      //     } border shadow-md ${
                      //       message.sender === 'user'
                      //         ? 'bg-secondary-black text-off-white border-gray-600' 
                      //         : message.sender === 'system'
                      //           ? 'bg-gray-900 text-gray-300 border-gray-800 text-sm'
                      //           : 'bg-gradient-to-br from-gray-900 to-black text-gray-300 border-gray-600'
                      //     }`}
                      //   >
                      //     {message.sender === 'system' && <div className="text-xs text-gray-500 mb-1 font-medium">System</div>}
                          
                      //     <MessageContent message={message} />
                          
                      //     {message.timestamp && (
                      //       <div className="text-xs text-gray-500 mt-1 text-right">
                      //         {new Date(message.timestamp).toLocaleString('en-GB', { 
                      //           day: 'numeric',
                      //           month: 'numeric', 
                      //           year: 'numeric',
                      //           hour: '2-digit', 
                      //           minute: '2-digit'
                      //         })}
                      //       </div>
                      //     )}
                      //   </div>
                      // </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            
            <CardFooter className="border-t border-gray-700 p-4">
              <div className="flex w-full space-x-2 items-center">
                <Button variant="ghost" size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-10 w-10 rounded-full"
                  title="Attach image or video"
                >
                  <Paperclip className="h-5 w-5 text-gray-400" />
                </Button>
                <input type="file" ref={fileInputRef} className="hidden"
                  onChange={handleFileSelect} accept="image/*,video/*"
                />
                {/* Show selected file name if present */}
                {attachment && (
                  <div className="bg-gray-700 text-xs text-gray-300 px-2 py-1 rounded flex items-center">
                    {attachment.name.length > 20 ? `${attachment.name.substring(0, 20)}...` : attachment.name}
                    <X size={14} className="ml-1 cursor-pointer" onClick={() => setAttachment(null)} />
                  </div>
                )}

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
                  disabled={loading || sending || (!newMessage.trim() && !attachment)}
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