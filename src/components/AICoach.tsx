
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, ChevronUp, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useContext } from 'react';
import { HabitsContext } from '@/pages/Index';

interface AICoachProps {
  name?: string;
}

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

const AICoach: React.FC<AICoachProps> = ({ name = "Bettr" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { text: `Hi there! I'm ${name}, your personal habit coach. How can I help you today?`, sender: 'ai' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { habits } = useContext(HabitsContext);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      // Add user message
      const userMessage = { text: input.trim(), sender: 'user' as const };
      setMessages(prev => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        // Generate context about the user's habits
        const habitsContext = habits.length > 0 
          ? `User has ${habits.length} habits: ${habits.map(h => h.title).join(', ')}.
             Top performing habit: ${habits.sort((a, b) => b.streak - a.streak)[0]?.title || 'None'} 
             with a streak of ${habits.sort((a, b) => b.streak - a.streak)[0]?.streak || 0} days.`
          : "User hasn't created any habits yet.";

        // Format messages for the API (excluding the initial greeting)
        const apiMessages = messages.slice(1).concat(userMessage).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

        // Call our Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('ai-coach', {
          body: {
            messages: apiMessages,
            userContext: habitsContext
          }
        });

        if (error) {
          throw new Error(error.message || "Failed to get response from AI coach");
        }

        // Add AI response to messages
        setMessages(prev => [...prev, { text: data.response, sender: 'ai' }]);
      } catch (error) {
        console.error('Error getting AI response:', error);
        toast({
          title: "AI Coach Error",
          description: "Sorry, I couldn't process your message. Please try again later.",
          variant: "destructive"
        });
        
        // Add error message
        setMessages(prev => [...prev, { 
          text: "Sorry, I'm having trouble connecting right now. Please try again later.", 
          sender: 'ai' 
        }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="glass-panel mb-4 rounded-2xl w-[320px] sm:w-[350px] max-h-[500px] flex flex-col shadow-lg border border-white/30"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-bettr-blue to-bettr-purple flex items-center justify-center text-white font-bold">
                  B
                </div>
                <span className="font-medium">{name}</span>
              </div>
              <button onClick={toggleChat} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[350px]">
              {messages.map((message, index) => (
                <motion.div 
                  key={index}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div 
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      message.sender === 'user' 
                        ? 'bg-bettr-blue text-white rounded-tr-none' 
                        : 'bg-gray-100 text-bettr-text-primary rounded-tl-none'
                    }`}
                  >
                    {message.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div 
                  className="flex justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-tl-none flex items-center space-x-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat input */}
            <div className="p-3 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="flex-1 px-3 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-bettr-blue/30 transition-all"
                  disabled={isLoading}
                />
                <motion.button 
                  onClick={handleSend}
                  className="p-2 rounded-full bg-bettr-blue text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  whileTap={{ scale: 0.9 }}
                  disabled={!input.trim() || isLoading}
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Chat toggle button */}
      <motion.button
        className="w-14 h-14 rounded-full bg-gradient-to-r from-bettr-blue to-bettr-purple text-white flex items-center justify-center shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
      >
        {isOpen ? <ChevronUp size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
};

export default AICoach;
