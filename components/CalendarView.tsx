'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid3X3, List, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getEventTypeColor, getEventTypeIcon } from '@/lib/api';
import type { CalendarViewProps, Event, CalendarViewMode } from '@/lib/types';

export function CalendarView({ 
  events, 
  selectedDate, 
  onDateSelect, 
  onEventEdit, 
  isLoading 
}: CalendarViewProps): JSX.Element {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  const navigateMonth = (direction: 'prev' | 'next'): void => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const getEventsForDate = (date: Date): Event[] => {
    return events.filter(event => 
      isSameDay(new Date(event.date), date)
    );
  };

  const renderMonthView = (): JSX.Element => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days: JSX.Element[] = [];
    let day = startDate;

    while (day <= endDate) {
      const dayEvents = getEventsForDate(day);
      const isCurrentMonth = isSameMonth(day, currentDate);
      const isSelected = isSameDay(day, selectedDate);
      const isToday = isSameDay(day, new Date());
      const currentDay = day;

      days.push(
        <div
          key={day.toString()}
          className={`
            min-h-[100px] p-2 border border-gray-200 dark:border-gray-700 cursor-pointer
            hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
            ${isCurrentMonth ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}
            ${isSelected ? 'ring-2 ring-blue-500' : ''}
            ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
          `}
          onClick={() => onDateSelect(currentDay)}
        >
          <div className={`
            text-sm font-medium mb-1
            ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}
          `}>
            {format(currentDay, 'd')}
          </div>
          
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map((event, index) => (
              <div
                key={event.id}
                className={`
                  text-xs p-1 rounded truncate cursor-pointer
                  ${getEventTypeColor(event.type)}
                  hover:opacity-80 transition-opacity
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventEdit(event);
                }}
                title={event.title}
              >
                <span className="mr-1">{getEventTypeIcon(event.type)}</span>
                {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500 text-center">
                {`+${dayEvents.length - 3} more`}
              </div>
            )}
          </div>
        </div>
      );

      day = addDays(day, 1);
    }

    return (
      <div className="grid grid-cols-7 gap-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Header with day names */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
          <div 
            key={dayName}
            className="bg-gray-100 dark:bg-gray-800 p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {dayName}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderWeekView = (): JSX.Element => {
    const weekStart = startOfWeek(selectedDate);
    const weekDays: JSX.Element[] = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayEvents = getEventsForDate(day);
      const isToday = isSameDay(day, new Date());
      const isSelected = isSameDay(day, selectedDate);

      weekDays.push(
        <div key={day.toString()} className="flex-1">
          <Card className={`h-full ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className={`
                text-lg flex items-center justify-between
                ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}
              `}>
                <span>{format(day, 'EEE')}</span>
                <span 
                  className={`
                    text-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 
                    rounded-full w-10 h-10 flex items-center justify-center
                    ${isToday ? 'bg-blue-100 dark:bg-blue-900' : ''}
                  `}
                  onClick={() => onDateSelect(day)}
                >
                  {format(day, 'd')}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  className={`
                    p-2 rounded text-sm cursor-pointer
                    ${getEventTypeColor(event.type)}
                    hover:opacity-80 transition-opacity
                  `}
                  onClick={() => onEventEdit(event)}
                >
                  <div className="font-medium flex items-center">
                    <span className="mr-1">{getEventTypeIcon(event.type)}</span>
                    {event.title}
                  </div>
                  {event.time && (
                    <div className="text-xs opacity-75">{event.time}</div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex space-x-4 overflow-x-auto">
        {weekDays}
      </div>
    );
  };

  const renderDayView = (): JSX.Element => {
    const dayEvents = getEventsForDate(selectedDate);
    const isToday = isSameDay(selectedDate, new Date());

    return (
      <Card>
        <CardHeader>
          <CardTitle className={`
            text-2xl flex items-center justify-between
            ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}
          `}>
            <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
            <Badge variant={isToday ? 'default' : 'secondary'}>
              {isToday ? 'Today' : format(selectedDate, 'EEE')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dayEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{'No events scheduled for this day'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  className={`
                    p-4 rounded-lg border cursor-pointer
                    ${getEventTypeColor(event.type)}
                    hover:shadow-md transition-shadow
                  `}
                  onClick={() => onEventEdit(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold flex items-center">
                        <span className="mr-2 text-lg">{getEventTypeIcon(event.type)}</span>
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-sm opacity-75 mt-1">{event.description}</p>
                      )}
                      {event.time && (
                        <p className="text-sm font-medium mt-2">{event.time}</p>
                      )}
                    </div>
                    <Badge variant="outline">{event.type}</Badge>
                  </div>
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
            {viewMode === 'week' && `Week of ${format(startOfWeek(selectedDate), 'MMM d, yyyy')}`}
            {viewMode === 'day' && format(selectedDate, 'MMMM d, yyyy')}
          </h2>
          
          {viewMode === 'month' && (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            {'Month'}
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            <List className="w-4 h-4 mr-2" />
            {'Week'}
          </Button>
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('day')}
          >
            <Eye className="w-4 h-4 mr-2" />
            {'Day'}
          </Button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="min-h-[500px]">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>

      {/* Event Count */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        {`Showing ${events.length} event${events.length !== 1 ? 's' : ''}`}
      </div>
    </div>
  );
}