
import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import { HabitsContext, Habit } from './Index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays, addDays } from 'date-fns';
import { Trophy, Award, Target, Calendar } from 'lucide-react';

const ProgressPage = () => {
  const { habits, loading } = useContext(HabitsContext);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [completionRate, setCompletionRate] = useState<number>(0);
  const [leadingHabit, setLeadingHabit] = useState<Habit | null>(null);

  // Calculate weekly progress data
  useEffect(() => {
    if (habits.length === 0) return;

    const today = new Date();
    const firstDayOfWeek = startOfWeek(today, { weekStartsOn: 1 });
    const lastDayOfWeek = endOfWeek(today, { weekStartsOn: 1 });
    const daysOfWeek = eachDayOfInterval({ start: firstDayOfWeek, end: lastDayOfWeek });

    // Generate weekly data
    const weekly = daysOfWeek.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayName = format(day, 'EEE');

      // Count completions and targets for this day
      let completionsForDay = 0;
      let targetForDay = 0;

      habits.forEach(habit => {
        // Check if this habit should be done on this day of the week
        const dayOfWeek = day.getDay() === 0 ? 6 : day.getDay() - 1; // adjust Sunday from 0 to 6
        const shouldBeDoneToday = habit.frequency.includes(dayOfWeek);
        
        if (shouldBeDoneToday) {
          targetForDay++;
          
          // Check if it was completed
          const wasCompleted = habit.completionHistory.some(
            h => h.date === dayStr && h.completed
          );
          
          if (wasCompleted) {
            completionsForDay++;
          }
        }
      });

      return {
        day: dayName,
        date: day,
        completed: completionsForDay,
        target: targetForDay,
        rate: targetForDay > 0 ? (completionsForDay / targetForDay) * 100 : 0
      };
    });

    setWeeklyData(weekly);

    // Calculate overall completion rate for the week
    const totalCompletions = weekly.reduce((sum, day) => sum + day.completed, 0);
    const totalTargets = weekly.reduce((sum, day) => sum + day.target, 0);
    setCompletionRate(totalTargets > 0 ? (totalCompletions / totalTargets) * 100 : 0);

    // Find leading habit (most consistently completed)
    const habitCompletionRates = habits.map(habit => {
      const target = habit.goalperweek;
      const actual = habit.completionsThisWeek;
      return {
        ...habit,
        completionRate: target > 0 ? (actual / target) * 100 : 0
      };
    });

    // Sort by completion rate and get the top one
    const sortedHabits = [...habitCompletionRates].sort((a, b) => b.completionRate - a.completionRate);
    if (sortedHabits.length > 0) {
      setLeadingHabit(sortedHabits[0]);
    }

    // Calculate category data
    const categories = ['learning', 'mindfulness', 'fitness', 'health', 'creativity', 'productivity'];
    const categoryStats = categories.map(category => {
      const habitsInCategory = habits.filter(h => h.category === category);
      
      if (habitsInCategory.length === 0) {
        return { name: category, count: 0, completionsThisWeek: 0, value: 0 };
      }
      
      const totalCompletionsThisWeek = habitsInCategory.reduce(
        (sum, habit) => sum + habit.completionsThisWeek, 0
      );
      
      return {
        name: category,
        count: habitsInCategory.length,
        completionsThisWeek: totalCompletionsThisWeek,
        value: habitsInCategory.length
      };
    }).filter(cat => cat.count > 0);
    
    setCategoryData(categoryStats);
  }, [habits]);

  const getCategoryColor = (category: string) => {
    const colors = {
      learning: '#3B82F6',
      mindfulness: '#8B5CF6',
      fitness: '#EC4899',
      health: '#10B981',
      creativity: '#F59E0B',
      productivity: '#6366F1'
    };
    return colors[category as keyof typeof colors] || '#6B7280';
  };

  const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#6366F1'];

  return (
    <MainLayout>
      <motion.div 
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Progress & Insights</h1>
        <p className="text-bettr-text-secondary mb-8">Track your habit consistency and growth</p>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-bettr-blue border-t-transparent rounded-full"></div>
          </div>
        ) : habits.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-16 w-16 text-bettr-text-secondary mb-4" />
              <h3 className="text-xl font-medium mb-2">No habits yet</h3>
              <p className="text-bettr-text-secondary text-center max-w-md">
                Create your first habit to start tracking your progress and see insights here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-bettr-text-secondary mb-1">Weekly Completion Rate</p>
                      <h3 className="text-3xl font-bold">{completionRate.toFixed(0)}%</h3>
                    </div>
                    <div className="p-3 rounded-full bg-green-100">
                      <Trophy className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="h-2 bg-gray-100 rounded-full w-full">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-bettr-text-secondary mb-1">Active Habits</p>
                      <h3 className="text-3xl font-bold">{habits.length}</h3>
                    </div>
                    <div className="p-3 rounded-full bg-blue-100">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    {categoryData.slice(0, 5).map((cat, index) => (
                      <div 
                        key={index}
                        className="h-2 rounded-full flex-1"
                        style={{ backgroundColor: getCategoryColor(cat.name) }}
                      ></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-bettr-text-secondary mb-1">Leading Habit</p>
                      <h3 className="text-xl font-bold truncate max-w-[180px]">
                        {leadingHabit ? leadingHabit.title : 'None'}
                      </h3>
                    </div>
                    <div className="p-3 rounded-full bg-purple-100">
                      <Award className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  
                  {leadingHabit && (
                    <div className="mt-4">
                      <p className="text-sm text-bettr-text-secondary mb-1">
                        {leadingHabit.completionsThisWeek}/{leadingHabit.goalperweek} this week
                      </p>
                      <div className="h-2 bg-gray-100 rounded-full w-full">
                        <div 
                          className="h-full bg-purple-500 rounded-full" 
                          style={{ 
                            width: `${Math.min(100, (leadingHabit.completionsThisWeek / leadingHabit.goalperweek) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="weekly" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="weekly">Weekly Overview</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="habits">Habit Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="weekly" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Habit Completion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={weeklyData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar name="Completed" dataKey="completed" fill="#10B981" />
                          <Bar name="Target" dataKey="target" fill="#E5E7EB" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={weeklyData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis domain={[0, 100]} unit="%" />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            name="Completion Rate" 
                            dataKey="rate" 
                            stroke="#6366F1" 
                            unit="%" 
                            strokeWidth={2} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="categories" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Habits by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Completions by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={categoryData}
                            layout="vertical"
                            margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="completionsThisWeek" name="Completions This Week">
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="habits" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Habit Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {habits.map(habit => (
                        <div key={habit.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold">{habit.title}</h3>
                              <p className="text-sm text-bettr-text-secondary capitalize">
                                {habit.category} • {habit.streak} day streak
                              </p>
                            </div>
                            <div className="bg-gray-100 px-2 py-1 rounded text-sm">
                              {habit.completionsThisWeek}/{habit.goalperweek}
                            </div>
                          </div>
                          
                          <div className="w-full h-2 bg-gray-100 rounded-full">
                            <div 
                              className="h-full rounded-full" 
                              style={{ 
                                width: `${Math.min(100, (habit.completionsThisWeek / habit.goalperweek) * 100)}%`,
                                backgroundColor: getCategoryColor(habit.category)
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </motion.div>
    </MainLayout>
  );
};

export default ProgressPage;
