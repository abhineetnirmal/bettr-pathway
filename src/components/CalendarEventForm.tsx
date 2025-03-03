
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarEvent } from '@/pages/Calendar';
import { X } from 'lucide-react';

interface CalendarEventFormProps {
  onSubmit: (event: CalendarEvent) => void;
  onCancel: () => void;
  selectedDate?: Date | undefined;
}

const CalendarEventForm: React.FC<CalendarEventFormProps> = ({ 
  onSubmit, 
  onCancel,
  selectedDate 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [color, setColor] = useState('#3b82f6'); // Default blue
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a title for the event');
      return;
    }
    
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: title.trim(),
      date: selectedDate || new Date(),
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      description: description.trim() || undefined,
      color: color
    };
    
    onSubmit(newEvent);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md relative">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCancel}
          className="absolute right-2 top-2"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <CardHeader>
          <CardTitle>Add Calendar Event</CardTitle>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Event title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                disabled
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Event description (optional)"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex items-center gap-2">
                <input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 p-0 border-0"
                />
                <span className="text-sm text-gray-500">Choose event color</span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Add Event</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CalendarEventForm;
