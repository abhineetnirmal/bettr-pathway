
import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakCounterProps {
  streak: number;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ streak }) => {
  const flameColor = 
    streak < 3 ? 'text-gray-400' :
    streak < 7 ? 'text-yellow-500' :
    streak < 14 ? 'text-orange-500' :
    streak < 30 ? 'text-red-500' :
    'text-purple-500';

  return (
    <motion.div 
      className="flex items-center space-x-1 text-sm font-medium"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
      <motion.div 
        animate={{ 
          rotate: [0, -10, 10, -5, 5, 0],
          scale: [1, 1.1, 1.1, 1.05, 1]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          repeatDelay: 2,
        }}
      >
        <Flame className={flameColor} size={16} />
      </motion.div>
      <span className={streak > 0 ? flameColor : 'text-gray-400'}>
        {streak} day{streak !== 1 ? 's' : ''}
      </span>
    </motion.div>
  );
};

export default StreakCounter;
