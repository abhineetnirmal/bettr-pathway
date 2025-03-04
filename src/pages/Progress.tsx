
import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProgressChart from '@/components/ProgressChart';
import StreakCounter from '@/components/StreakCounter';
import { HabitsContext } from './Index';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

const ProgressPage = () => {
  const { habits } = useContext(HabitsContext);
  const [progressData, setProgressData] = useState<{ day: string; completed: number }[]>([]);
  
  // Calculate the longest streak from all habits
  const longestStreak = Math.max(...habits.map(habit => habit.streak), 0);
  
  // Calculate weekly completion rate
  const totalCompletionsThisWeek = habits.reduce((sum, habit) => sum + habit.completionsThisWeek, 0);
  const totalGoalsThisWeek = habits.reduce((sum, habit) => sum + habit.goalPerWeek, 0);
  const completionRate = totalGoalsThisWeek > 0 
    ? Math.round((totalCompletionsThisWeek / totalGoalsThisWeek) * 100) 
    : 0;
  
  // Calculate weekly progress data
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
  
  // Find the best day (day with most completions)
  const bestDay = progressData.reduce((best, current) => 
    current.completed > best.completed ? current : best, 
    progressData[0] || { day: 'None', completed: 0 });
  
  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto"
      >
        <h1 className="text-3xl font-bold mb-6">Your Progress</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Progress Overview</CardTitle>
              <StreakCounter streak={longestStreak} />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                You're making great progress! Keep up the good work.
              </p>
              <div className="h-[300px]">
                <ProgressChart data={progressData} />
              </div>
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Habit Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-5xl font-bold mb-2">{completionRate}%</div>
                  <p className="text-sm text-muted-foreground">Weekly completion rate</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Weekly Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Total habits:</span>
                    <span className="font-medium">{habits.length}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Completed:</span>
                    <span className="font-medium">{totalCompletionsThisWeek}/{totalGoalsThisWeek}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Best day:</span>
                    <span className="font-medium">{bestDay?.day || 'None'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Current streak:</span>
                    <span className="font-medium">{longestStreak} days</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default ProgressPage;
