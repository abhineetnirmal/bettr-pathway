
import React, { useContext, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ChevronLeft, Calendar, CheckCircle, Edit, X, Flame, BarChart3 } from 'lucide-react';
import { HabitsContext } from './Index';
import MainLayout from '@/layouts/MainLayout';
import StreakCounter from '@/components/StreakCounter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HabitForm from '@/components/HabitForm';

// Import all the icons used
import { Book, Brain, Dumbbell, Heart, Music, Coffee } from 'lucide-react';

const HabitDetail = () => {
  const { habitId } = useParams();
  const { habits, toggleHabitCompletion } = useContext(HabitsContext);
  const [showEditForm, setShowEditForm] = useState(false);
  const navigate = useNavigate();
  
  const habit = habits.find(h => h.id === habitId);
  
  if (!habit) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Habit not found</h1>
          <p className="mb-6">The habit you're looking for doesn't exist.</p>
          <Link to="/" className="btn-primary">Go back to habits</Link>
        </div>
      </MainLayout>
    );
  }

  const categoryColors = {
    learning: 'text-blue-500 bg-blue-100',
    mindfulness: 'text-purple-500 bg-purple-100',
    fitness: 'text-pink-500 bg-pink-100',
    health: 'text-green-500 bg-green-100',
    creativity: 'text-orange-500 bg-orange-100',
    productivity: 'text-indigo-500 bg-indigo-100'
  };
  
  const categoryIcons = {
    learning: <Book className={`text-blue-500`} size={20} />,
    mindfulness: <Brain className={`text-purple-500`} size={20} />,
    fitness: <Dumbbell className={`text-pink-500`} size={20} />,
    health: <Heart className={`text-green-500`} size={20} />,
    creativity: <Music className={`text-orange-500`} size={20} />,
    productivity: <Coffee className={`text-indigo-500`} size={20} />
  };
  
  // Generate the monthly calendar
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const dayOfWeekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Check if a date has a completion
  const isDateCompleted = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return habit.completionHistory.some(h => h.date === dateStr && h.completed);
  };
  
  // Get history stats
  const completedDaysThisMonth = days.filter(day => isDateCompleted(day)).length;
  const totalDaysThisMonth = days.length;
  const completionRateThisMonth = Math.round((completedDaysThisMonth / totalDaysThisMonth) * 100);
  
  // Handle day click
  const handleDayClick = (date: Date) => {
    toggleHabitCompletion(habit.id, date);
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto"
      >
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="mr-3 p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold">{habit.title}</h1>
          <button 
            onClick={() => setShowEditForm(true)}
            className="ml-auto p-2 rounded-full hover:bg-gray-100"
          >
            <Edit size={20} />
          </button>
        </div>
        
        <div className="grid gap-6">
          {/* Habit details card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${categoryColors[habit.category]}`}>
                  {categoryIcons[habit.category]}
                </div>
                <CardTitle>{habit.title}</CardTitle>
              </div>
              <StreakCounter streak={habit.streak} />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <Flame className="text-orange-500 mb-2" size={24} />
                  <p className="text-2xl font-bold">{habit.streak}</p>
                  <p className="text-sm text-gray-500">Current Streak</p>
                </div>
                
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <CheckCircle className="text-green-500 mb-2" size={24} />
                  <p className="text-2xl font-bold">{habit.totalCompletions}</p>
                  <p className="text-sm text-gray-500">Total Completions</p>
                </div>
                
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <BarChart3 className="text-blue-500 mb-2" size={24} />
                  <p className="text-2xl font-bold">{habit.completionsThisWeek}/{habit.goalPerWeek}</p>
                  <p className="text-sm text-gray-500">This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Calendar view */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2" size={20} />
                  {format(today, 'MMMM yyyy')}
                </CardTitle>
                <div className="text-sm text-gray-500">
                  {completedDaysThisMonth}/{totalDaysThisMonth} days ({completionRateThisMonth}%)
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day of week headers */}
              <div className="grid grid-cols-7 mb-2">
                {dayOfWeekNames.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for the first day of the month */}
                {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                  <div key={`empty-${index}`} className="h-10 rounded-md"></div>
                ))}
                
                {/* Day cells */}
                {days.map(day => {
                  const isCompleted = isDateCompleted(day);
                  const isToday = isSameDay(day, today);
                  
                  return (
                    <motion.button
                      key={day.toString()}
                      className={`h-10 rounded-md flex items-center justify-center relative ${
                        isToday ? 'ring-2 ring-bettr-blue ring-opacity-50' : ''
                      }`}
                      onClick={() => handleDayClick(day)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className={`text-sm ${isCompleted ? 'font-bold' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      {isCompleted && (
                        <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded-md flex items-center justify-center">
                          <CheckCircle size={18} className="text-green-500" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Completion history */}
          <Card>
            <CardHeader>
              <CardTitle>Completion History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {habit.completionHistory
                  .filter(entry => entry.completed)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(entry => {
                    const date = parse(entry.date, 'yyyy-MM-dd', new Date());
                    return (
                      <div key={entry.date} className="flex items-center py-2 border-b">
                        <CheckCircle className="text-green-500 mr-3" size={18} />
                        <span>{format(date, 'EEEE, MMMM d, yyyy')}</span>
                      </div>
                    );
                  })}
                  
                {habit.completionHistory.filter(entry => entry.completed).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <X className="mx-auto mb-2" size={24} />
                    <p>No completions recorded yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
      
      {/* Edit Form Modal */}
      <AnimatePresence>
        {showEditForm && (
          <HabitForm 
            onClose={() => setShowEditForm(false)}
            onSave={(updatedHabit) => {
              // This would need to be updated in the Index context
              setShowEditForm(false);
            }}
            initialHabit={habit}
          />
        )}
      </AnimatePresence>
    </MainLayout>
  );
};

export default HabitDetail;
