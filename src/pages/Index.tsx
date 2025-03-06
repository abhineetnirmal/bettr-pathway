import React, { useState, useEffect, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, Calendar as CalendarIcon, Sun, Moon, Sunset } from 'lucide-react';
import MainLayout from '@/layouts/MainLayout';
import HabitCard from '@/components/HabitCard';
import ProgressChart from '@/components/ProgressChart';
import AICoach from '@/components/AICoach';
import MotivationalQuote from '@/components/MotivationalQuote';
import HabitForm from '@/components/HabitForm';
import OnboardingScreen from '@/components/OnboardingScreen';
import CalendarSection from '@/components/CalendarSection';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type HabitCategory = 'learning' | 'mindfulness' | 'fitness' | 'health' | 'creativity' | 'productivity' | 'sleep' | 'work';

export interface Habit {
  id: string;
  title: string;
  category: HabitCategory;
  streak: number;
  completedToday: boolean;
  totalCompletions: number;
  goalperweek: number;
  completionsThisWeek: number;
  frequency: number[];
  completionHistory: { date: string; completed: boolean }[];
}

export const HabitsContext = createContext<{
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  toggleHabitCompletion: (habitId: string, date?: Date) => void;
  loading: boolean;
}>({ 
  habits: [], 
  setHabits: () => {},
  toggleHabitCompletion: () => {},
  loading: true 
});

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [progressData, setProgressData] = useState<{ day: string; completed: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [quoteOrScience, setQuoteOrScience] = useState<'quote' | 'science'>('quote');
  const { user } = useAuth();
  const { toast } = useToast();
  
  const getCurrentTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { greeting: 'Good morning', icon: <Sun className="text-yellow-500" /> };
    if (hour < 18) return { greeting: 'Good afternoon', icon: <Sun className="text-orange-500" /> };
    return { greeting: 'Good evening', icon: <Moon className="text-indigo-400" /> };
  };
  
  const { greeting, icon } = getCurrentTimeOfDay();
  const today = new Date();
  const formattedDate = format(today, 'EEEE, MMMM do, yyyy');
  
  useEffect(() => {
    if (!user) return;
    
    const fetchHabits = async () => {
      setLoading(true);
      try {
        const { data: habitsData, error: habitsError } = await supabase
          .from('habits')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (habitsError) throw habitsError;
        
        const { data: completionsData, error: completionsError } = await supabase
          .from('habit_completions')
          .select('*');
          
        if (completionsError) throw completionsError;
        
        const processedHabits = habitsData.map(habit => {
          const habitCompletions = completionsData.filter(
            completion => completion.habit_id === habit.id
          );
          
          const today = new Date();
          const startDay = startOfWeek(today, { weekStartsOn: 1 });
          const endDay = endOfWeek(today, { weekStartsOn: 1 });
          
          const completionsThisWeek = habitCompletions.filter(completion => {
            const completionDate = new Date(completion.completed_date);
            return completionDate >= startDay && completionDate <= endDay;
          }).length;
          
          let currentStreak = 0;
          const sortedCompletions = [...habitCompletions].sort(
            (a, b) => new Date(b.completed_date).getTime() - new Date(a.completed_date).getTime()
          );
          
          const sortedDates = sortedCompletions.map(c => new Date(c.completed_date));
          
          if (sortedDates.length > 0) {
            currentStreak = 1;
            
            for (let i = 0; i < sortedDates.length - 1; i++) {
              const currentDate = sortedDates[i];
              const prevDate = sortedDates[i + 1];
              
              const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays === 1) {
                currentStreak++;
              } else {
                break;
              }
            }
          }
          
          const todayStr = format(today, 'yyyy-MM-dd');
          const completedToday = habitCompletions.some(
            completion => completion.completed_date === todayStr
          );
          
          const completionHistory = habitCompletions.map(completion => ({
            date: completion.completed_date,
            completed: true
          }));
          
          return {
            id: habit.id,
            title: habit.title,
            category: habit.category as HabitCategory,
            streak: currentStreak,
            completedToday,
            totalCompletions: habitCompletions.length,
            goalperweek: habit.goalperweek,
            completionsThisWeek,
            frequency: habit.frequency,
            completionHistory
          };
        });
        
        setHabits(processedHabits);
      } catch (error) {
        console.error('Error fetching habits:', error);
        toast({
          title: "Error fetching habits",
          description: "There was a problem loading your habits. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    const checkOnboarding = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setShowOnboarding(data && data.onboarding_completed === false);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };
    
    fetchHabits();
    checkOnboarding();
  }, [user, toast]);
  
  useEffect(() => {
    const today = new Date();
    const firstDayOfWeek = startOfWeek(today, { weekStartsOn: 1 });
    const lastDayOfWeek = endOfWeek(today, { weekStartsOn: 1 });
    
    const daysOfWeek = eachDayOfInterval({ start: firstDayOfWeek, end: lastDayOfWeek });
    
    const weeklyProgress = daysOfWeek.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayName = format(day, 'EEE');
      
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
  
  useEffect(() => {
    const savedPreference = localStorage.getItem('bettr-motivation-preference');
    if (savedPreference) {
      setQuoteOrScience(savedPreference as 'quote' | 'science');
    }
  }, []);
  
  const completeOnboarding = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error updating onboarding status:', error);
    }
  };
  
  const toggleHabitCompletion = async (id: string, date?: Date) => {
    const today = date || new Date();
    const dateStr = format(today, 'yyyy-MM-dd');
    
    try {
      const habit = habits.find(h => h.id === id);
      if (!habit) {
        throw new Error('Habit not found');
      }
      
      const existingCompletion = habit.completionHistory.find(h => h.date === dateStr);
      
      if (existingCompletion) {
        const { error } = await supabase
          .from('habit_completions')
          .delete()
          .match({ habit_id: id, completed_date: dateStr });
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('habit_completions')
          .insert({
            habit_id: id,
            user_id: user!.id,
            completed_date: dateStr
          });
          
        if (error) throw error;
      }
      
      setHabits(prevHabits => {
        return prevHabits.map(habit => {
          if (habit.id !== id) return habit;
          
          const existingIndex = habit.completionHistory.findIndex(h => h.date === dateStr);
          let newCompletionHistory = [...habit.completionHistory];
          
          if (existingIndex >= 0) {
            newCompletionHistory = newCompletionHistory.filter((_, i) => i !== existingIndex);
          } else {
            newCompletionHistory.push({ date: dateStr, completed: true });
          }
          
          let currentStreak = 0;
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          const sortedHistory = [...newCompletionHistory]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          for (const entry of sortedHistory) {
            if (entry.completed) {
              currentStreak++;
            } else {
              break;
            }
          }
          
          const startDay = startOfWeek(today, { weekStartsOn: 1 });
          const endDay = endOfWeek(today, { weekStartsOn: 1 });
          
          const completionsThisWeek = newCompletionHistory.filter(h => {
            const entryDate = new Date(h.date);
            return h.completed && entryDate >= startDay && entryDate <= endDay;
          }).length;
          
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
      
      toast({
        title: existingCompletion ? "Habit marked incomplete" : "Habit completed!",
        description: existingCompletion ? 
          "You've marked this habit as incomplete for today." : 
          "Great job! Keep up the good work.",
        variant: existingCompletion ? "default" : "default"
      });
      
    } catch (error) {
      console.error('Error toggling habit completion:', error);
      toast({
        title: "Error",
        description: "Failed to update habit completion. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleMotivationToggle = (value: 'quote' | 'science') => {
    setQuoteOrScience(value);
    localStorage.setItem('bettr-motivation-preference', value);
  };
  
  const saveNewHabit = async (habitData: {
    title: string;
    category: HabitCategory;
    frequency: number[];
    goalperweek: number;
  }) => {
    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          title: habitData.title,
          category: habitData.category,
          frequency: habitData.frequency,
          goalperweek: habitData.goalperweek,
          user_id: user!.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      const newHabit: Habit = {
        id: data.id,
        title: data.title,
        category: data.category as HabitCategory,
        streak: 0,
        completedToday: false,
        totalCompletions: 0,
        goalperweek: data.goalperweek,
        completionsThisWeek: 0,
        frequency: data.frequency,
        completionHistory: []
      };
      
      setHabits(prev => [newHabit, ...prev]);
      setShowHabitForm(false);
      
      toast({
        title: "Habit created!",
        description: `'${habitData.title}' has been added to your habits.`
      });
      
      if (habits.length === 0) {
        toast({
          title: "Achievement unlocked!",
          description: "You've created your first habit. Keep going!"
        });
      }
      
    } catch (error) {
      console.error('Error creating habit:', error);
      toast({
        title: "Error",
        description: "Failed to create habit. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <HabitsContext.Provider value={{ habits, setHabits, toggleHabitCompletion, loading }}>
      <MainLayout>
        <AnimatePresence>
          {showOnboarding && <OnboardingScreen onComplete={completeOnboarding} />}
        </AnimatePresence>
        
        <div className="max-w-3xl mx-auto">
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center mb-1 text-gray-500">
              <CalendarIcon size={16} className="mr-2" />
              <span className="text-sm">{formattedDate}</span>
            </div>
            <div className="flex items-center">
              <h1 className="text-3xl font-bold dark:text-white">{greeting}, {user?.user_metadata?.full_name || 'there'}!</h1>
              <span className="ml-2">{icon}</span>
            </div>
            <p className="text-bettr-text-secondary dark:text-gray-300 mt-1">Track your progress and build consistency</p>
          </motion.div>
          
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold dark:text-white">Today</h2>
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
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-bettr-blue border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-fade-in">
                {habits.map((habit) => (
                  <HabitCard 
                    key={habit.id}
                    id={habit.id}
                    title={habit.title}
                    category={habit.category}
                    streak={habit.streak}
                    completedToday={habit.completedToday}
                    totalCompletions={habit.totalCompletions}
                    goalperweek={habit.goalperweek}
                    completionsThisWeek={habit.completionsThisWeek}
                    onToggle={toggleHabitCompletion}
                  />
                ))}
                
                {habits.length === 0 && (
                  <div className="col-span-full glass-card p-6 text-center">
                    <Sparkles className="mx-auto mb-3 text-bettr-orange" size={24} />
                    <h3 className="text-lg font-medium mb-2 dark:text-white">No habits yet</h3>
                    <p className="text-bettr-text-secondary dark:text-gray-300 mb-4">Start building your routine by adding your first habit</p>
                    <button 
                      className="btn-primary mx-auto"
                      onClick={() => setShowHabitForm(true)}
                    >
                      Create Habit
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <ProgressChart data={progressData} />
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium dark:text-white">Motivation</h3>
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                  <button 
                    className={"px-3 py-1 text-sm rounded-full transition " + (quoteOrScience === 'quote' ? 'bg-white dark:bg-gray-700 shadow-sm' : '')}
                    onClick={() => handleMotivationToggle('quote')}
                  >
                    Daily
                  </button>
                  <button 
                    className={"px-3 py-1 text-sm rounded-full transition " + (quoteOrScience === 'science' ? 'bg-white dark:bg-gray-700 shadow-sm' : '')}
                    onClick={() => handleMotivationToggle('science')}
                  >
                    Science
                  </button>
                </div>
              </div>
              <MotivationalQuote variant={quoteOrScience} />
            </div>
          </div>
          
          <CalendarSection />
        </div>
        
        <AICoach />
        
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
