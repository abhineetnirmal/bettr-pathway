import React, { useState, useEffect, createContext } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type HabitCategory = 'learning' | 'mindfulness' | 'fitness' | 'health' | 'creativity' | 'productivity';

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

// Create a context to share habits data across components
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
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Load habits from Supabase on initial render
  useEffect(() => {
    if (!user) return;
    
    const fetchHabits = async () => {
      setLoading(true);
      try {
        // Fetch habits from Supabase
        const { data: habitsData, error: habitsError } = await supabase
          .from('habits')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (habitsError) throw habitsError;
        
        // Fetch habit completions
        const { data: completionsData, error: completionsError } = await supabase
          .from('habit_completions')
          .select('*');
          
        if (completionsError) throw completionsError;
        
        // Process the fetched data
        const processedHabits = habitsData.map(habit => {
          // Get completions for this habit
          const habitCompletions = completionsData.filter(
            completion => completion.habit_id === habit.id
          );
          
          // Calculate completions this week
          const today = new Date();
          const startDay = startOfWeek(today, { weekStartsOn: 1 });
          const endDay = endOfWeek(today, { weekStartsOn: 1 });
          
          const completionsThisWeek = habitCompletions.filter(completion => {
            const completionDate = new Date(completion.completed_date);
            return completionDate >= startDay && completionDate <= endDay;
          }).length;
          
          // Calculate streak
          let currentStreak = 0;
          const sortedCompletions = [...habitCompletions].sort(
            (a, b) => new Date(b.completed_date).getTime() - new Date(a.completed_date).getTime()
          );
          
          // Sort completion dates in descending order
          const sortedDates = sortedCompletions.map(c => new Date(c.completed_date));
          
          if (sortedDates.length > 0) {
            currentStreak = 1; // Start with 1 for the most recent completion
            
            for (let i = 0; i < sortedDates.length - 1; i++) {
              const currentDate = sortedDates[i];
              const prevDate = sortedDates[i + 1];
              
              // Calculate days between completions
              const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              // If days between completions is exactly 1, continue the streak
              if (diffDays === 1) {
                currentStreak++;
              } else {
                break; // Break the streak
              }
            }
          }
          
          // Check if completed today
          const todayStr = format(today, 'yyyy-MM-dd');
          const completedToday = habitCompletions.some(
            completion => completion.completed_date === todayStr
          );
          
          // Format completion history for the component
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
    
    // Check if this is the first login by checking if onboarding has been completed in profiles
    const checkOnboarding = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        // If onboarding not completed, show onboarding
        setShowOnboarding(data && !data.onboarding_completed);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };
    
    fetchHabits();
    checkOnboarding();
    
  }, [user, toast]);
  
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
  
  const completeOnboarding = async () => {
    if (!user) return;
    
    try {
      // Update profile to mark onboarding as completed
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
      // Find the habit 
      const habit = habits.find(h => h.id === id);
      if (!habit) {
        throw new Error('Habit not found');
      }
      
      // Check if there's already a completion record for this date
      const existingCompletion = habit.completionHistory.find(h => h.date === dateStr);
      
      if (existingCompletion) {
        // If already completed, delete the record
        const { error } = await supabase
          .from('habit_completions')
          .delete()
          .match({ habit_id: id, completed_date: dateStr });
          
        if (error) throw error;
      } else {
        // If not completed, insert a new record
        const { error } = await supabase
          .from('habit_completions')
          .insert({
            habit_id: id,
            user_id: user!.id,
            completed_date: dateStr
          });
          
        if (error) throw error;
      }
      
      // Update the local state
      setHabits(prevHabits => {
        return prevHabits.map(habit => {
          if (habit.id !== id) return habit;
          
          // Find if there's already a record for this date
          const existingIndex = habit.completionHistory.findIndex(h => h.date === dateStr);
          let newCompletionHistory = [...habit.completionHistory];
          
          // Toggle completion for this date
          if (existingIndex >= 0) {
            // Remove the record
            newCompletionHistory = newCompletionHistory.filter((_, i) => i !== existingIndex);
          } else {
            // Add a new record
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
  
  const saveNewHabit = async (habitData: {
    title: string;
    category: HabitCategory;
    frequency: number[];
    goalperweek: number;
  }) => {
    try {
      // Insert the new habit into Supabase
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
      
      // Create the new habit object
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
      
      // Update state with the new habit
      setHabits(prev => [newHabit, ...prev]);
      setShowHabitForm(false);
      
      toast({
        title: "Habit created!",
        description: `'${habitData.title}' has been added to your habits.`
      });
      
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
            )}
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
