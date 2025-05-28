import { 
  CalendarEvent, 
  EventExtendedProps, 
  ParsedPrompt, 
  SchedulingPreferences, 
  TimeSlot 
} from './types';

const DEFAULT_PREFERENCES: SchedulingPreferences = {
  businessHours: {
    startTime: 9,
    endTime: 17,
  },
  slotDuration: 30,
  breakBetweenEvents: 15,
  mode: 'day',
  dateRange: {
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
};

function getAvailableSlots(
  date: Date, 
  preferences: SchedulingPreferences,
  parsedPrompt?: ParsedPrompt
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const { businessHours, slotDuration } = preferences;
  
  let startHour = businessHours.startTime;
  if (parsedPrompt?.timeRange?.start !== undefined) {
    startHour = parsedPrompt.timeRange.start;
  }

  let endHour = businessHours.endTime;
  if (parsedPrompt?.timeRange?.end !== undefined) {
    endHour = parsedPrompt.timeRange.end;
  }

  const currentDate = new Date(date);
  currentDate.setHours(startHour, 0, 0, 0);
  
  while (currentDate.getHours() < endHour) {
    const slotStart = new Date(currentDate);
    currentDate.setMinutes(currentDate.getMinutes() + slotDuration);
    const slotEnd = new Date(currentDate);
    
    slots.push({ start: slotStart, end: slotEnd });
  }

  return slots;
}

function isSlotAvailable(
  slot: TimeSlot,
  existingEvents: CalendarEvent[],
  duration: number,
  preferences: SchedulingPreferences,
  parsedPrompt?: ParsedPrompt
): boolean {
  const slotEnd = new Date(slot.start.getTime() + duration);
  const breakTime = preferences.breakBetweenEvents * 60000;
  const slotStartWithBreak = new Date(slot.start.getTime() - breakTime);
  const slotEndWithBreak = new Date(slotEnd.getTime() + breakTime);

  if (slot.start.getHours() < preferences.businessHours.startTime || 
      slotEnd.getHours() >= preferences.businessHours.endTime) {
    return false;
  }

  return !existingEvents.some(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    return (
      (slotStartWithBreak >= eventStart && slotStartWithBreak < eventEnd) ||
      (slotEndWithBreak > eventStart && slotEndWithBreak <= eventEnd) ||
      (slotStartWithBreak <= eventStart && slotEndWithBreak >= eventEnd)
    );
  });
}

const parsePrompt = (prompt: string): ParsedPrompt => {
  const result: ParsedPrompt = {};
  
  const datePatterns = {
    'tomorrow': () => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      return date;
    },
    'next week': () => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    },
    'next monday': () => {
      const date = new Date();
      const daysUntilMonday = (8 - date.getDay()) % 7;
      date.setDate(date.getDate() + daysUntilMonday);
      return date;
    },
    'next friday': () => {
      const date = new Date();
      const daysUntilFriday = (5 - date.getDay() + 7) % 7;
      date.setDate(date.getDate() + daysUntilFriday);
      return date;
    }
  };

  for (const [pattern, getDate] of Object.entries(datePatterns)) {
    if (prompt.toLowerCase().includes(pattern)) {
      result.targetDate = getDate();
      break;
    }
  }

  const timePatterns = {
    'morning': { start: 9, end: 12 },
    'afternoon': { start: 12, end: 17 },
    'evening': { start: 17, end: 21 },
    'early morning': { start: 6, end: 9 },
    'late afternoon': { start: 15, end: 18 }
  };

  for (const [pattern, timeRange] of Object.entries(timePatterns)) {
    if (prompt.toLowerCase().includes(pattern)) {
      result.timeRange = timeRange;
      break;
    }
  }

  if (prompt.toLowerCase().includes('together')) {
    result.grouping = 'together';
  } else if (prompt.toLowerCase().includes('spread')) {
    result.grouping = 'spread';
  } else if (prompt.toLowerCase().includes('back-to-back')) {
    result.grouping = 'back-to-back';
  }

  if (prompt.toLowerCase().includes('high energy')) {
    result.energyLevel = 'high';
  } else if (prompt.toLowerCase().includes('low energy')) {
    result.energyLevel = 'low';
  }

  if (prompt.toLowerCase().includes('complex')) {
    result.complexity = 'high';
  } else if (prompt.toLowerCase().includes('simple')) {
    result.complexity = 'low';
  }

  const breakPattern = /break(?:s)? (?:every|after) (\d+) (?:hour|hr|minute|min)s?/i;
  const breakMatch = prompt.match(breakPattern);
  if (breakMatch) {
    result.breakPattern = {
      interval: parseInt(breakMatch[1]),
      unit: breakMatch[0].includes('hour') ? 'hour' : 'minute'
    };
  }

  return result;
};

export const rescheduleEvents = async (
  events: CalendarEvent[],
  preferences: Partial<SchedulingPreferences> = {}
): Promise<CalendarEvent[]> => {
  const schedulingPrefs: SchedulingPreferences = {
    ...DEFAULT_PREFERENCES,
    ...preferences
  };

  const parsedPrompt = schedulingPrefs.aiPreferences?.prompt 
    ? parsePrompt(schedulingPrefs.aiPreferences.prompt)
    : {};

  const eventsToReschedule = schedulingPrefs.aiPreferences?.selectedTaskIds?.length
    ? events.filter(event => schedulingPrefs.aiPreferences?.selectedTaskIds?.includes(event.id))
    : [...events];

  const nonRescheduledEvents = events.filter(event => 
    !schedulingPrefs.aiPreferences?.selectedTaskIds?.includes(event.id)
  );

  const sortedEvents = eventsToReschedule.sort((a, b) => {
    if (schedulingPrefs.aiPreferences?.priority === 'deadline') {
      const deadlineA = a.extendedProps?.deadline ? new Date(a.extendedProps.deadline).getTime() : Infinity;
      const deadlineB = b.extendedProps?.deadline ? new Date(b.extendedProps.deadline).getTime() : Infinity;
      return deadlineA - deadlineB;
    }
    const durationA = new Date(a.end).getTime() - new Date(a.start).getTime();
    const durationB = new Date(b.end).getTime() - new Date(b.start).getTime();
    return durationB - durationA;
  });

  const rescheduledEvents: CalendarEvent[] = [];
  const startDate = new Date(schedulingPrefs.dateRange.start);
  const endDate = new Date(schedulingPrefs.dateRange.end);

  for (const event of sortedEvents) {
    const duration = new Date(event.end).getTime() - new Date(event.start).getTime();
    let currentDate = new Date(startDate);
    let scheduled = false;

    while (currentDate <= endDate && !scheduled) {
      const slots = getAvailableSlots(currentDate, schedulingPrefs, parsedPrompt);

      for (const slot of slots) {
        if (isSlotAvailable(slot, [...rescheduledEvents, ...nonRescheduledEvents], duration, schedulingPrefs, parsedPrompt)) {
          const newStart = new Date(slot.start);
          const newEnd = new Date(newStart.getTime() + duration);

          rescheduledEvents.push({
            ...event,
            start: newStart.toISOString(),
            end: newEnd.toISOString(),
            extendedProps: {
              ...event.extendedProps,
              time: `${newStart.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })} - ${newEnd.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}`,
              rescheduled: true,
              originalStart: event.start,
              originalEnd: event.end
            } as EventExtendedProps
          });
          scheduled = true;
          break;
        }
      }

      if (!scheduled) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    if (!scheduled) {
      rescheduledEvents.push(event);
    }
  }

  return [...rescheduledEvents, ...nonRescheduledEvents];
};