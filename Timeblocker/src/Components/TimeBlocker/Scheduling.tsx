import { CalendarEvent } from './Calendar';

interface TimeSlot {
  start: Date;
  end: Date;
}

export interface SchedulingPreferences {
  businessHours: {
    startTime: number;  // 0-23
    endTime: number;    // 0-23
  };
  slotDuration: number;        // in minutes
  maxDaysToLookAhead: number; // number of days to look ahead for scheduling
  preferredDays?: number[];    // 0-6, where 0 is Sunday
  breakBetweenEvents?: number; // minutes between events
  mode: 'day' | 'week';        // scheduling mode
}

const DEFAULT_PREFERENCES: SchedulingPreferences = {
  businessHours: {
    startTime: 1,
    endTime: 23,
  },
  slotDuration: 30,
  maxDaysToLookAhead: 5,
  breakBetweenEvents: 2,
  mode: 'day'
};

export const rescheduleEvents = async (
  events: CalendarEvent[],
  preferences: Partial<SchedulingPreferences> = {}
): Promise<CalendarEvent[]> => {
  const schedulingPrefs: SchedulingPreferences = {
    ...DEFAULT_PREFERENCES,
    ...preferences
  };

  // Sort events by duration (longest first)
  const sortedEvents = [...events].sort((a, b) => {
    const durationA = new Date(a.end).getTime() - new Date(a.start).getTime();
    const durationB = new Date(b.end).getTime() - new Date(b.start).getTime();
    return durationB - durationA;
  });

  const getAvailableSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const { startTime, endTime } = schedulingPrefs.businessHours;

    // Skip if day is not in preferred days
    if (schedulingPrefs.preferredDays && 
        !schedulingPrefs.preferredDays.includes(date.getDay())) {
      return slots;
    }

    const slotDate = new Date(date);
    slotDate.setHours(startTime, 0, 0, 0);

    while (slotDate.getHours() < endTime) {
      const start = new Date(slotDate);
      slotDate.setMinutes(slotDate.getMinutes() + schedulingPrefs.slotDuration);
      const end = new Date(slotDate);
      slots.push({ start, end });
    }

    return slots;
  };

  const isSlotAvailable = (
    slot: TimeSlot,
    existingEvents: CalendarEvent[],
    duration: number
  ): boolean => {
    const slotEnd = new Date(slot.start.getTime() + duration);
    
    // Add break time to check
    const breakTime = schedulingPrefs.breakBetweenEvents || 0;
    const slotStartWithBreak = new Date(slot.start.getTime() - breakTime * 60000);
    const slotEndWithBreak = new Date(slotEnd.getTime() + breakTime * 60000);

    return !existingEvents.some(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (
        (slotStartWithBreak >= eventStart && slotStartWithBreak < eventEnd) ||
        (slotEndWithBreak > eventStart && slotEndWithBreak <= eventEnd)
      );
    });
  };

  const rescheduledEvents: CalendarEvent[] = [];

  // Process each event
  for (const event of sortedEvents) {
    const duration = new Date(event.end).getTime() - new Date(event.start).getTime();
    const currentDate = new Date(event.start);
    let scheduled = false;

    // Try to schedule within the specified look-ahead period
    for (let i = 0; i < schedulingPrefs.maxDaysToLookAhead && !scheduled; i++) {
      const availableSlots = getAvailableSlots(currentDate);

      for (const slot of availableSlots) {
        if (isSlotAvailable(slot, rescheduledEvents, duration)) {
          const newStart = new Date(slot.start);
          const newEnd = new Date(newStart.getTime() + duration);

          rescheduledEvents.push({
            ...event,
            start: newStart.toISOString(),
            end: newEnd.toISOString(),
            extendedProps: {
              time: `${newStart.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })} - ${newEnd.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}`
            }
          });
          scheduled = true;
          break;
        }
      }

      if (!scheduled) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // If event couldn't be scheduled, keep it in its original time slot
    if (!scheduled) {
      rescheduledEvents.push(event);
    }
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return rescheduledEvents;
};