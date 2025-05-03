'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Resumable from 'resumablejs';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { RouteGuard } from '../../../components/auth/RouteGuard';
import { chatService, type ChatMessage as ApiChatMessage } from '../../../services/chatService';
import { getEcho } from '../../../services/echo';
import { useAuth } from '../../../contexts/AuthContext';
import type { AuthContextType } from '../../../types/auth';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, ArrowLeft, Loader2, Check, X, Edit2, Paperclip, File as FileIcon } from 'lucide-react';
import ReactPlayer from 'react-player';
import NextImage from 'next/image';
import { Progress } from "@/components/ui/progress"; // Import should work now

import { showToast } from '../../../utils/toast';

// Define Prop types
interface ChatMessageProps {
  message: Message;
  getAttachmentUrl: (path: string | null) => string | null;
  onRetryUpload: (fileIdentifier: string) => void;
}

interface MessageContentProps {
  message: Message;
  getAttachmentUrl: (path: string | null) => string | null;
}

type Message = {
  id: number | string; // Allow string for temporary IDs
  text: string;
  sender: 'bot' | 'user' | 'system';
  type?: string;
  timestamp?: string;
  attachment?: string | null;
  attachment_url?: string | null;
  thumbnail_url?: string | null;
  isOptimistic?: boolean;
  uploadProgress?: number; // Add upload progress state
  uploadError?: string | null; // Add upload error state
  resumableFileIdentifier?: string; // To link message to Resumable file
};

