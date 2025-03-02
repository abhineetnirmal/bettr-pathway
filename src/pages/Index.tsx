
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import MainLayout from '@/layouts/MainLayout';
import HabitCard from '@/components/HabitCard';
import ProgressChart from '@/components/ProgressChart';
import AICoach from '@/components/AICoach';
import MotivationalQuote from '@/components/MotivationalQuote';
import HabitForm from '@/components/HabitForm';
import OnboardingScreen from '@/components/OnboardingScreen';

type HabitCategory = 'learning' | 'mindfulness' | 'fitness' | 'health' | 'creativity' | 'productivity';

interface Habit {
  id: string;
  title: string;
  category: HabitCategory;
  streak: number;
  completedToday: boolean;
  totalCompletions: number;
  goalPerWeek: number;
  completionsThisWeek: number;
  frequency: number[];
}

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: '1',
      title: 'Morning Meditation',
      category: 'mindfulness',
      streak: 5,
      completedToday: true,
      totalCompletions: 32,
      goalPerWeek: 5,
      completionsThisWeek: 3,
      frequency: [1, 2, 3, 4, 5]
    },
    {
      id: '2',
      title: 'Read 20 Pages',
      category: 'learning',
      streak: 12,
      completedToday: false,
      totalCompletions: 45,
      goalPerWeek: 7,
      completionsThisWeek: 5,
      frequency: [0, 1, 2, 3, 4, 5, 6]
    },
    {
      id: '3',
      title: '10,000 Steps',
      category: 'fitness',
      streak: 3,
      completedToday: false,
      totalCompletions: 21,
      goalPerWeek: 5,
      completionsThisWeek: 2,
      frequency: [1, 3, 5]
    }
  ]);
  
  const [progressData, setProgressData] = useState([
    { day: 'Mon', completed: 2 },
    { day: 'Tue', completed: 3 },
    { day: 'Wed', completed: 1 },
    { day: 'Thu', completed: 3 },
    { day: 'Fri', completed: 2 },
    { day: 'Sat', completed: 0 },
    { day: 'Sun', completed: 0 }
  ]);
  
  const completeOnboarding = () => {
    setShowOnboarding(false);
  };
  
  const toggleHabitCompletion = (id: string) => {
    setHabits(habits.map(habit => 
      habit.id === id 
        ? { 
            ...habit, 
            completedToday: !habit.completedToday,
            completionsThisWeek: habit.completedToday 
              ? habit.completionsThisWeek - 1 
              : habit.completionsThisWeek + 1,
            streak: habit.completedToday ? habit.streak - 1 : habit.streak + 1
          } 
        : habit
    ));
  };
  
  const saveNewHabit = (habitData: {
    title: string;
    category: HabitCategory;
    frequency: number[];
    goalPerWeek: number;
  }) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      title: habitData.title,
      category: habitData.category,
      streak: 0,
      completedToday: false,
      totalCompletions: 0,
      goalPerWeek: habitData.goalPerWeek,
      completionsThisWeek: 0,
      frequency: habitData.frequency
    };
    
    setHabits([...habits, newHabit]);
    setShowHabitForm(false);
  };

  return (
    <MainLayout>
      <AnimatePresence>
        {showOnboarding && <OnboardingScreen onComplete={completeOnboarding} />}
      </AnimatePresence>
      
      <div className="max-w-3xl mx-auto">
        {/* Header section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-2">Your Habits</h1>
          <p className="text-bettr-text-secondary">Track your progress and build consistency</p>
        </motion.div>
        
        {/* Today's habits */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Today</h2>
            <motion.button
              className="btn-primary flex items-center space-x-1"
              onClick={() => setShowHabitForm(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Plus size={16} />
              <span>New Habit</span>
            </motion.button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-fade-in">
            {habits.map((habit) => (
              <HabitCard 
                key={habit.id}
                {...habit}
                onToggle={toggleHabitCompletion}
              />
            ))}
            
            {habits.length === 0 && (
              <div className="col-span-full glass-card p-6 text-center">
                <Sparkles className="mx-auto mb-3 text-bettr-orange" size={24} />
                <h3 className="text-lg font-medium mb-2">No habits yet</h3>
                <p className="text-bettr-text-secondary mb-4">Start building your routine by adding your first habit</p>
                <button 
                  className="btn-primary mx-auto"
                  onClick={() => setShowHabitForm(true)}
                >
                  Create Habit
                </button>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Progress & Motivation Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <ProgressChart data={progressData} />
          <MotivationalQuote />
        </div>
      </div>
      
      {/* AI Coach */}
      <AICoach />
      
      {/* Habit Form Modal */}
      <AnimatePresence>
        {showHabitForm && (
          <HabitForm 
            onClose={() => setShowHabitForm(false)}
            onSave={saveNewHabit}
          />
        )}
      </AnimatePresence>
    </MainLayout>
  );
};

export default Index;
