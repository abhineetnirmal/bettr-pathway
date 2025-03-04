
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
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

export type HabitCategory = 'learning' | 'mindfulness' | 'fitness' | 'health' | 'creativity' | 'productivity';

export interface Habit {
  id: string;
  title: string;
  category: HabitCategory;
  streak: number;
  completedToday: boolean;
  totalCompletions: number;
  goalPerWeek: number;
  completionsThisWeek: number;
  frequency: number[];
  completionHistory: { date: string; completed: boolean }[];
}

// Create a context to share habits data across components
export const HabitsContext = React.createContext<{
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  toggleHabitCompletion: (habitId: string, date?: Date) => void;
}>({ 
  habits: [], 
  setHabits: () => {},
  toggleHabitCompletion: () => {} 
});

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [progressData, setProgressData] = useState<{ day: string; completed: number }[]>([]);
  
  // Load saved data on initial render
  useEffect(() => {
    // Load onboarding status
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    if (onboardingCompleted === 'true') {
      setShowOnboarding(false);
    }
    
    // Load saved habits from localStorage
    const savedHabits = localStorage.getItem('habits');
    if (savedHabits) {
      const parsedHabits = JSON.parse(savedHabits);
      
      // Make sure habits have completionHistory property
      const habitsWithHistory = parsedHabits.map((habit: any) => ({
        ...habit,
        completionHistory: habit.completionHistory || []
      }));
      
      setHabits(habitsWithHistory);
    } else {
      // Set initial demo habits if no saved habits exist
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
      
      const initialHabits = [
        {
          id: '1',
          title: 'Morning Meditation',
          category: 'mindfulness' as HabitCategory,
          streak: 5,
          completedToday: true,
          totalCompletions: 32,
          goalPerWeek: 5,
          completionsThisWeek: 3,
          frequency: [1, 2, 3, 4, 5],
          completionHistory: [
            { date: yesterdayStr, completed: true },
            { date: todayStr, completed: true }
          ]
        },
        {
          id: '2',
          title: 'Read 20 Pages',
          category: 'learning' as HabitCategory,
          streak: 12,
          completedToday: false,
          totalCompletions: 45,
          goalPerWeek: 7,
          completionsThisWeek: 5,
          frequency: [0, 1, 2, 3, 4, 5, 6],
          completionHistory: [
            { date: yesterdayStr, completed: true }
          ]
        },
        {
          id: '3',
          title: '10,000 Steps',
          category: 'fitness' as HabitCategory,
          streak: 3,
          completedToday: false,
          totalCompletions: 21,
          goalPerWeek: 5,
          completionsThisWeek: 2,
          frequency: [1, 3, 5],
          completionHistory: [
            { date: yesterdayStr, completed: true }
          ]
        }
      ];
      setHabits(initialHabits);
      localStorage.setItem('habits', JSON.stringify(initialHabits));
    }
  }, []);
  
  // Calculate progress data for the current week
  useEffect(() => {
    const today = new Date();
    const firstDayOfWeek = startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday
    const lastDayOfWeek = endOfWeek(today, { weekStartsOn: 1 });
    
    const daysOfWeek = eachDayOfInterval({ start: firstDayOfWeek, end: lastDayOfWeek });
    
    const weeklyProgress = daysOfWeek.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayName = format(day, 'EEE');
      
      // Count completions for this day
      let completedCount = 0;
      
      habits.forEach(habit => {
        const completionForDay = habit.completionHistory.find(h => h.date === dayStr);
        if (completionForDay && completionForDay.completed) {
          completedCount++;
        }
      });
      
      return { day: dayName, completed: completedCount };
    });
    
    setProgressData(weeklyProgress);
  }, [habits]);
  
  // Save habits whenever they change
  useEffect(() => {
    if (habits.length > 0) {
      localStorage.setItem('habits', JSON.stringify(habits));
    }
  }, [habits]);
  
  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('onboardingCompleted', 'true');
  };
  
  const toggleHabitCompletion = (id: string, date?: Date) => {
    const today = date || new Date();
    const dateStr = format(today, 'yyyy-MM-dd');
    
    setHabits(prevHabits => {
      return prevHabits.map(habit => {
        if (habit.id !== id) return habit;
        
        // Find if there's already a record for this date
        const existingIndex = habit.completionHistory.findIndex(h => h.date === dateStr);
        let newCompletionHistory = [...habit.completionHistory];
        
        // Toggle completion for this date
        if (existingIndex >= 0) {
          const newCompleted = !habit.completionHistory[existingIndex].completed;
          newCompletionHistory[existingIndex] = { 
            date: dateStr, 
            completed: newCompleted 
          };
        } else {
          // No record for this date, create a new one (completed)
          newCompletionHistory.push({ date: dateStr, completed: true });
        }
        
        // Calculate streak
        let currentStreak = 0;
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Sort history by date (newest first)
        const sortedHistory = [...newCompletionHistory]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        // Count consecutive completed days
        for (const entry of sortedHistory) {
          if (entry.completed) {
            currentStreak++;
          } else {
            break;
          }
        }
        
        // Calculate completions this week
        const startDay = startOfWeek(today, { weekStartsOn: 1 });
        const endDay = endOfWeek(today, { weekStartsOn: 1 });
        
        const completionsThisWeek = newCompletionHistory.filter(h => {
          const entryDate = new Date(h.date);
          return h.completed && entryDate >= startDay && entryDate <= endDay;
        }).length;
        
        // Update completedToday based on the current date
        const isTodayCompleted = newCompletionHistory.some(
          h => h.date === format(new Date(), 'yyyy-MM-dd') && h.completed
        );
        
        return {
          ...habit,
          completedToday: isTodayCompleted,
          completionHistory: newCompletionHistory,
          streak: currentStreak,
          completionsThisWeek,
          totalCompletions: newCompletionHistory.filter(h => h.completed).length
        };
      });
    });
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
      frequency: habitData.frequency,
      completionHistory: []
    };
    
    setHabits([...habits, newHabit]);
    setShowHabitForm(false);
  };

  return (
    <HabitsContext.Provider value={{ habits, setHabits, toggleHabitCompletion }}>
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
    </HabitsContext.Provider>
  );
};

export default Index;
