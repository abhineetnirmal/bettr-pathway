import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, ChevronUp, Send } from 'lucide-react';
import { HabitsContext, HabitCategory } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';

interface AICoachProps {
  name?: string;
}

const AICoach: React.FC<AICoachProps> = ({ name = "Bettr" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'ai' }[]>([
    { text: `Hi there! I'm ${name}, your personal habit coach. Tell me about a habit you want to build, and I'll add it for you!`, sender: 'ai' }
  ]);
  const { toast } = useToast();
  const { habits, setHabits } = useContext(HabitsContext);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const createHabitFromMessage = (message: string) => {
    const habitCategories: { [key: string]: HabitCategory } = {
      learning: 'learning',
      reading: 'learning',
      study: 'learning',
      education: 'learning',
      mindfulness: 'mindfulness',
      meditation: 'mindfulness',
      mental: 'mindfulness',
      fitness: 'fitness',
      exercise: 'fitness',
      workout: 'fitness',
      gym: 'fitness',
      health: 'health',
      nutrition: 'health',
      diet: 'health',
      sleep: 'health',
      creativity: 'creativity',
      art: 'creativity',
      music: 'creativity',
      writing: 'creativity',
      productivity: 'productivity',
      work: 'productivity',
      focus: 'productivity',
    };

    let title = '';
    let category: HabitCategory = 'productivity';
    let frequency: number[] = [1, 3, 5];
    let goalPerWeek = 3;

    title = message.split(/[.!?]/)[0].trim();
    if (title.length > 50) title = title.substring(0, 50);
    
    for (const [keyword, cat] of Object.entries(habitCategories)) {
      if (message.toLowerCase().includes(keyword)) {
        category = cat;
        break;
      }
    }

    if (message.toLowerCase().includes('daily') || message.toLowerCase().includes('every day')) {
      frequency = [0, 1, 2, 3, 4, 5, 6];
      goalPerWeek = 7;
    } else if (message.toLowerCase().includes('weekday') || message.toLowerCase().includes('work day')) {
      frequency = [1, 2, 3, 4, 5];
      goalPerWeek = 5;
    } else if (message.toLowerCase().includes('weekend')) {
      frequency = [0, 6];
      goalPerWeek = 2;
    }

    const newHabit = {
      id: Date.now().toString(),
      title,
      category,
      streak: 0,
      completedToday: false,
      totalCompletions: 0,
      goalPerWeek,
      completionsThisWeek: 0,
      frequency,
      completionHistory: []
    };

    return newHabit;
  };

  const handleSend = () => {
    if (input.trim()) {
      const userMessage = input.trim();
      setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
      
      const shouldCreateHabit = 
        (userMessage.toLowerCase().includes('habit') || 
        userMessage.toLowerCase().includes('track') ||
        userMessage.toLowerCase().includes('start') ||
        userMessage.toLowerCase().includes('add')) &&
        userMessage.length > 10;
      
      setTimeout(() => {
        if (shouldCreateHabit) {
          const newHabit = createHabitFromMessage(userMessage);
          
          setHabits(prevHabits => [...prevHabits, newHabit]);
          
          const responseText = `I've added "${newHabit.title}" to your habits! I've set it as a ${newHabit.category} habit with a goal of ${newHabit.goalPerWeek} times per week. You can edit the details on your main screen if needed.`;
          setMessages(prev => [...prev, { text: responseText, sender: 'ai' }]);
          
          toast({
            title: "New Habit Created",
            description: `${newHabit.title} has been added to your habits.`,
          });
        } else {
          const responses = [
            "I think that's a great habit to build! Try saying something like 'I want to start a daily meditation habit' and I'll add it for you.",
            "Remember to focus on consistency rather than perfection. Small steps lead to big changes!",
            "To add a new habit, just tell me what you want to track. For example, 'Add a reading habit for 20 minutes every day'.",
            "Great work on maintaining your streaks! Which habit are you finding most valuable?",
            "Let's break this down into smaller, more manageable parts. What specific habit would you like to track?",
          ];
          
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          setMessages(prev => [...prev, { text: randomResponse, sender: 'ai' }]);
        }
      }, 1000);
      
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
