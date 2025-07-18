import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import TypingIndicator from '@/components/TypingIndicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChat } from '@/contexts/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';

const Chat: React.FC = () => {
  const [, navigate] = useLocation();
  const { messages, isLoading, user, sendMessage, clearMessages, logout } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    await sendMessage(inputValue);
    setInputValue('');
  };

  // Add custom CSS classes for chat bubbles
  const chatBubbleStyles = `
    .chat-bubble::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: -10px;
      width: 20px;
      height: 20px;
      background-color: inherit;
      clip-path: polygon(0 0, 100% 100%, 100% 0);
      transform: rotate(135deg);
      bottom: 10px;
    }
    
    .bot-bubble::before {
      left: auto;
      right: -10px;
      clip-path: polygon(0 0, 0 100%, 100% 0);
      transform: rotate(45deg);
    }
  `;

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <style>{chatBubbleStyles}</style>
      
      {/* Header */}
      <header className="flex items-center p-4 bg-black border-b border-zinc-800">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/')}
          className="mr-4 text-gray-400 hover:text-white transition-colors"
        >
          <i className="fas fa-arrow-left"></i>
        </Button>
        
        <div className="flex items-center space-x-3">
          <Logo size="sm" grayscale={true} />
          <div>
            <h2 className="font-semibold text-white">Synaptide</h2>
            <div className="flex items-center text-xs text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              <span>Online</span>
            </div>
          </div>
        </div>
        
        <div className="ml-auto flex items-center space-x-3">
          {/* User menu button */}
          <div className="relative">
            <Button 
              variant="ghost" 
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setShowMenu(!showMenu)}
            >
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                <i className="fas fa-user"></i>
              </div>
              <span className="hidden md:inline">{user?.name || 'User'}</span>
              <i className={`fas fa-chevron-${showMenu ? 'up' : 'down'} text-xs`}></i>
            </Button>
            
            {/* Dropdown menu */}
            {showMenu && (
              <div 
                ref={menuRef}
                className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg z-50"
              >
                <div className="p-3 border-b border-zinc-800">
                  <p className="text-white font-semibold">{user?.name || 'User'}</p>
                </div>
                <div className="p-2">
                  <button 
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-800 rounded-md flex items-center"
                    onClick={clearMessages}
                  >
                    <i className="fas fa-trash mr-2"></i> Clear chat history
                  </button>
                  <button 
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-800 rounded-md flex items-center"
                    onClick={logout}
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i> Log out
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <ThemeToggle />
        </div>
      </header>

      {/* Messages */}
      <main 
        className="flex-1 overflow-y-auto p-4 space-y-6" 
        ref={messageContainerRef}
      >
        {/* Welcome message if no messages */}
        {messages.length === 0 && (
          <>
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 mr-4">
                <Logo size="sm" grayscale={true} />
              </div>
              <motion.div 
                className="bg-zinc-900 rounded-lg p-4 max-w-[80%] relative shadow-md chat-bubble bot-bubble border border-zinc-800"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-white">
                  Hello! I'm <span className="text-white font-medium">Synaptide</span>, your AI assistant with perfect memory. How can I help you today?
                </p>
              </motion.div>
            </div>

            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 mr-4">
                <Logo size="sm" grayscale={true} />
              </div>
              <motion.div 
                className="bg-zinc-900 rounded-lg p-4 max-w-[80%] relative shadow-md chat-bubble bot-bubble border border-zinc-800"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <p className="text-white">
                  I can remember our entire conversation history and learn about your preferences over time to provide more personalized responses. Feel free to ask me anything!
                </p>
              </motion.div>
            </div>
          </>
        )}

        {/* Conversation messages */}
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div 
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start mb-4 ${message.role === 'user' ? 'justify-end' : ''}`}
            >
              {message.role !== 'user' && (
                <div className="flex-shrink-0 mr-4">
                  <Logo size="sm" grayscale={true} />
                </div>
              )}
              
              <div 
                className={`${
                  message.role === 'user' 
                    ? 'bg-white text-black' 
                    : 'bg-zinc-900 text-white border border-zinc-800'
                } rounded-lg p-4 max-w-[80%] relative shadow-md chat-bubble ${
                  message.role !== 'user' ? 'bot-bubble' : ''
                }`}
              >
                <p>
                  {message.content}
                </p>
              </div>
              
              {message.role === 'user' && (
                <div className="flex-shrink-0 ml-4">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
                    <span className="text-xs font-medium">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isLoading && <TypingIndicator />}
        
        {/* Empty div for auto-scrolling */}
        <div ref={messagesEndRef} />
      </main>

      {/* Input form */}
      <div className="p-4 bg-black border-t border-zinc-800">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <i className="fas fa-paperclip"></i>
          </Button>
          
          <div className="relative flex-1">
            <Input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..." 
              className="w-full py-3 px-4 bg-zinc-900 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 border-zinc-700"
              disabled={isLoading}
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading || !inputValue.trim()}
            className="p-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
          >
            <i className="fas fa-paper-plane"></i>
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;