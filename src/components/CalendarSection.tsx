
import React, { useState, useContext } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HabitsContext } from '@/pages/Index';
import { Button } from '@/components/ui/button';
import { CalendarPlus, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import CalendarEventForm from '@/components/CalendarEventForm';
import CalendarFeedSync from '@/components/CalendarFeedSync';
import CalendarEventList from '@/components/CalendarEventList';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import useCalendarEvents from '@/hooks/useCalendarEvents';

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

const CalendarSection = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { habits, toggleHabitCompletion, loading: habitsLoading } = useContext(HabitsContext);
  const [showEventForm, setShowEventForm] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');
  const { toast } = useToast();
  const { user } = useAuth();

  // Use our custom hook to fetch and manage calendar events
  const { 
    events, 
    loading, 
    addEvent, 
    deleteEvent, 
    importEvents, 
    getHabitEventsForCalendar 
  } = useCalendarEvents();
  
  // Get all events including habit events
  const allHabitEvents = getHabitEventsForCalendar(habits, habitsLoading);
  
  // Filter events for the selected day
  const eventsForSelectedDay = [...events, ...allHabitEvents].filter(event => 
    date && event.date && 
    new Date(event.date).toDateString() === date.toDateString()
  );
  
  // Handle adding a new event
  const handleAddEvent = async (event: CalendarEvent) => {
    try {
      await addEvent(event);
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
  
  // Handle deleting an event
  const handleDeleteEvent = async (eventId: string) => {
    if (eventId.startsWith('habit-')) {
      toast({
        title: "Cannot Delete Habit",
        description: "This is a recurring habit. Edit it from the habits screen."
      });
      return;
    }
    
    try {
      await deleteEvent(eventId);
      
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
  
  // Handle toggling a habit's completion status
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
  
  // Handle importing events from external calendar
  const handleImportEvents = async (url: string, importedEvents: CalendarEvent[]) => {
    try {
      await importEvents(url, importedEvents);
      
      toast({
        title: "Calendar Synced",
        description: `Successfully imported ${importedEvents.length} events from feed.`
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
    <div className="mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold dark:text-white">Your Calendar</h2>
        <Button 
          variant="default" 
          onClick={() => setShowEventForm(true)}
          className="flex items-center"
        >
          <CalendarPlus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
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
                <CardTitle className="dark:text-white">Habit Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">Daily Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {loading || habitsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin h-8 w-8 text-bettr-blue" />
                  </div>
                ) : date ? (
                  <div className="space-y-4">
                    <p className="text-lg font-medium dark:text-white">
                      {date.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500 dark:text-gray-300 font-medium">Events and Habits:</p>
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
                  <p className="text-gray-500 dark:text-gray-400">Select a date to view your habits</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle className="dark:text-white">Sync External Calendars</CardTitle>
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
    </div>
  );
};

export default CalendarSection;
