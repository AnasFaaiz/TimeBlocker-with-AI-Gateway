export interface TimeSlot {
    start: Date;
    end: Date;
  }
  
  export interface EventExtendedProps {
    time?: string;
    deadline?: string;
    rescheduled?: boolean;
    originalStart?: string;
    originalEnd?: string;
    priority?: number;
  }
  
  export interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    extendedProps: EventExtendedProps;
  }
  
  export interface ParsedPrompt {
    targetDate?: Date;
    timeRange?: {
      start: number;
      end: number;
    };
    grouping?: 'together' | 'spread' | 'back-to-back';
    spacing?: number;
    energyLevel?: 'high' | 'low';
    complexity?: 'high' | 'low';
    breakPattern?: {
      interval: number;
      unit: 'hour' | 'minute';
    };
  }
  
  export interface SchedulingPreferences {
    businessHours: {
      startTime: number;
      endTime: number;
    };
    slotDuration: number;
    breakBetweenEvents: number;
    mode: 'day' | 'week';
    dateRange: {
      start: string;
      end: string;
    };
    workloadPreferences?: {
      maxHoursPerDay: number;
      preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening';
      energyLevels?: {
        morning: number;
        afternoon: number;
        evening: number;
      };
    };
    constraints?: {
      maxConsecutiveMeetings: number;
      requiredBreaks?: {
        after: number;
        duration: number;
      };
      blockedTimes?: Array<{
        day: number;
        start: number;
        end: number;
      }>;
    };
    aiPreferences?: {
      prompt?: string;
      priority?: 'deadline' | 'duration' | 'custom';
      customPriority?: string[];
      selectedTaskIds?: string[];
    };
  }