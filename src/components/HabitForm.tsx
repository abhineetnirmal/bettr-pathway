
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, BookOpenCheck, Brain, Dumbbell, Heart, Music, Coffee } from 'lucide-react';

type HabitCategory = 'learning' | 'mindfulness' | 'fitness' | 'health' | 'creativity' | 'productivity';

interface HabitFormProps {
  onClose: () => void;
  onSave: (habit: {
    title: string;
    category: HabitCategory;
    frequency: number[];
    goalPerWeek: number;
  }) => void;
}

const HabitForm: React.FC<HabitFormProps> = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HabitCategory>('productivity');
  const [frequency, setFrequency] = useState<number[]>([1, 3, 5]); // Days of week (0 = Sunday, 6 = Saturday)
  const [goalPerWeek, setGoalPerWeek] = useState(3);
  
  const categories = [
    { id: 'learning', label: 'Learning', icon: BookOpenCheck, color: 'bg-blue-500' },
    { id: 'mindfulness', label: 'Mindfulness', icon: Brain, color: 'bg-purple-500' },
    { id: 'fitness', label: 'Fitness', icon: Dumbbell, color: 'bg-pink-500' },
    { id: 'health', label: 'Health', icon: Heart, color: 'bg-green-500' },
    { id: 'creativity', label: 'Creativity', icon: Music, color: 'bg-orange-500' },
    { id: 'productivity', label: 'Productivity', icon: Coffee, color: 'bg-indigo-500' },
  ];
  
  const days = [
    { id: 0, label: 'S' },
    { id: 1, label: 'M' },
    { id: 2, label: 'T' },
    { id: 3, label: 'W' },
    { id: 4, label: 'T' },
    { id: 5, label: 'F' },
    { id: 6, label: 'S' },
  ];
  
  const toggleDay = (dayId: number) => {
    if (frequency.includes(dayId)) {
      setFrequency(frequency.filter(id => id !== dayId));
    } else {
      setFrequency([...frequency, dayId]);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave({
        title,
        category,
        frequency,
        goalPerWeek
      });
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="glass-panel rounded-3xl w-full max-w-md p-6"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Create New Habit</h2>
          <motion.button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <X size={20} />
          </motion.button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="habit-title" className="block mb-2 font-medium">
              What habit do you want to build?
            </label>
            <input
              id="habit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Morning meditation, Daily reading"
              className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-bettr-blue/30 transition-all"
              required
            />
          </div>
          
          <div className="mb-5">
            <label className="block mb-2 font-medium">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  type="button"
                  className={`p-3 rounded-xl flex flex-col items-center justify-center ${
                    category === cat.id 
                      ? `${cat.color} text-white` 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } transition-colors`}
                  onClick={() => setCategory(cat.id as HabitCategory)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <cat.icon size={20} />
                  <span className="text-xs mt-1">{cat.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
          
          <div className="mb-5">
            <label className="block mb-2 font-medium">Frequency</label>
            <div className="flex justify-between mb-2">
              {days.map((day) => (
                <motion.button
                  key={day.id}
                  type="button"
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    frequency.includes(day.id)
                      ? 'bg-bettr-blue text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } transition-colors`}
                  onClick={() => toggleDay(day.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {day.label}
                </motion.button>
              ))}
            </div>
            <div className="text-sm text-center text-bettr-text-secondary mt-1">
              Selected: {frequency.length} days per week
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block mb-2 font-medium">Weekly Goal</label>
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 5, 7].map((num) => (
                <motion.button
                  key={num}
                  type="button"
                  className={`px-3 py-2 rounded-lg ${
                    goalPerWeek === num
                      ? 'bg-bettr-blue text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } transition-colors`}
                  onClick={() => setGoalPerWeek(num)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {num} {num === 1 ? 'time' : 'times'}
                </motion.button>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <motion.button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-300 font-medium text-bettr-text-secondary hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-bettr-blue text-white font-medium flex items-center justify-center space-x-2 shadow-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!title.trim()}
            >
              <Check size={18} />
              <span>Create Habit</span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default HabitForm;
