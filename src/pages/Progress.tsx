
import React from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProgressChart from '@/components/ProgressChart';
import StreakCounter from '@/components/StreakCounter';

const ProgressPage = () => {
  // Mock data - in a real app, this would come from a database
  const mockStreak = 7;
  
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
              <StreakCounter streak={mockStreak} />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                You're making great progress! Keep up the good work.
              </p>
              <div className="h-[300px]">
                <ProgressChart />
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
                  <div className="text-5xl font-bold mb-2">85%</div>
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
                    <span className="font-medium">5</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Completed:</span>
                    <span className="font-medium">21/25</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Best day:</span>
                    <span className="font-medium">Wednesday</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Current streak:</span>
                    <span className="font-medium">{mockStreak} days</span>
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
