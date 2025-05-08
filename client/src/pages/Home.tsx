import React, { useState } from 'react';
import { useLocation } from 'wouter';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const Home: React.FC = () => {
  const [, navigate] = useLocation();
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();
  
  const handleStartChat = async () => {
    if (!userName.trim()) {
      setErrorMessage('Please enter your name');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Create or get the user
      const response = await apiRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify({ name: userName }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.statusText}`);
      }
      
      const user = await response.json();
      
      // Store user information in localStorage for persistence
      localStorage.setItem('synaptideUser', JSON.stringify(user));
      
      // Navigate to chat page
      navigate('/chat');
    } catch (error) {
      console.error('Error creating user:', error);
      setErrorMessage('Failed to start chat. Please try again.');
      toast({
        title: 'Error',
        description: 'There was a problem starting the chat. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6 bg-black border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <Logo size="sm" />
          <h1 className="text-xl md:text-2xl font-semibold text-white">
            Synaptide
          </h1>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Logo */}
          <motion.div 
            className="mb-6 relative mx-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Logo size="lg" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse-slow"></div>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Synaptide
          </motion.h1>
          
          {/* Description */}
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            A chatbot with perfect memory that learns about you to create a personalized experience.
          </motion.p>
          
          {/* Features */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              <div className="bg-zinc-900 p-6 rounded-xl shadow-lg max-w-xs border border-zinc-800">
                <div className="text-white text-3xl mb-4">
                  <i className="fas fa-brain"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Perfect Memory</h3>
                <p className="text-gray-400">Remembers your entire conversation history to provide context-aware responses.</p>
              </div>
              
              <div className="bg-zinc-900 p-6 rounded-xl shadow-lg max-w-xs border border-zinc-800">
                <div className="text-white text-3xl mb-4">
                  <i className="fas fa-fingerprint"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Personalized</h3>
                <p className="text-gray-400">Learns your preferences and adapts to your communication style over time.</p>
              </div>
              
              <div className="bg-zinc-900 p-6 rounded-xl shadow-lg max-w-xs border border-zinc-800">
                <div className="text-white text-3xl mb-4">
                  <i className="fas fa-bolt"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Powerful AI</h3>
                <p className="text-gray-400">Leverages OpenAI technology to deliver intelligent and nuanced conversations.</p>
              </div>
            </div>
            
            {/* Name Input and Start Chat Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="relative bg-zinc-900 rounded-full p-2 border border-zinc-800 w-full max-w-md mx-auto">
                <input
                  type="text"
                  id="userName"
                  placeholder="Enter your name"
                  className="w-full bg-transparent text-white px-6 py-3 rounded-full outline-none focus:ring-2 focus:ring-white/50"
                  onChange={(e) => setUserName(e.target.value)}
                  value={userName}
                  onKeyDown={(e) => e.key === 'Enter' && handleStartChat()}
                />
              </div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={handleStartChat}
                  disabled={!userName.trim()}
                  className="bg-white hover:bg-gray-200 text-black font-semibold py-4 px-10 rounded-full text-xl shadow-lg transform transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50 h-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Chat
                </Button>
              </motion.div>
              
              {errorMessage && (
                <p className="text-red-500 mt-2">{errorMessage}</p>
              )}
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 bg-black border-t border-zinc-800 text-gray-400 text-center text-sm">
        <p>© {new Date().getFullYear()} Synaptide. Powered by OpenAI.</p>
      </footer>
    </div>
  );
};

export default Home;
