
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, ChevronUp, Send } from 'lucide-react';

interface AICoachProps {
  name?: string;
}

const AICoach: React.FC<AICoachProps> = ({ name = "Bettr" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'ai' }[]>([
    { text: `Hi there! I'm ${name}, your personal habit coach. How can I help you today?`, sender: 'ai' }
  ]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = () => {
    if (input.trim()) {
      // Add user message
      setMessages([...messages, { text: input, sender: 'user' }]);
      
      // Simulate AI response (in a real app, this would call an API)
      setTimeout(() => {
        const responses = [
          "I think that's a great habit to build! Let's make it specific and achievable.",
          "Remember to focus on consistency rather than perfection. Small steps lead to big changes!",
          "Based on your progress, I'd recommend focusing on your mindfulness habit this week.",
          "Great work on maintaining your streak! How does it feel?",
          "Let's break this down into smaller, more manageable parts. What's the first tiny step you could take?",
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setMessages(prev => [...prev, { text: randomResponse, sender: 'ai' }]);
      }, 1000);
      
      // Clear input
      setInput("");
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
                />
                <motion.button 
                  onClick={handleSend}
                  className="p-2 rounded-full bg-bettr-blue text-white"
                  whileTap={{ scale: 0.9 }}
                  disabled={!input.trim()}
                >
                  <Send size={16} />
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
