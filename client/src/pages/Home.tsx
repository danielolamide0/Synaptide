import React from 'react';
import { useLocation } from 'wouter';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6 bg-dark-surface border-b border-dark-border">
        <div className="flex items-center space-x-2">
          <Logo size="sm" />
          <h1 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent bg-gradient-animate"
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
              <div className="bg-dark-card p-6 rounded-xl shadow-lg max-w-xs">
                <div className="text-primary text-3xl mb-4">
                  <i className="fas fa-brain"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">Perfect Memory</h3>
                <p className="text-gray-400">Remembers your entire conversation history to provide context-aware responses.</p>
              </div>
              
              <div className="bg-dark-card p-6 rounded-xl shadow-lg max-w-xs">
                <div className="text-secondary text-3xl mb-4">
                  <i className="fas fa-fingerprint"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">Personalized</h3>
                <p className="text-gray-400">Learns your preferences and adapts to your communication style over time.</p>
              </div>
              
              <div className="bg-dark-card p-6 rounded-xl shadow-lg max-w-xs">
                <div className="text-accent text-3xl mb-4">
                  <i className="fas fa-bolt"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">Powerful AI</h3>
                <p className="text-gray-400">Leverages OpenAI technology to deliver intelligent and nuanced conversations.</p>
              </div>
            </div>
            
            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => navigate('/chat')}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-white font-semibold py-4 px-10 rounded-full text-xl shadow-lg transform transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50 animate-bounce-slow h-auto"
              >
                Click to Chat
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 bg-dark-surface border-t border-dark-border text-gray-400 text-center text-sm">
        <p>© {new Date().getFullYear()} Synaptide. Powered by OpenAI.</p>
      </footer>
    </div>
  );
};

export default Home;
