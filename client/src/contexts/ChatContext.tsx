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
  loadOrCreateUser: (name: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Function to load or create a user by name
  const loadOrCreateUser = async (name: string) => {
    try {
      setIsLoading(true);
      // Check if user exists 
      const getUserResponse = await apiRequest({
        url: `/api/users?name=${encodeURIComponent(name)}`
      });
      
      if (getUserResponse.ok) {
        // User exists, load their data
        const userData = await getUserResponse.json();
        setUser(userData);
        localStorage.setItem('synaptideUser', JSON.stringify(userData));
        return;
      }
      
      // User doesn't exist, create a new user
      const createUserResponse = await apiRequest({
        url: '/api/users',
        method: 'POST',
        body: { name }
      });
      
      if (!createUserResponse.ok) {
        throw new Error(`Failed to create user: ${createUserResponse.statusText}`);
      }
      
      const newUser = await createUserResponse.json();
      setUser(newUser);
      localStorage.setItem('synaptideUser', JSON.stringify(newUser));
    } catch (error) {
      console.error('Error loading or creating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to load or create user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load user from localStorage
  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem('synaptideUser');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          console.log('User loaded from localStorage:', parsedUser);
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
      
      // Update the message list with both user message and AI response
      setMessages((prev) => {
        // First filter out the temp message
        const filtered = prev.filter(m => m.id !== tempUserMessage.id);
        
        // Get the real user message from the server (if available)
        // Or create a permanent version of the temporary message
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          userId: user.id,
          role: 'user',
          content,
          timestamp: new Date(),
        };
        
        // Add both the user message and AI response
        return [...filtered, userMessage, aiMessage];
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the temporary message on error
      setMessages((prev) => prev.filter(m => m.id !== tempUserMessage.id));
      
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
      logout,
      loadOrCreateUser
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
