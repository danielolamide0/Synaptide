import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Message } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface ChatContextProps {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await apiRequest('GET', '/api/messages', undefined);
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chat history',
          variant: 'destructive',
        });
      }
    };

    fetchMessages();
  }, [toast]);

  const sendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      
      // Add user message to UI immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, userMessage]);

      // Send to server and get AI response
      const response = await apiRequest('POST', '/api/messages', { content });
      const aiMessage = await response.json();
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    apiRequest('DELETE', '/api/messages', undefined)
      .catch((error) => {
        console.error('Failed to clear messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to clear chat history',
          variant: 'destructive',
        });
      });
  };

  return (
    <ChatContext.Provider value={{ messages, isLoading, sendMessage, clearMessages }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextProps => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
