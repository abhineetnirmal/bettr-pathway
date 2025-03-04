import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import StreakCounter from './StreakCounter';
import { CheckCircle, Calendar, BookOpenCheck, Brain, Dumbbell, Heart, Music, Coffee, ArrowRight } from 'lucide-react';
import { HabitCategory } from '@/pages/Index';

interface HabitCardProps {
  id: string;
  title: string;
  category: HabitCategory;
  streak: number;
  completedToday: boolean;
  totalCompletions: number;
  goalPerWeek: number;
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
  goalPerWeek,
  completionsThisWeek,
  onToggle
}) => {
  const categoryIcons = {
    learning: BookOpenCheck,
    mindfulness: Brain,
    fitness: Dumbbell,
    health: Heart,
    creativity: Music,
    productivity: Coffee
  };
  
  const categoryColors = {
    learning: 'text-blue-500',
    mindfulness: 'text-purple-500',
    fitness: 'text-pink-500',
    health: 'text-green-500',
    creativity: 'text-orange-500',
    productivity: 'text-indigo-500'
  };
  
  const progress = (completionsThisWeek / goalPerWeek) * 100;
  
  const Icon = categoryIcons[category];

  return (
    <motion.div 
      className="habit-card relative bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
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
          className={`p-2 rounded-full ${completedToday ? 'text-bettr-green' : 'text-gray-300'} transition-colors`}
          onClick={() => onToggle(id)}
          whileTap={{ scale: 0.9 }}
        >
          <CheckCircle size={22} />
        </motion.button>
      </div>
      
      <div className="flex justify-between items-center">
        <StreakCounter streak={streak} />
        
        <div className="flex items-center space-x-1 text-sm text-bettr-text-secondary">
          <Calendar size={14} />
          <span>{completionsThisWeek}/{goalPerWeek} this week</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t">
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-bettr-blue rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
      
      <Link 
        to={`/habit/${id}`} 
        className="absolute inset-0 z-10 flex items-end justify-end p-3 opacity-0 hover:opacity-100 transition-opacity"
        aria-label={`View details for ${title}`}
      >
        <div className="flex items-center text-xs font-medium text-bettr-blue bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm">
          <span>View details</span>
          <ArrowRight size={12} className="ml-1" />
        </div>
      </Link>
    </motion.div>
  );
};

export default HabitCard;
