import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Message, User } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface ChatContextProps {
  messages: Message[];
  isLoading: boolean;
  user: User | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  logout: () => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Load user from localStorage
  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem('synaptideUser');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Failed to parse user data:', error);
          localStorage.removeItem('synaptideUser');
          navigate('/');
        }
      } else {
        // If no user is found, redirect to home page
        navigate('/');
      }
    };

    loadUser();
  }, [navigate]);

  // Fetch messages for the current user
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const response = await apiRequest({
          url: `/api/users/${user.id}/messages`
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.statusText}`);
        }
        
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chat history. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchMessages();
    }
  }, [user, toast]);

  const sendMessage = async (content: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You need to be logged in to send messages',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Add user message to UI immediately for fast feedback
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        userId: user.id,
        role: 'user',
        content,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, tempUserMessage]);

      // Send to server and get AI response
      const response = await apiRequest({
        url: `/api/users/${user.id}/messages`,
        method: 'POST',
        body: { content }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }
      
      const aiMessage = await response.json();
      
      // Replace temp user message with real one and add AI response
      setMessages((prev) => {
        // Filter out the temp message
        const filtered = prev.filter(m => m.id !== tempUserMessage.id);
        // Add the real messages from server
        return [...filtered, aiMessage];
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the temporary message on error
      setMessages((prev) => prev.filter(m => m.id !== `temp-${Date.now()}`));
      
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = useCallback(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    setMessages([]);
    apiRequest({
      url: `/api/users/${user.id}/messages`,
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to clear messages: ${response.statusText}`);
        }
        
        toast({
          title: 'Success',
          description: 'Chat history cleared',
        });
      })
      .catch((error) => {
        console.error('Failed to clear messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to clear chat history',
          variant: 'destructive',
        });
      });
  }, [user, navigate, toast]);

  const logout = useCallback(() => {
    localStorage.removeItem('synaptideUser');
    setUser(null);
    setMessages([]);
    navigate('/');
  }, [navigate]);

  return (
    <ChatContext.Provider value={{ 
      messages, 
      isLoading, 
      user, 
      sendMessage, 
      clearMessages,
      logout 
    }}>
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
