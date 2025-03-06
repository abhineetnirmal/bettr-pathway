import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from "@/components/ui/calendar";
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HabitsContext } from './Index';
import { Button } from '@/components/ui/button';
import { CalendarPlus, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import CalendarEventForm from '@/components/CalendarEventForm';
import CalendarFeedSync from '@/components/CalendarFeedSync';
import CalendarEventList from '@/components/CalendarEventList';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  description?: string;
  color: string;
  isHabit?: boolean;
  completed?: boolean;
}

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { habits, toggleHabitCompletion, loading: habitsLoading } = useContext(HabitsContext);
  const [showEventForm, setShowEventForm] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .order('date', { ascending: true });
          
        if (error) throw error;
        
        const calendarEvents = data.map(event => ({
          id: event.id,
          title: event.title,
          date: new Date(event.date),
          startTime: event.start_time,
          endTime: event.end_time,
          description: event.description,
          color: event.color
        }));
        
        setEvents(calendarEvents);
      } catch (error) {
        console.error('Error fetching calendar events:', error);
        toast({
          title: "Error",
          description: "Failed to load calendar events. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [user, toast]);
  
  const getHabitEventsForCalendar = () => {
    if (habitsLoading || !habits || habits.length === 0) return [];
    
    const habitEvents: CalendarEvent[] = [];
    
    habits.forEach(habit => {
      const completions = habit.completionHistory || [];
      
      completions.forEach(completion => {
        if (!completion.date) return;
        
        const completionDate = new Date(completion.date);
        
        const habitEvent: CalendarEvent = {
          id: `habit-${habit.id}-${completion.date}`,
          title: habit.title,
          date: completionDate,
          description: `Completed habit: ${habit.title}`,
          color: getHabitColor(habit.category),
          isHabit: true,
          completed: true
        };
        
        habitEvents.push(habitEvent);
      });
      
      if (habit.frequency && habit.frequency.length > 0) {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        for (let day = new Date(startOfMonth); day <= endOfMonth; day.setDate(day.getDate() + 1)) {
          const dayOfWeek = day.getDay();
          
          if (habit.frequency.includes(dayOfWeek)) {
            const dateStr = format(day, 'yyyy-MM-dd');
            
            const alreadyCompleted = habit.completionHistory.some(
              h => h.date === dateStr && h.completed
            );
            
            const scheduledEvent: CalendarEvent = {
              id: `habit-${habit.id}-${dateStr}`,
              title: habit.title,
              date: new Date(day),
              description: alreadyCompleted ? `Completed habit: ${habit.title}` : `Scheduled habit: ${habit.title}`,
              color: getHabitColor(habit.category),
              isHabit: true,
              completed: alreadyCompleted
            };
            
            habitEvents.push(scheduledEvent);
          }
        }
      }
    });
    
    return habitEvents;
  };
  
  const getHabitColor = (category: string): string => {
    switch (category) {
      case 'learning':
        return '#3b82f6';
      case 'mindfulness':
        return '#8b5cf6';
      case 'fitness':
        return '#ec4899';
      case 'health':
        return '#10b981';
      case 'creativity':
        return '#f97316';
      case 'productivity':
        return '#6366f1';
      case 'sleep':
        return '#3b82f6';
      case 'work':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };
  
  const allHabitEvents = getHabitEventsForCalendar();
  
  const eventsForSelectedDay = [...events, ...allHabitEvents].filter(event => 
    date && event.date && 
    new Date(event.date).toDateString() === date.toDateString()
  );
  
  const handleAddEvent = async (event: CalendarEvent) => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          title: event.title,
          date: format(event.date, 'yyyy-MM-dd'),
          start_time: event.startTime,
          end_time: event.endTime,
          description: event.description,
          color: event.color,
          user_id: user!.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      const newEvent: CalendarEvent = {
        ...event,
        id: data.id
      };
      
      setEvents([...events, newEvent]);
      setShowEventForm(false);
      
      toast({
        title: "Event Added",
        description: `"${event.title}" has been added to your calendar.`
      });
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: "Error",
        description: "Failed to add event. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteEvent = async (eventId: string) => {
    if (eventId.startsWith('habit-')) {
      toast({
        title: "Cannot Delete Habit",
        description: "This is a recurring habit. Edit it from the habits screen."
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);
        
      if (error) throw error;
      
      const newEvents = events.filter(event => event.id !== eventId);
      setEvents(newEvents);
      
      toast({
        title: "Event Deleted",
        description: "The event has been removed from your calendar."
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleToggleHabit = (habitId: string, eventDate: Date, completed: boolean) => {
    const parts = habitId.split('-');
    if (parts.length >= 2) {
      const actualHabitId = parts[1];
      toggleHabitCompletion(actualHabitId, eventDate);
      
      toast({
        title: completed ? "Habit Completed" : "Habit Marked Incomplete",
        description: `Your habit has been marked as ${completed ? 'completed' : 'incomplete'} for this day.`
      });
    }
  };
  
  const handleImportEvents = async (url: string, importedEvents: CalendarEvent[]) => {
    try {
      const eventsToInsert = importedEvents.map(event => ({
        title: event.title,
        date: format(new Date(event.date), 'yyyy-MM-dd'),
        start_time: event.startTime,
        end_time: event.endTime,
        description: event.description,
        color: event.color,
        user_id: user!.id
      }));
      
      const { data, error } = await supabase
        .from('calendar_events')
        .insert(eventsToInsert)
        .select();
        
      if (error) throw error;
      
      const newEvents = data.map(event => ({
        id: event.id,
        title: event.title,
        date: new Date(event.date),
        startTime: event.start_time,
        endTime: event.end_time,
        description: event.description,
        color: event.color
      }));
      
      setEvents([...events, ...newEvents]);
      
      toast({
        title: "Calendar Synced",
        description: `Successfully imported ${newEvents.length} events from feed.`
      });
    } catch (error) {
      console.error('Error importing events:', error);
      toast({
        title: "Error",
        description: "Failed to import events. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Your Calendar</h1>
          <div className="flex space-x-2">
            <Button 
              variant="default" 
              onClick={() => setShowEventForm(true)}
              className="flex items-center"
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="sync">Sync Calendars</TabsTrigger>
          </TabsList>
          <TabsContent value="schedule">
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
                  {loading || habitsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="animate-spin h-8 w-8 text-bettr-blue" />
                    </div>
                  ) : date ? (
                    <div className="space-y-4">
                      <p className="text-lg font-medium">
                        {date.toLocaleDateString('en-US', { 
                          weekday: 'long',
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      
                      <div className="space-y-3">
                        <p className="text-sm text-gray-500 font-medium">Events and Habits:</p>
                        {eventsForSelectedDay.length > 0 ? (
                          <CalendarEventList 
                            events={eventsForSelectedDay} 
                            onDelete={handleDeleteEvent}
                            onToggleHabit={handleToggleHabit}
                          />
                        ) : (
                          <div className="text-center py-6 text-sm text-muted-foreground dark:text-gray-400">
                            <p>No events or habits scheduled for this day.</p>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => setShowEventForm(true)} 
                              className="mt-2"
                            >
                              <CalendarPlus className="mr-2 h-3 w-3" />
                              Add event
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Select a date to view your habits</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="sync">
            <Card>
              <CardHeader>
                <CardTitle>Sync External Calendars</CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarFeedSync onImport={handleImportEvents} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {showEventForm && (
          <CalendarEventForm 
            onSubmit={handleAddEvent} 
            onCancel={() => setShowEventForm(false)}
            selectedDate={date}
          />
        )}
      </motion.div>
    </MainLayout>
  );
};

export default CalendarPage;
