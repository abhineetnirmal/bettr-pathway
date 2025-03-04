
import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from "@/components/ui/calendar";
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HabitsContext } from './Index';
import { Button } from '@/components/ui/button';
import { CalendarPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import CalendarEventForm from '@/components/CalendarEventForm';
import CalendarFeedSync from '@/components/CalendarFeedSync';
import CalendarEventList from '@/components/CalendarEventList';
import { format, parseISO } from 'date-fns';

// Define event type
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
  const { habits, toggleHabitCompletion } = useContext(HabitsContext);
  const [showEventForm, setShowEventForm] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  // Load events from localStorage when component mounts
  useEffect(() => {
    const storedEvents = localStorage.getItem('calendarEvents');
    if (storedEvents) {
      try {
        // Parse stored events and convert date strings back to Date objects
        const parsedEvents = JSON.parse(storedEvents);
        const eventsWithDateObjects = parsedEvents.map((event: any) => ({
          ...event,
          date: new Date(event.date)
        }));
        setEvents(eventsWithDateObjects);
      } catch (error) {
        console.error('Error parsing stored events:', error);
        // If there's an error parsing, start with empty events
        setEvents([]);
      }
    }
  }, []);
  
  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);
  
  // Transform habits into calendar events based on their frequency
  const getHabitEventsForCalendar = () => {
    const habitEvents: CalendarEvent[] = [];
    
    habits.forEach(habit => {
      // Get the current date and the date 28 days from now (4 weeks)
      const currentDate = new Date();
      const maxDate = new Date();
      maxDate.setDate(currentDate.getDate() + 28);
      
      // Start from yesterday to ensure we include any habits for today
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      
      // Create a habit event for each occurrence in the next 4 weeks
      let loopDate = new Date(startDate);
      
      while (loopDate <= maxDate) {
        const dayOfWeek = loopDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // If this habit is scheduled for this day of the week
        if (habit.frequency.includes(dayOfWeek)) {
          const dateStr = format(loopDate, 'yyyy-MM-dd');
          
          // Check if this habit is completed for this date
          const completionEntry = habit.completionHistory.find(h => h.date === dateStr);
          const isCompleted = completionEntry ? completionEntry.completed : false;
          
          // Create a calendar event for this habit
          const habitEvent: CalendarEvent = {
            id: `habit-${habit.id}-${dateStr}`,
            title: habit.title,
            date: new Date(loopDate),
            description: `Regular habit: ${habit.title}`,
            color: getHabitColor(habit.category),
            isHabit: true,
            completed: isCompleted
          };
          
          habitEvents.push(habitEvent);
        }
        
        // Move to the next day
        loopDate.setDate(loopDate.getDate() + 1);
      }
    });
    
    return habitEvents;
  };
  
  // Helper function to get color based on habit category
  const getHabitColor = (category: string): string => {
    switch (category) {
      case 'learning':
        return '#3b82f6'; // blue
      case 'mindfulness':
        return '#8b5cf6'; // purple
      case 'fitness':
        return '#ec4899'; // pink
      case 'health':
        return '#10b981'; // green
      case 'creativity':
        return '#f97316'; // orange
      case 'productivity':
        return '#6366f1'; // indigo
      default:
        return '#6b7280'; // gray
    }
  };
  
  // Get day of week for the selected date (0 = Sunday, 6 = Saturday)
  const selectedDayOfWeek = date ? date.getDay() : new Date().getDay();
  
  // Filter habits scheduled for the selected day
  const habitsForSelectedDay = habits.filter(habit => 
    habit.frequency.includes(selectedDayOfWeek)
  );
  
  // Combine regular events with habit events for the selected day
  const allHabitEvents = getHabitEventsForCalendar();
  
  // Filter all events (including habits) for selected day
  const eventsForSelectedDay = [...events, ...allHabitEvents].filter(event => 
    date && event.date && 
    new Date(event.date).toDateString() === date.toDateString()
  );
  
  // Add new event
  const handleAddEvent = (event: CalendarEvent) => {
    const newEvents = [...events, event];
    setEvents(newEvents);
    setShowEventForm(false);
    toast({
      title: "Event Added",
      description: `"${event.title}" has been added to your calendar.`
    });
  };
  
  // Delete an event
  const handleDeleteEvent = (eventId: string) => {
    // Only delete regular events, not habit events
    if (eventId.startsWith('habit-')) {
      toast({
        title: "Cannot Delete Habit",
        description: "This is a recurring habit. Edit it from the habits screen."
      });
      return;
    }
    
    const newEvents = events.filter(event => event.id !== eventId);
    setEvents(newEvents);
    toast({
      title: "Event Deleted",
      description: "The event has been removed from your calendar."
    });
  };
  
  // Toggle habit completion
  const handleToggleHabit = (habitId: string, eventDate: Date, completed: boolean) => {
    // Call the context function to update the habit
    toggleHabitCompletion(habitId, eventDate);
    
    toast({
      title: completed ? "Habit Completed" : "Habit Marked Incomplete",
      description: `Your habit has been marked as ${completed ? 'completed' : 'incomplete'} for this day.`
    });
  };
  
  // Import events from URL
  const handleImportEvents = (url: string, importedEvents: CalendarEvent[]) => {
    // Convert dates in imported events to Date objects
    const eventsWithDateObjects = importedEvents.map(event => ({
      ...event,
      date: new Date(event.date)
    }));
    
    // Merge with existing events, avoiding duplicates by ID
    const existingIds = new Set(events.map(event => event.id));
    const uniqueNewEvents = eventsWithDateObjects.filter(event => !existingIds.has(event.id));
    
    const newEvents = [...events, ...uniqueNewEvents];
    setEvents(newEvents);
    
    toast({
      title: "Calendar Synced",
      description: `Successfully imported ${uniqueNewEvents.length} events from feed.`
    });
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
                      
                      {/* Events section */}
                      <div className="space-y-3">
                        <p className="text-sm text-gray-500 font-medium">Events and Habits:</p>
                        <CalendarEventList 
                          events={eventsForSelectedDay} 
                          onDelete={handleDeleteEvent}
                          onToggleHabit={handleToggleHabit}
                        />
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
