// src/components/chat/ChatScreen.tsx
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

interface ChatScreenProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = React.useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-primary-black flex flex-col">
      <div className="bg-secondary-black p-4 shadow-md">
        <h1 className="text-xl font-bold">Chat Dashboard</h1>
      </div>
      
      <div className="flex-1 flex flex-col p-4 max-w-4xl mx-auto w-full">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1">
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`rounded-xl px-4 py-3 max-w-[80%] border border-gray-800 shadow-lg ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-br from-blue-900 to-indigo-900 text-white'
                          : 'bg-gradient-to-br from-gray-900 to-black text-gray-300'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          
          <CardFooter>
            <div className="flex w-full space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button 
                className="bg-secondary-black hover:bg-primary-black text-off-white"
                onClick={handleSend}
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
