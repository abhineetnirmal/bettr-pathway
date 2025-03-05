
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, BookOpenCheck, Brain, Dumbbell, Heart, Music, Coffee, Laptop, Moon } from 'lucide-react';

export type HabitCategory = 'learning' | 'mindfulness' | 'fitness' | 'health' | 'creativity' | 'productivity' | 'sleep' | 'work';

interface HabitFormProps {
  onClose: () => void;
  onSave: (habit: {
    title: string;
    category: HabitCategory;
    frequency: number[];
    goalperweek: number;
  }) => void;
}

const HabitForm: React.FC<HabitFormProps> = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HabitCategory>('productivity');
  const [frequency, setFrequency] = useState<number[]>([1, 3, 5]); // Days of week (0 = Sunday, 6 = Saturday)
  const [goalperweek, setGoalperweek] = useState(3);
  const [showTips, setShowTips] = useState(false);
  
  const categories = [
    { id: 'learning', label: 'Learning', icon: BookOpenCheck, color: 'bg-blue-500' },
    { id: 'mindfulness', label: 'Mindfulness', icon: Brain, color: 'bg-purple-500' },
    { id: 'fitness', label: 'Fitness', icon: Dumbbell, color: 'bg-pink-500' },
    { id: 'health', label: 'Health', icon: Heart, color: 'bg-green-500' },
    { id: 'creativity', label: 'Creativity', icon: Music, color: 'bg-orange-500' },
    { id: 'productivity', label: 'Productivity', icon: Coffee, color: 'bg-indigo-500' },
    { id: 'sleep', label: 'Sleep', icon: Moon, color: 'bg-blue-400' },
    { id: 'work', label: 'Work', icon: Laptop, color: 'bg-gray-500' },
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
        goalperweek
      });
    }
  };
  
  const habitTips = {
    general: [
      "Start small: Begin with habits that take less than 2 minutes",
      "Stack habits: Attach new habits to existing routines",
      "Track visually: Seeing your progress increases motivation"
    ],
    specific: {
      productivity: ["Try the Pomodoro technique (25 min work, 5 min break)", "Block distractions during focus time"],
      learning: ["Set aside just 15-30 minutes daily for consistent progress", "Apply new knowledge immediately"],
      mindfulness: ["Start with just 1-5 minutes of meditation daily", "Practice mindful breathing during transitions"],
      fitness: ["Schedule workouts at the same time each day", "Prepare workout clothes the night before"],
      health: ["Drink water first thing in the morning", "Meal prep on weekends for healthy eating"],
      creativity: ["Set a timer for 10 minutes of creative practice", "Keep tools visible and accessible"],
      sleep: ["Create a wind-down routine 30 minutes before bed", "Maintain consistent sleep and wake times"],
      work: ["Tackle your most important task first thing", "Take short breaks every 90 minutes"]
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
            <div className="grid grid-cols-4 gap-2">
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
                    goalperweek === num
                      ? 'bg-bettr-blue text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } transition-colors`}
                  onClick={() => setGoalperweek(num)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {num} {num === 1 ? 'time' : 'times'}
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Habit tips section */}
          <div className="mb-5">
            <button
              type="button"
              className="text-sm text-bettr-blue hover:underline focus:outline-none"
              onClick={() => setShowTips(!showTips)}
            >
              {showTips ? 'Hide habit formation tips' : 'Show habit formation tips'}
            </button>
            
            {showTips && (
              <motion.div 
                className="mt-2 p-3 bg-gray-50 rounded-xl text-sm"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="font-medium mb-1">General Tips:</p>
                <ul className="list-disc pl-5 mb-2 space-y-1">
                  {habitTips.general.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
                
                {category && habitTips.specific[category as keyof typeof habitTips.specific] && (
                  <>
                    <p className="font-medium mb-1 mt-2">Tips for {category}:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {habitTips.specific[category as keyof typeof habitTips.specific].map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </>
                )}
              </motion.div>
            )}
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
