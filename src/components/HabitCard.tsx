
import React from 'react';
import { motion } from 'framer-motion';
import StreakCounter from './StreakCounter';
import { CheckCircle, Calendar, BookOpenCheck, Brain, Dumbbell, Heart, Music, Coffee, Laptop, Moon } from 'lucide-react';
import { HabitCategory } from './HabitForm';

interface HabitCardProps {
  id: string;
  title: string;
  category: HabitCategory;
  streak: number;
  completedToday: boolean;
  totalCompletions: number;
  goalperweek: number;
  completionsThisWeek: number;
  onToggle: (id: string) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({
  id,
  title,
  category,
  streak,
  completedToday,
  totalCompletions,
  goalperweek,
  completionsThisWeek,
  onToggle
}) => {
  const categoryIcons = {
    learning: BookOpenCheck,
    mindfulness: Brain,
    fitness: Dumbbell,
    health: Heart,
    creativity: Music,
    productivity: Coffee,
    sleep: Moon,
    work: Laptop
  };
  
  const categoryColors = {
    learning: 'text-blue-500',
    mindfulness: 'text-purple-500',
    fitness: 'text-pink-500',
    health: 'text-green-500',
    creativity: 'text-orange-500',
    productivity: 'text-indigo-500',
    sleep: 'text-blue-400',
    work: 'text-gray-500'
  };
  
  const progress = (completionsThisWeek / goalperweek) * 100;
  
  const Icon = categoryIcons[category] || Coffee;

  return (
    <motion.div 
      className="habit-card dark:border-gray-700 dark:bg-gray-800"
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-full bg-opacity-10 ${categoryColors[category].replace('text-', 'bg-')}`}>
            <Icon className={categoryColors[category]} size={16} />
          </div>
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        <motion.button 
          className={`p-2 rounded-full ${completedToday ? 'text-bettr-green' : 'text-gray-300 dark:text-gray-600'} transition-colors`}
          onClick={() => onToggle(id)}
          whileTap={{ scale: 0.9 }}
        >
          <CheckCircle size={22} />
        </motion.button>
      </div>
      
      <div className="flex justify-between items-center">
        <StreakCounter streak={streak} />
        
        <div className="flex items-center space-x-1 text-sm text-bettr-text-secondary dark:text-gray-400">
          <Calendar size={14} />
          <span>{completionsThisWeek}/{goalperweek} this week</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t dark:border-gray-700">
        <div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-bettr-blue rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default HabitCard;
