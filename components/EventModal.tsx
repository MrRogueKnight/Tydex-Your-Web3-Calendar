'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, Calendar, Clock, Tag, Trash2, Copy, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { toast } from 'sonner';
import { EventType, type Event, type EventModalProps } from '@/lib/types';

export function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  selectedDate
}: EventModalProps): JSX.Element {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: format(selectedDate, 'yyyy-MM-dd'),
    time: '',
    type: EventType.CUSTOM,
    isPrivate: false,
    recurrence: '',
    tags: [] as string[],
  });

  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form with event data or defaults
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: format(new Date(event.date), 'yyyy-MM-dd'),
        time: event.time || '',
        type: event.type || EventType.CUSTOM,
        isPrivate: event.isPrivate || false,
        recurrence: event.recurrence || '',
        tags: event.tags || [],
      });
    } else {
      // Reset form for new event
      setFormData({
        title: '',
        description: '',
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: '',
        type: EventType.CUSTOM,
        isPrivate: false,
        recurrence: '',
        tags: [],
      });
    }
  }, [event, selectedDate, isOpen]);

  const handleSave = async (): Promise<void> => {
    try {
      if (!formData.title.trim()) {
        toast.error('Event title is required');
        return;
      }

      setIsLoading(true);

      const eventData: Partial<Event> = {
        ...formData,
        date: new Date(formData.date),
        id: event?.id,
      };

      await onSave(eventData);
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!event?.id) return;

    try {
      setIsLoading(true);
      await onDelete(event.id);
      onClose();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = (): void => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string): void => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const copyEventDetails = (): void => {
    const details = `
Event: ${formData.title}
Date: ${formData.date}
Time: ${formData.time || 'All day'}
Type: ${formData.type}
${formData.description ? `Description: ${formData.description}` : ''}
${formData.tags.length > 0 ? `Tags: ${formData.tags.join(', ')}` : ''}
    `.trim();

    navigator.clipboard.writeText(details);
    toast.success('Event details copied to clipboard');
  };

  const eventTypeOptions = [
    { value: EventType.CUSTOM, label: '📝 Custom', color: 'bg-green-100 text-green-800' },
    { value: EventType.MEETING, label: '📅 Meeting', color: 'bg-blue-100 text-blue-800' },
    { value: EventType.BIRTHDAY, label: '🎂 Birthday', color: 'bg-pink-100 text-pink-800' },
    { value: EventType.REMINDER, label: '⏰ Reminder', color: 'bg-yellow-100 text-yellow-800' },
  ];

  const recurrenceOptions = [
    { value: '', label: 'No repeat' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'weekdays', label: 'Weekdays (Mon-Fri)' },
    { value: 'weekends', label: 'Weekends (Sat-Sun)' },
  ];

  const reminderOptions = [
    { value: '', label: 'No reminder' },
    { value: '5min', label: '5 minutes before' },
    { value: '15min', label: '15 minutes before' },
    { value: '30min', label: '30 minutes before' },
    { value: '1hour', label: '1 hour before' },
    { value: '2hours', label: '2 hours before' },
    { value: '1day', label: '1 day before' },
    { value: '2days', label: '2 days before' },
    { value: '1week', label: '1 week before' },
  ];

  const colorOptions = [
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'yellow', label: 'Yellow', color: 'bg-yellow-500' },
    { value: 'red', label: 'Red', color: 'bg-red-500' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
    { value: 'cyan', label: 'Cyan', color: 'bg-cyan-500' },
    { value: 'lime', label: 'Lime', color: 'bg-lime-500' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="event-modal max-w-2xl">
        <DialogHeader className="event-modal-header">
          <DialogTitle className="flex items-center justify-between">
            <span>{event ? 'Edit Event' : 'Create New Event'}</span>
            <div className="flex items-center space-x-2">
              {event && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={copyEventDetails}
                className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            {event ? 'Update your event details' : 'Add a new event to your calendar'}
          </DialogDescription>
        </DialogHeader>

        <div className="event-modal-content">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter event title..."
                  className="text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Event Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: EventType) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className={`px-2 py-1 rounded text-xs ${option.color}`}>
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="allday"
                  checked={!formData.time}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, time: checked ? '' : '09:00' }))
                  }
                />
                <Label htmlFor="allday">All-day event</Label>
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add event description..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Add location or meeting link..."
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} variant="outline" size="sm">
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeTag(tag)}
                      >
                        {tag} <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recurrence">Repeat</Label>
                <Select
                  value={formData.recurrence}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, recurrence: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recurrence" />
                  </SelectTrigger>
                  <SelectContent>
                    {recurrenceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder">Reminder</Label>
                <Select defaultValue="">
                  <SelectTrigger>
                    <SelectValue placeholder="Set reminder" />
                  </SelectTrigger>
                  <SelectContent>
                    {reminderOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="private"
                  checked={formData.isPrivate}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isPrivate: checked }))
                  }
                />
                <Label htmlFor="private">Private event</Label>
              </div>

              <div className="space-y-2">
                <Label>Event Color</Label>
                <div className="flex space-x-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      className={`w-8 h-8 rounded-full ${color.color} border-2 border-white shadow-sm hover:scale-110 transition-transform`}
                      title={color.label}
                      onClick={() => {
                        // Color selection logic here
                        toast.success(`Selected ${color.label} color`);
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Future Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Automatic timezone detection</li>
                  <li>• Event conflict detection</li>
                  <li>• Calendar integration with external services</li>
                  <li>• AI-powered event suggestions</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="event-modal-footer">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !formData.title.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="w-4 h-4 mr-2" />
                {event ? 'Update Event' : 'Create Event'}
              </div>
            )}
          </Button>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Delete Event</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete &quot;{formData.title}&quot;? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}