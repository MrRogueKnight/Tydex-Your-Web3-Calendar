'use client';

import { useState } from 'react';
import { format, isToday, isTomorrow, isYesterday, isPast, isFuture } from 'date-fns';
import { Search, Filter, Calendar, Clock, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getEventTypeColor, getEventTypeIcon } from '@/lib/api';
import type { EventListProps, Event, EventType } from '@/lib/types';

export function EventList({ events, onEventEdit, onEventDelete, isLoading }: EventListProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTime, setFilterTime] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  const getDateLabel = (date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  };

  const getTimeStatus = (date: Date): 'past' | 'today' | 'upcoming' => {
    if (isToday(date)) return 'today';
    if (isPast(date)) return 'past';
    return 'upcoming';
  };

  const filteredAndSortedEvents = (): Event[] => {
    let filtered = events;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.type === filterType);
    }

    // Time filter
    if (filterTime !== 'all') {
      const now = new Date();
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        switch (filterTime) {
          case 'past':
            return isPast(eventDate) && !isToday(eventDate);
          case 'today':
            return isToday(eventDate);
          case 'upcoming':
            return isFuture(eventDate) && !isToday(eventDate);
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const groupEventsByDate = (events: Event[]): Record<string, Event[]> => {
    return events.reduce((groups, event) => {
      const dateKey = format(new Date(event.date), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
      return groups;
    }, {} as Record<string, Event[]>);
  };

  const handleDeleteEvent = async (eventId: string): Promise<void> => {
    await onEventDelete(eventId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex space-x-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const filteredEvents = filteredAndSortedEvents();
  const groupedEvents = groupEventsByDate(filteredEvents);

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search events, descriptions, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{'All Types'}</SelectItem>
                <SelectItem value="BIRTHDAY">{'🎂 Birthday'}</SelectItem>
                <SelectItem value="MEETING">{'📅 Meeting'}</SelectItem>
                <SelectItem value="REMINDER">{'⏰ Reminder'}</SelectItem>
                <SelectItem value="CUSTOM">{'📝 Custom'}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterTime} onValueChange={setFilterTime}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{'All Time'}</SelectItem>
                <SelectItem value="past">{'Past Events'}</SelectItem>
                <SelectItem value="today">{'Today'}</SelectItem>
                <SelectItem value="upcoming">{'Upcoming'}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">{'Date (Oldest)'}</SelectItem>
                <SelectItem value="date-desc">{'Date (Newest)'}</SelectItem>
                <SelectItem value="title">{'Title A-Z'}</SelectItem>
                <SelectItem value="type">{'Type'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            {`Showing ${filteredEvents.length} of ${events.length} event${events.length !== 1 ? 's' : ''}`}
          </span>
          
          {(searchTerm || filterType !== 'all' || filterTime !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterTime('all');
              }}
            >
              {'Clear Filters'}
            </Button>
          )}
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mb-4" />
            <CardTitle className="text-xl mb-2">
              {searchTerm || filterType !== 'all' || filterTime !== 'all' 
                ? 'No events match your filters' 
                : 'No events yet'
              }
            </CardTitle>
            <CardDescription className="text-center max-w-md">
              {searchTerm || filterType !== 'all' || filterTime !== 'all'
                ? 'Try adjusting your search terms or filters to find more events.'
                : 'Start by creating your first event to organize your schedule.'
              }
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => {
            const eventDate = new Date(dateKey);
            const timeStatus = getTimeStatus(eventDate);
            
            return (
              <div key={dateKey} className="space-y-3">
                {/* Date Header */}
                <div className="flex items-center space-x-3">
                  <h3 className={`
                    text-lg font-semibold
                    ${timeStatus === 'today' ? 'text-blue-600 dark:text-blue-400' : ''}
                    ${timeStatus === 'past' ? 'text-gray-500 dark:text-gray-400' : ''}
                  `}>
                    {getDateLabel(eventDate)}
                  </h3>
                  <Badge 
                    variant={timeStatus === 'today' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {`${dayEvents.length} event${dayEvents.length !== 1 ? 's' : ''}`}
                  </Badge>
                </div>

                {/* Events for this date */}
                <div className="space-y-3">
                  {dayEvents.map((event) => (
                    <Card 
                      key={event.id} 
                      className={`
                        hover:shadow-md transition-shadow cursor-pointer
                        ${timeStatus === 'past' ? 'opacity-75' : ''}
                      `}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            {/* Event Title and Type */}
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-xl">{getEventTypeIcon(event.type)}</span>
                              <h4 className="text-lg font-semibold truncate">{event.title}</h4>
                              <Badge className={getEventTypeColor(event.type)}>
                                {event.type}
                              </Badge>
                              {event.isPrivate && (
                                <Badge variant="outline" className="flex items-center space-x-1">
                                  <EyeOff className="w-3 h-3" />
                                  <span>{'Private'}</span>
                                </Badge>
                              )}
                            </div>

                            {/* Event Description */}
                            {event.description && (
                              <p className="text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                {event.description}
                              </p>
                            )}

                            {/* Event Details */}
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              {event.time && (
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{event.time}</span>
                                </span>
                              )}
                              
                              {event.recurrence && (
                                <Badge variant="outline" className="text-xs">
                                  {'Repeats ' + event.recurrence}
                                </Badge>
                              )}
                            </div>

                            {/* Tags */}
                            {event.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {event.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEventEdit(event);
                              }}
                              className="hover:bg-blue-100 hover:text-blue-600"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="hover:bg-red-100 hover:text-red-600"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{'Delete Event'}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {`Are you sure you want to delete "${event.title}"? This action cannot be undone.`}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{'Cancel'}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteEvent(event.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {'Delete'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}