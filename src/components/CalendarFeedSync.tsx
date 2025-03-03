
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Download } from 'lucide-react';
import { CalendarEvent } from '@/pages/Calendar';
import { useToast } from '@/hooks/use-toast';

interface CalendarFeedSyncProps {
  onImport: (url: string, events: CalendarEvent[]) => void;
}

const CalendarFeedSync: React.FC<CalendarFeedSyncProps> = ({ onImport }) => {
  const [feedUrl, setFeedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Function to simulate parsing events from an external feed
  const simulateParseEvents = (url: string): Promise<CalendarEvent[]> => {
    return new Promise((resolve) => {
      // In a real app, this would fetch and parse ical/ics data
      setTimeout(() => {
        // Generate mock events based on the URL
        const mockEvents: CalendarEvent[] = Array.from({ length: 5 }).map((_, index) => {
          const date = new Date();
          date.setDate(date.getDate() + index);
          
          return {
            id: `import-${Date.now()}-${index}`,
            title: `Imported Event ${index + 1}`,
            date: date,
            description: `Imported from ${url}`,
            startTime: '09:00',
            endTime: '10:00',
            color: '#4f46e5' // Indigo
          };
        });
        
        resolve(mockEvents);
      }, 1500); // Simulate network delay
    });
  };

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a calendar feed URL",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // This would normally validate the URL format
      if (!feedUrl.startsWith('http')) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid calendar feed URL",
          variant: "destructive"
        });
        return;
      }
      
      // In a real app, this would fetch and parse the feed
      const importedEvents = await simulateParseEvents(feedUrl);
      
      onImport(feedUrl, importedEvents);
      
      // Add the URL to saved feeds
      const savedFeeds = JSON.parse(localStorage.getItem('calendarFeeds') || '[]');
      if (!savedFeeds.includes(feedUrl)) {
        localStorage.setItem('calendarFeeds', JSON.stringify([...savedFeeds, feedUrl]));
      }
      
    } catch (error) {
      console.error('Failed to sync calendar:', error);
      toast({
        title: "Sync Failed",
        description: "Could not sync with the provided feed URL. Please check the URL and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved feeds from localStorage
  const savedFeeds = JSON.parse(localStorage.getItem('calendarFeeds') || '[]');

  return (
    <div className="space-y-6">
      <div>
        <form onSubmit={handleSync} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedUrl">Calendar Feed URL (iCal/ICS)</Label>
            <div className="flex gap-2">
              <Input
                id="feedUrl"
                value={feedUrl}
                onChange={(e) => setFeedUrl(e.target.value)}
                placeholder="https://example.com/calendar.ics"
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !feedUrl.trim()}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Sync
              </Button>
            </div>
          </div>
        </form>
        <p className="text-sm text-gray-500 mt-2">
          Add an external calendar feed URL to import events. Supports iCal and ICS formats.
        </p>
      </div>

      {savedFeeds.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Saved Feeds</h3>
          <ul className="space-y-2">
            {savedFeeds.map((feed: string, index: number) => (
              <li key={index} className="text-sm flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="truncate flex-1">{feed}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setFeedUrl(feed);
                  }}
                >
                  Use
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Note About Calendar Sync</h3>
        <p className="text-sm text-gray-600">
          In this demo, calendar synchronization is simulated. In a production 
          environment, you would implement actual iCal/ICS parsing and 
          synchronization. The demo generates placeholder events to demonstrate the UI.
        </p>
      </div>
    </div>
  );
};

export default CalendarFeedSync;
