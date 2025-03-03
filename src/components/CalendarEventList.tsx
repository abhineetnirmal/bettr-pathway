
import React from 'react';
import { CalendarEvent } from '@/pages/Calendar';
import { Trash2, Clock, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CalendarEventListProps {
  events: CalendarEvent[];
  onDelete: (eventId: string) => void;
}

const CalendarEventList: React.FC<CalendarEventListProps> = ({ events, onDelete }) => {
  // Sort events by start time if available, and place habits at the top
  const sortedEvents = [...events].sort((a, b) => {
    // First separate habits and events
    if (a.isHabit && !b.isHabit) return -1;
    if (!a.isHabit && b.isHabit) return 1;
    
    // Then sort events by start time
    if (a.startTime && b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }
    if (a.startTime) return -1;
    if (b.startTime) return 1;
    return 0;
  });

  if (sortedEvents.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No events or habits for this day. Click "Add Event" to create one.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {sortedEvents.map(event => (
        <li 
          key={event.id} 
          className="flex items-center justify-between p-3 rounded-lg"
          style={{ backgroundColor: `${event.color}15` }}
        >
          <div className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-3" 
              style={{ backgroundColor: event.color }}
            />
            <div>
              <div className="flex items-center">
                <span className="font-medium">{event.title}</span>
                {event.isHabit && (
                  <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full flex items-center">
                    <List className="h-3 w-3 mr-1" />
                    Habit
                  </span>
                )}
              </div>
              {event.startTime && (
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}
                </span>
              )}
              {event.description && (
                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
              )}
            </div>
          </div>
          
          {!event.isHabit && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDelete(event.id)}
                    className="h-8 w-8 text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete event</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </li>
      ))}
    </ul>
  );
};

export default CalendarEventList;
