
import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from "@/components/ui/calendar";
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HabitsContext } from './Index';
import { format } from 'date-fns';

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { habits } = useContext(HabitsContext);
  
  // Get day of week for the selected date (0 = Sunday, 6 = Saturday)
  const selectedDayOfWeek = date ? date.getDay() : new Date().getDay();
  
  // Filter habits scheduled for the selected day
  const habitsForSelectedDay = habits.filter(habit => 
    habit.frequency.includes(selectedDayOfWeek)
  );
  
  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto"
      >
        <h1 className="text-3xl font-bold mb-6">Your Calendar</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Habit Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Daily Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {date ? (
                <div className="space-y-4">
                  <p className="text-lg font-medium">
                    {date.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  
                  {habitsForSelectedDay.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500 font-medium">Scheduled habits:</p>
                      <ul className="space-y-2">
                        {habitsForSelectedDay.map(habit => (
                          <li key={habit.id} className="flex items-center p-2 bg-gray-50 rounded-lg">
                            <div className={`w-3 h-3 rounded-full mr-3 bg-${habit.category === 'fitness' ? 'pink' : habit.category === 'mindfulness' ? 'purple' : habit.category === 'learning' ? 'blue' : 'green'}-500`}></div>
                            <span>{habit.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">No habits scheduled for this day yet.</p>
                      <p className="text-sm text-gray-500">Add habits from the home screen to see them here.</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Select a date to view your habits</p>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default CalendarPage;
