
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { CalendarEvent } from '@/components/CalendarSection';
import { Habit, HabitCategory } from '@/pages/Index';

const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Fetch calendar events from Supabase
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [user]);
  
  // Add a new calendar event
  const addEvent = async (event: CalendarEvent) => {
    if (!user) throw new Error("User must be logged in");
    
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        title: event.title,
        date: format(event.date, 'yyyy-MM-dd'),
        start_time: event.startTime,
        end_time: event.endTime,
        description: event.description,
        color: event.color,
        user_id: user.id
      })
      .select()
      .single();
      
    if (error) throw error;
    
    const newEvent: CalendarEvent = {
      ...event,
      id: data.id
    };
    
    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  };
  
  // Delete a calendar event
  const deleteEvent = async (eventId: string) => {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId);
      
    if (error) throw error;
    
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };
  
  // Import events from external calendar
  const importEvents = async (url: string, importedEvents: CalendarEvent[]) => {
    if (!user) throw new Error("User must be logged in");
    
    const eventsToInsert = importedEvents.map(event => ({
      title: event.title,
      date: format(new Date(event.date), 'yyyy-MM-dd'),
      start_time: event.startTime,
      end_time: event.endTime,
      description: event.description,
      color: event.color,
      user_id: user.id
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
    
    setEvents(prev => [...prev, ...newEvents]);
    return newEvents;
  };
  
  // Convert habits into calendar events
  const getHabitEventsForCalendar = (habits: Habit[], habitsLoading: boolean) => {
    if (habitsLoading || !habits || habits.length === 0) return [];
    
    const habitEvents: CalendarEvent[] = [];
    
    habits.forEach(habit => {
      const completions = habit.completionHistory || [];
      
      // Add completed habits
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
      
      // Add scheduled habits based on frequency
      if (habit.frequency && habit.frequency.length > 0) {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        for (let day = new Date(startOfMonth); day <= endOfMonth; day.setDate(day.getDate() + 1)) {
          const dayOfWeek = day.getDay();
          
          if (habit.frequency.includes(dayOfWeek)) {
            const dateStr = format(day, 'yyyy-MM-dd');
            
            const alreadyCompleted = completions.some(
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
  
  // Helper function to get color based on habit category
  const getHabitColor = (category: HabitCategory): string => {
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
  
  return {
    events,
    loading,
    addEvent,
    deleteEvent,
    importEvents,
    getHabitEventsForCalendar
  };
};

export default useCalendarEvents;