// Create a memoized message component to prevent re-renders
const ChatMessage = memo(({ message, getAttachmentUrl, onRetryUpload }: ChatMessageProps) => {
  const isUploading = message.isOptimistic && message.uploadProgress !== undefined && message.uploadProgress < 100 && !message.uploadError;
  const hasUploadError = message.isOptimistic && !!message.uploadError;

  return (
    <div
      data-message-id={message.id}
      data-resumable-id={message.resumableFileIdentifier} // Add resumable identifier
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

        {/* Progress Bar and Status */}
        {isUploading && (
          <div className="mt-2">
            <Progress value={message.uploadProgress} className="w-full h-1 bg-gray-600" />
            <span className="text-xs text-gray-400">Uploading... {message.uploadProgress}%</span>
          </div>
        )}
        {hasUploadError && (
           <div className="mt-2 text-xs text-red-400 flex items-center gap-2">
             <span>Error: {message.uploadError}</span>
             {/* Add check for resumableFileIdentifier */}
             {onRetryUpload && message.resumableFileIdentifier && (
               <Button variant="link" size="sm" className="p-0 h-auto text-blue-400" onClick={() => message.resumableFileIdentifier && onRetryUpload(message.resumableFileIdentifier)}>
                 Retry
               </Button>
             )}
           </div>
        )}

        {message.timestamp && !isUploading && !hasUploadError && ( // Hide timestamp during upload/error
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
const MessageContent = memo(({ message }: MessageContentProps) => {
  switch (message.type) {
    case 'image':
      return (
        <div className="flex flex-col gap-2 chat-message-content">
          {message.text && <p>{message.text}</p>}
          <div className="relative w-full max-w-[300px]">
            <a
              href={message.attachment_url || message.attachment || '#'}
              target="_blank"
              rel="noopener noreferrer"
              title="View full image"
            >
              {(message.thumbnail_url && message.thumbnail_url.startsWith('http')) ||
              (message.attachment_url && message.attachment_url.startsWith('http')) ||
              (message.attachment && message.attachment.startsWith('blob:')) ? (
                <NextImage
                  src={
                    message.thumbnail_url && message.thumbnail_url.startsWith('http')
                      ? message.thumbnail_url
                      : message.attachment_url && message.attachment_url.startsWith('http')
                        ? message.attachment_url
                        : message.attachment // blob url
                  }
                  alt={message.text || "Image attachment"}
                  width={300}
                  height={300}
                  className="rounded-md object-contain cursor-pointer"
                  style={{ maxHeight: '300px', width: 'auto', height: 'auto', objectFit: 'contain' }}
                  loading="lazy"
                />
              ) : null}
            </a>
            {message.attachment_url && (
              <a
                target="_blank"
                href={message.attachment_url}
                download
                className="absolute bottom-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                title="Download image"
              >
                <FileIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      );
    case 'video':
      return (
        <div className="flex flex-col gap-2 chat-message-content">
          {message.text && <p>{message.text}</p>}
          <div className="relative w-full max-w-[300px]">
            <ReactPlayer
              url={message.attachment_url || message.attachment} // fallback to blob URL
              controls
              width="100%"
              height="200px"
              light={message.thumbnail_url}
              playing={false}
              config={{
                file: {
                  attributes: {
                    poster: message.thumbnail_url,
                  },
                  forceHLS: true,
                }
              }}
            />
          </div>
        </div>
      );

    case 'file':
      if (!message.attachment_url) return <p>{message.text || 'File unavailable'}</p>; // Handle null/undefined href

      return (
        <div className="flex flex-col gap-2">
          <p>{message.text}</p>
          <a
            href={message.attachment_url} // Use checked URL
            // ... rest of props
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumableRef = useRef<Resumable | null>(null); // Ref for Resumable instance
  const [isUploading, setIsUploading] = useState(false); // Track upload state

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
        // Removed unused echo variable
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
        const formattedHistory = chatMessages.map((msg: ApiChatMessage) => ({
          id: msg.id,
          text: msg.message ?? '', // fallback if null
          sender: msg.sender_id === user?.id ? 'user' : (msg.type === 'stage' ? 'system' : 'bot'),
          type: msg.type,
          attachment: msg.attachment,
          attachment_url: msg.attachment_url,
          thumbnail_url: msg.thumbnail_url,
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
        
        unsubscribe = chatService.subscribeToChat(sessionUuid, (newMessage: ApiChatMessage) => {
        console.log('Real-time message received:', newMessage);

        setMessages(prev => {
          // Find if this message already exists (optimistic or not)
          const existingIndex = prev.findIndex(msg => msg.id === newMessage.id);

          if (existingIndex > -1) {
            // If the new message has a better attachment_url/thumbnail_url, update the message
            const existing = prev[existingIndex];
            if (
              (newMessage.attachment_url && newMessage.attachment_url !== existing.attachment_url) ||
              (newMessage.thumbnail_url && newMessage.thumbnail_url !== existing.thumbnail_url)
            ) {
              const updatedMessages = [...prev];
              updatedMessages[existingIndex] = {
                ...existing,
                ...newMessage,
                // --- force sender to 'user' if sender_id matches current user ---
                sender: newMessage.sender_id === user?.id ? 'user' : (newMessage.type === 'stage' ? 'system' : 'bot'),
                isOptimistic: false,
                uploadProgress: undefined,
                uploadError: undefined,
                resumableFileIdentifier: undefined,
              };
              return updatedMessages;
            }
            // Otherwise, skip (no new info)
            return prev;
          }

          // If not found, add as new message
          return [
            ...prev,
            {
              id: newMessage.id,
              text: newMessage.message,
              // --- force sender to 'user' if sender_id matches current user ---
              sender: newMessage.sender_id === user?.id ? 'user' : (newMessage.type === 'stage' ? 'system' : 'bot'),
              type: newMessage.type,
              attachment: newMessage.attachment,
              attachment_url: newMessage.attachment_url,
              thumbnail_url: newMessage.thumbnail_url,
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

  // --- Initialize Resumable ---
  useEffect(() => {
    if (!sessionUuid || !token || typeof window === 'undefined') return;

    // Define maxFileSize constant
    const MAX_FILE_SIZE_BYTES = 1024 * 1024 * 1024; // 1GB

    const r = new Resumable({
      target: `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/${sessionUuid}/upload-chunk`,
      headers: {
        'Authorization': `Bearer ${token}`
      },
      chunkSize: 5 * 1024 * 1024,
      simultaneousUploads: 1,
      testChunks: false,
      throttleProgressCallbacks: 1,
      maxFiles: 1,
      // Use the constant here, @ts-expect-error still needed if type is boolean
      // @ts-expect-error - Type definition for maxFileSize seems incorrect (expects boolean?)
      maxFileSize: MAX_FILE_SIZE_BYTES,
      fileType: ['mp4','mov','avi','mkv','webm','jpg','jpeg','png','gif'],
      generateUniqueIdentifier: () => `chat-${sessionUuid}-${Date.now()}`
    });

    if (fileInputRef.current) {
      // Pass false for the second argument (isDirectory)
      r.assignBrowse(fileInputRef.current, false);
    }

    // --- Resumable Event Handlers ---
    r.on('fileAdded', (file: Resumable.ResumableFile) => {
      console.log('Resumable file added:', file);

      // Remove the problematic check for `attachment` state
      // if (!attachment) { ... }

      // Basic validation (redundant but safe)
      if (!file.file.type.startsWith('image/') && !file.file.type.startsWith('video/')) {
        showToast.error('Invalid file type selected.');
        r.removeFile(file); // Remove invalid file
        return;
      }
      // @ts-expect-error - Type definition for maxFileSize seems incorrect
      if (typeof r.opts.maxFileSize === 'number' && file.size > r.opts.maxFileSize) {
        // @ts-expect-error - Type definition for maxFileSize seems incorrect
        showToast.error(`File is too large (max ${r.opts.maxFileSize / 1024 / 1024} MB)`);
        r.removeFile(file); // Remove invalid file
        return;
      }

      setIsUploading(true);
      setSending(true); // Use sending state to disable input/button

      const messageText = newMessage.trim();
      const messageType = file.file.type.startsWith('image/') ? 'image' : 'video';
      // Use file.file (the actual File object) to create the blob URL
      const localAttachmentUrl = URL.createObjectURL(file.file);
      const tempId = `optimistic-${file.uniqueIdentifier}`;

      // Optimistic UI update
      setMessages(prev => [
        ...prev,
        {
          id: tempId,
          text: messageText,
          sender: 'user',
          type: messageType,
          attachment: localAttachmentUrl, // Use blob URL for preview
          timestamp: new Date().toISOString(),
          isOptimistic: true,
          uploadProgress: 0,
          resumableFileIdentifier: file.uniqueIdentifier, // Link message to file
        }
      ]);

      setNewMessage(''); // Clear text input
      // setAttachment(null); // No longer needed
      if (fileInputRef.current) fileInputRef.current.value = ''; // Clear file input value

      // Add message text to Resumable query for the backend
      interface ResumableQuery {
        message?: string;
        type?: string;
        [key: string]: any;
      }
      r.opts.query = { ...r.opts.query, message: messageText, type: messageType } as ResumableQuery;

      r.upload(); // Start the upload
    });

    r.on('fileProgress', (file: Resumable.ResumableFile) => {
      // Pass false for relative progress
      const progress = Math.floor(file.progress(false) * 100);
      setMessages(prev => prev.map(msg =>
        msg.resumableFileIdentifier === file.uniqueIdentifier
          ? { ...msg, uploadProgress: progress }
          : msg
      ));
    });

    // ... (fileSuccess and fileError handlers remain largely the same)
    r.on('fileSuccess', (file: Resumable.ResumableFile, serverMessage: string) => {
      console.log('Resumable file success:', file, serverMessage);
      try {
        const response = JSON.parse(serverMessage);
        const finalMessageData = response.message_data as ApiChatMessage; // Use type assertion

        if (!finalMessageData) {
          throw new Error("Invalid response from server after upload.");
        }

        setMessages(prev => prev.map(msg => {
          if (msg.resumableFileIdentifier === file.uniqueIdentifier) {
            return {
              id: finalMessageData.id,
              text: finalMessageData.message,
              sender: finalMessageData.sender_id === user?.id ? 'user' : 'bot',
              type: finalMessageData.type,
              // --- keep blob as fallback if backend doesn't provide a valid url ---
              attachment: finalMessageData.attachment || msg.attachment,
              attachment_url: finalMessageData.attachment_url,
              thumbnail_url: finalMessageData.thumbnail_url,
              timestamp: finalMessageData.created_at,
              isOptimistic: false,
              uploadProgress: 100,
              resumableFileIdentifier: undefined,
            };
          }
          return msg;
        }));

      } catch (e) { // Use unknown type for catch clause variable
        console.error("Error processing server response on fileSuccess:", e);
        setMessages(prev => prev.map(msg =>
          msg.resumableFileIdentifier === file.uniqueIdentifier
            ? { ...msg, uploadError: 'Processing error after upload.', uploadProgress: undefined }
            : msg
        ));
      } finally {
        setIsUploading(false);
        setSending(false);
        r.removeFile(file);
      }
    });

    r.on('fileError', (file: Resumable.ResumableFile, message: string) => {
      console.error('Resumable file error:', file, message);
      const errorMsg = message || 'Upload failed';
      showToast.error(`Upload failed: ${file.fileName}`);

      setMessages(prev => prev.map(msg =>
        msg.resumableFileIdentifier === file.uniqueIdentifier
          ? { ...msg, uploadError: errorMsg, uploadProgress: undefined }
          : msg
      ));

      setIsUploading(false);
      setSending(false);
    });

    resumableRef.current = r;

    return () => {
      console.log("Cleaning up Resumable instance");
      if (resumableRef.current) {
        resumableRef.current.cancel();
      }
      resumableRef.current = null;
    };

  }, [sessionUuid, token, newMessage, user]); // Removed `attachment` from dependencies

  // --- Update handleSendMessage (Text Only) ---
  const handleSendMessage = useCallback( async () => {
    // ... (logic remains the same)
    if (!newMessage.trim() || !sessionUuid || isUploading) return;

    const messageText = newMessage.trim();
    const messageType = 'text';

    recentlySentRef.current.add(messageText);
    setTimeout(() => {
      recentlySentRef.current.delete(messageText);
    }, 5000);

    const tempId = `optimistic-${Date.now()}`;
    setMessages(prev => [
      ...prev,
      {
        id: tempId,
        text: messageText,
        sender: 'user',
        type: messageType,
        timestamp: new Date().toISOString(),
        isOptimistic: true
      }
    ]);

    setNewMessage('');
    setSending(true);

    try {
      await chatService.sendMessage(sessionUuid, messageText, null, messageType);
    } catch (err) { // Use unknown type for catch clause variable
      console.error('Error sending text message:', err);
      // Type guard or assertion might be needed to access err.message
      const errorMessage = (err instanceof Error ? err.message : String(err)) || 'Failed to send message';
      showToast.error(errorMessage);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    } finally {
      setSending(false);
    }
  },[newMessage, sessionUuid, isUploading]); // Removed unnecessary 'user' dependency

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

  // --- Update handleFileSelect ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... (logic remains the same)
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Basic validation (Resumable also validates, but good for immediate feedback)
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        showToast.error('Only image and video files are allowed');
        e.target.value = ''; // Clear input
        return;
      }

      const maxFileSize = resumableRef.current?.opts.maxFileSize;
      // @ts-expect-error - Type definition for maxFileSize seems incorrect
      if (typeof maxFileSize === 'number' && file.size > maxFileSize) {
        // @ts-expect-error - Type definition for maxFileSize seems incorrect
        showToast.error(`File is too large (max ${maxFileSize / 1024 / 1024} MB)`);
        e.target.value = ''; // Clear input
        return;
      }
      // Do NOT call setAttachment here
      // setAttachment(file);
    } else {
      // setAttachment(null); // No longer needed
    }
  };

  const getAttachmentUrl = useCallback((path: string | null) => {
    if (!path) return null;
    return `${process.env.NEXT_PUBLIC_API_HOST_URL}/public-files/${path}`;
  },[]);

  // --- Add Retry Handler ---
  const handleRetryUpload = useCallback((fileIdentifier: string) => {
    if (!resumableRef.current) return;

    // Type assertion might be needed if types are incorrect
    const fileToRetry = resumableRef.current.getFromUniqueIdentifier(fileIdentifier) as Resumable.ResumableFile | undefined;
    if (fileToRetry) {
      console.log("Retrying upload for:", fileIdentifier);
      setMessages(prev => prev.map(msg =>
        msg.resumableFileIdentifier === fileIdentifier
          ? { ...msg, uploadError: null, uploadProgress: 0 }
          : msg
      ));
      setIsUploading(true);
      setSending(true);
      fileToRetry.retry();
    } else {
      console.error("Could not find file to retry:", fileIdentifier);
      showToast.error("Could not retry upload.");
       setMessages(prev => prev.map(msg =>
        msg.resumableFileIdentifier === fileIdentifier
          ? { ...msg, uploadError: "Retry failed: File not found.", uploadProgress: undefined }
          : msg
      ));
    }
  }, []);

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
        // Use window.Image to avoid conflict with NextImage
        const img = new window.Image();
        const url = getAttachmentUrl(msg.attachment);
        if (url) { // Check if URL is not null before assigning
          img.src = url;
        }
      });
    };
    
    preloadNextImages();
  }, [messages, getAttachmentUrl]); // Added getAttachmentUrl dependency

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
                      onRetryUpload={handleRetryUpload} // Pass retry handler
                    />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            
            <CardFooter className="border-t border-gray-700 p-4">
              <div className="flex w-full space-x-2 items-center">
                <Button variant="ghost" size="icon"
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className="h-10 w-10 rounded-full"
                  title="Attach image or video"
                  disabled={isUploading}
                >
                  <Paperclip className="h-5 w-5 text-gray-400" />
                </Button>
                <input type="file" ref={fileInputRef} className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*,video/*"
                  disabled={isUploading}
                />
                {/* Show selected file name if present */}

                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isUploading ? "Uploading file..." : "Type your message..."}
                  className="flex-1 bg-secondary-black text-off-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={loading || sending || isUploading}
                />
                <Button 
                  className="bg-secondary-black hover:bg-primary-black text-off-white"
                  onClick={handleSendMessage}
                  disabled={loading || sending || isUploading || !newMessage.trim()}
                >
                  {/* Correctly place conditional rendering inside the button */}
                  {(sending || isUploading) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}