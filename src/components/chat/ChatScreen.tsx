import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
}

interface ChatScreenProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const ChatScreen = ({ 
  messages, 
  onSendMessage, 
  isLoading = false, 
  error = null 
}: ChatScreenProps) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-primary-black flex flex-col">
      <div className="flex-1 flex flex-col p-4 max-w-4xl mx-auto w-full">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Conversation</CardTitle>
            {isLoading && <Loader2 className="animate-spin text-gray-400" size={20} />}
          </CardHeader>
          
          {error && (
            <div className="mx-6 p-2 bg-red-900/20 border border-red-500 rounded-md text-red-500 text-sm">
              {error}
            </div>
          )}
          
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              {isLoading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Initializing chat...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No messages yet. Start a conversation!
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={`${message.id}-${index}`}
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
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
              />
              <Button 
                className="bg-secondary-black hover:bg-primary-black text-off-white"
                onClick={handleSend}
                disabled={isLoading || !newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};