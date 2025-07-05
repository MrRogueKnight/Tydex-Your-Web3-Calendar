'use client';

import { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addHours,
  startOfDay
} from 'date-fns';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getEventTypeColor, getEventTypeIcon } from '@/lib/api';
import type { Event, GoogleCalendarViewProps } from '@/lib/types';

export function GoogleCalendarView({
  events,
  selectedDate,
  currentDate,
  viewMode,
  onDateSelect,
  onEventSelect, 
  onEventCreate,
  isLoading
}: GoogleCalendarViewProps): JSX.Element {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const getEventsForDate = (date: Date): Event[] => {
    return events.filter(event => 
      isSameDay(new Date(event.date), date)
    );
  };

  const getEventStyle = (event: Event): string => {
    const baseStyle = "text-xs px-2 py-1 rounded mb-1 cursor-pointer hover:opacity-80 transition-opacity truncate";
    switch (event.type) {
      case 'BIRTHDAY':
        return `${baseStyle} bg-pink-100 text-pink-800 border-l-4 border-pink-500 dark:bg-pink-900 dark:text-pink-200`;
      case 'MEETING':
        return `${baseStyle} bg-blue-100 text-blue-800 border-l-4 border-blue-500 dark:bg-blue-900 dark:text-blue-200`;
      case 'REMINDER':
        return `${baseStyle} bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500 dark:bg-yellow-900 dark:text-yellow-200`;
      default:
        return `${baseStyle} bg-green-100 text-green-800 border-l-4 border-green-500 dark:bg-green-900 dark:text-green-200`;
    }
  };

  const renderMonthView = (): JSX.Element => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days: JSX.Element[] = [];
    let day = startDate;

    // Week header - shorter names for mobile
    const weekDays = isMobile 
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    while (day <= endDate) {
      const dayEvents = getEventsForDate(day);
      const isCurrentMonth = isSameMonth(day, currentDate);
      const isSelected = isSameDay(day, selectedDate);
      const isDayToday = isToday(day);
      const currentDay = day;

      days.push(
        <div
          key={day.toString()}
          className={`
            min-h-[120px] border-r border-b border-gray-200 dark:border-gray-700 p-2 cursor-pointer
            hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative
            ${isCurrentMonth ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}
            ${isSelected ? 'ring-2 ring-blue-500' : ''}
            ${isMobile ? 'min-h-[80px] p-1' : ''}
          `}
          onClick={() => onDateSelect(currentDay)}
          tabIndex={0}
          role="button"
          aria-label={`Select ${format(currentDay, 'EEEE, MMMM d, yyyy')}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onDateSelect(currentDay);
            }
          }}
        >
          <div className={`
            inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
            ${isDayToday ? 'bg-blue-600 text-white' : isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}
            ${isSelected && !isDayToday ? 'bg-blue-100 text-blue-600 dark:bg-blue-900' : ''}
            ${isMobile ? 'w-6 h-6 text-xs' : ''}
          `}>
            {format(currentDay, 'd')}
          </div>
          
          <div className={`mt-2 space-y-1 ${isMobile ? 'mt-1 space-y-0.5' : ''}`}>
            {dayEvents.slice(0, isMobile ? 2 : 3).map((event) => (
              <div
                key={event.id}
                className={`${getEventStyle(event)} ${isMobile ? 'text-xs px-1 py-0.5' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventSelect(event); 
                }}
                title={`${event.title}${event.time ? ` at ${event.time}` : ''}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    onEventSelect(event);
                  }
                }}
              >
                <span className="mr-1">{getEventTypeIcon(event.type)}</span>
                {isMobile ? event.title.substring(0, 8) + (event.title.length > 8 ? '...' : '') : event.title}
              </div>
            ))}
            {dayEvents.length > (isMobile ? 2 : 3) && (
              <div className={`text-xs text-gray-500 dark:text-gray-400 pl-2 ${isMobile ? 'text-xs pl-1' : ''}`}>
                +{dayEvents.length - (isMobile ? 2 : 3)} more
              </div>
            )}
          </div>

          {/* Quick add button - only show on desktop or when hovering */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDateSelect(currentDay);
                onEventCreate();
              }}
              className="absolute bottom-1 right-1 w-6 h-6 opacity-0 hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 shadow-sm"
            >
              <Plus className="w-3 h-3" />
            </Button>
          )}
        </div>
      );

      day = addDays(day, 1);
    }

    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Header with day names */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {weekDays.map((dayName, index) => (
            <div 
              key={dayName}
              className={`
                py-3 px-4 text-center text-sm font-medium bg-gray-50 dark:bg-gray-800
                ${index < 6 ? 'border-r border-gray-200 dark:border-gray-700' : ''}
                text-gray-700 dark:text-gray-300
                ${isMobile ? 'py-2 px-2 text-xs' : ''}
              `}
            >
              {dayName}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    );
  };

  const renderWeekView = (): JSX.Element => {
    const weekStart = startOfWeek(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Header */}
        <div className={`grid ${isMobile ? 'grid-cols-7' : 'grid-cols-8'} border-b border-gray-200 dark:border-gray-700`}>
          {!isMobile && (
            <div className="py-3 px-4 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">GMT</div>
            </div>
          )}
          {weekDays.map((day, index) => (
            <div
              key={day.toString()}
              className={`
                py-3 px-4 text-center bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700
                ${index < 6 ? 'border-r border-gray-200 dark:border-gray-700' : ''}
                ${isSameDay(day, selectedDate) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                ${isMobile ? 'py-2 px-2' : ''}
              `}
              onClick={() => onDateSelect(day)}
            >
              <div className={`text-gray-500 dark:text-gray-400 uppercase ${isMobile ? 'text-xs' : 'text-xs'}`}>
                {isMobile ? format(day, 'EEE').substring(0, 2) : format(day, 'EEE')}
              </div>
              <div className={`
                font-medium mt-1
                ${isToday(day) ? 'bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto' : 'text-gray-900 dark:text-white'}
                ${isMobile ? 'w-6 h-6 text-sm' : 'w-8 h-8 text-lg'}
              `}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className={`max-h-[600px] overflow-y-auto ${isMobile ? 'max-h-[400px]' : ''}`}>
          <div className={`grid ${isMobile ? 'grid-cols-7' : 'grid-cols-8'}`}>
            {/* Time column */}
            {!isMobile && (
              <div className="border-r border-gray-200 dark:border-gray-700">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-12 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 text-right"
                  >
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </div>
                ))}
              </div>
            )}
            
            {/* Day columns */}
            {weekDays.map((day, dayIndex) => (
              <div key={day.toString()} className={`${dayIndex < 6 ? 'border-r border-gray-200 dark:border-gray-700' : ''}`}>
                {hours.map((hour) => {
                  const dayEvents = getEventsForDate(day).filter(event => {
                    if (!event.time) return hour === 9; // Default to 9 AM if no time
                    const eventHour = parseInt(event.time.split(':')[0]);
                    return eventHour === hour;
                  });

                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="h-12 p-1 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer relative"
                      onClick={() => {
                        onDateSelect(day);
                        onEventCreate();
                      }}
                    >
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`${getEventStyle(event)} h-full flex items-center`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventSelect(event); 
                          }}
                        >
                          <span className="mr-1">{getEventTypeIcon(event.type)}</span>
                          {event.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = (): JSX.Element => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayEvents = getEventsForDate(currentDate);

    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="p-4 text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
              {format(currentDate, 'EEEE')}
            </div>
            <div className={`
              text-2xl font-medium
              ${isToday(currentDate) ? 'bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto' : 'text-gray-900 dark:text-white'}
            `}>
              {format(currentDate, 'd')}
            </div>
          </div>
        </div>

        {/* Time slots */}
        <div className="max-h-[600px] overflow-y-auto">
          <div className="grid grid-cols-2">
            {/* Time column */}
            <div className="border-r border-gray-200 dark:border-gray-700">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-16 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 text-right flex items-start justify-end"
                >
                  {hour === 0 ? '12:00 AM' : hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`}
                </div>
              ))}
            </div>
            
            {/* Events column */}
            <div>
              {hours.map((hour) => {
                const hourEvents = dayEvents.filter(event => {
                  if (!event.time) return hour === 9; // Default to 9 AM if no time
                  const eventHour = parseInt(event.time.split(':')[0]);
                  return eventHour === hour;
                });

                return (
                  <div
                    key={hour}
                    className="h-16 p-2 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => onEventCreate()}
                  >
                    {hourEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`${getEventStyle(event)} h-full flex items-center mb-1`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventSelect(event);
                        }}
                      >
                        <span className="mr-2">{getEventTypeIcon(event.type)}</span>
                        <div className="flex-1">
                          <div className="font-medium">{event.title}</div>
                          {event.time && (
                            <div className="text-xs opacity-75">{event.time}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading calendar...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}
    </div>
  );
}