import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, ChevronUp, Send, Loader2, Sparkles } from 'lucide-react';
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

const AICoach: React.FC<AICoachProps> = ({ name = "Bettr Coach" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { text: `Hi there! I'm ${name}, your personal habit and self-improvement coach. How can I help you today?`, sender: 'ai' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { habits } = useContext(HabitsContext);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();
        
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      const userMessage = { text: input.trim(), sender: 'user' as const };
      setMessages(prev => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const habitsContext = habits.length > 0 
          ? `User has ${habits.length} habits: ${habits.map(h => h.title).join(', ')}.
             Top performing habit: ${habits.sort((a, b) => b.streak - a.streak)[0]?.title || 'None'} 
             with a streak of ${habits.sort((a, b) => b.streak - a.streak)[0]?.streak || 0} days.
             Habit categories: ${[...new Set(habits.map(h => h.category))].join(', ')}.
             Total weekly completions: ${habits.reduce((sum, h) => sum + h.completionsThisWeek, 0)}.
             Weekly goals: ${habits.reduce((sum, h) => sum + h.goalperweek, 0)}.
             Completion rate: ${habits.reduce((sum, h) => sum + h.completionsThisWeek, 0) / 
             Math.max(1, habits.reduce((sum, h) => sum + h.goalperweek, 0)) * 100}%.`
          : "User hasn't created any habits yet.";

        const apiMessages = messages.slice(1).concat(userMessage).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

        const { data, error } = await supabase.functions.invoke('ai-coach', {
          body: {
            messages: apiMessages,
            userContext: habitsContext,
            userProfile: userProfile
          }
        });

        if (error) {
          throw new Error(error.message || "Failed to get response from AI coach");
        }

        setMessages(prev => [...prev, { text: data.response, sender: 'ai' }]);
      } catch (error) {
        console.error('Error getting AI response:', error);
        toast({
          title: "AI Coach Error",
          description: "Sorry, I couldn't process your message. Please try again later.",
          variant: "destructive"
        });
        
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

  const suggestions = [
    "How can I stay consistent with my habits?",
    "What habits would improve my productivity?",
    "Tips for building a morning routine?",
    "How do sleep habits affect other areas of life?"
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="glass-panel mb-4 rounded-2xl w-[320px] sm:w-[350px] max-h-[500px] flex flex-col shadow-lg border border-white/30 bg-white dark:bg-gray-800"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-bettr-blue to-bettr-purple flex items-center justify-center text-white font-bold">
                  <Sparkles size={16} />
                </div>
                <span className="font-medium dark:text-white">{name}</span>
              </div>
              <button onClick={toggleChat} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[350px] bg-white dark:bg-gray-800">
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
              
              {messages.length === 1 && (
                <div className="mt-4">
                  <p className="text-sm text-bettr-text-secondary dark:text-gray-300 mb-2">Try asking about:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-bettr-text-secondary dark:text-gray-300 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="flex-1 px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-bettr-blue/30 transition-all dark:text-white"
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
