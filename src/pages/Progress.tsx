
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProgressChart from '@/components/ProgressChart';
import StreakCounter from '@/components/StreakCounter';
import { HabitsContext } from './Index';

const ProgressPage = () => {
  const { habits } = useContext(HabitsContext);
  
  // Calculate the longest streak from all habits
  const longestStreak = Math.max(...habits.map(habit => habit.streak), 0);
  
  // Calculate weekly completion rate
  const totalCompletionsThisWeek = habits.reduce((sum, habit) => sum + habit.completionsThisWeek, 0);
  const totalGoalsThisWeek = habits.reduce((sum, habit) => sum + habit.goalPerWeek, 0);
  const completionRate = totalGoalsThisWeek > 0 
    ? Math.round((totalCompletionsThisWeek / totalGoalsThisWeek) * 100) 
    : 0;
  
  // Sample data for the progress chart - in a real app, this would be calculated from habit completions
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const progressData = daysOfWeek.map(day => {
    // This is mock data - in a real app, you would calculate actual completions per day
    const randomCompletions = Math.floor(Math.random() * 5) + 1;
    return { day, completed: randomCompletions };
  });
  
  // Find the best day (day with most completions)
  const bestDay = progressData.reduce((best, current) => 
    current.completed > best.completed ? current : best, progressData[0]);
  
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
