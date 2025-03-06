import { CalendarEvent } from './Calendar';

interface TimeSlot {
  start: Date;
  end: Date;
}

export const rescheduleEvents = async (events: CalendarEvent[]): Promise<CalendarEvent[]> => {
  // Sort events by duration (longest first)
  const sortedEvents = [...events].sort((a, b) => {
    const durationA = new Date(a.end).getTime() - new Date(a.start).getTime();
    const durationB = new Date(b.end).getTime() - new Date(b.start).getTime();
    return durationB - durationA;
  });

  const businessHours = {
    startTime: 7, 
    endTime: 19, 
  };


  const getAvailableSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = businessHours.startTime;
    const endHour = businessHours.endTime;

    const slotDate = new Date(date);
    slotDate.setHours(startHour, 0, 0, 0);

    while (slotDate.getHours() < endHour) {
      const start = new Date(slotDate);
      slotDate.setMinutes(slotDate.getMinutes() + 30); // 30-minute slots
      const end = new Date(slotDate);
      slots.push({ start, end });
    }

    return slots;
  };

  // Check if slot is available
  const isSlotAvailable = (
    slot: TimeSlot,
    existingEvents: CalendarEvent[],
    duration: number
  ): boolean => {
    const slotEnd = new Date(slot.start.getTime() + duration);
    
    return !existingEvents.some(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (
        (slot.start >= eventStart && slot.start < eventEnd) ||
        (slotEnd > eventStart && slotEnd <= eventEnd)
      );
    });
  };

  const rescheduledEvents: CalendarEvent[] = [];

  // Process each event
  for (const event of sortedEvents) {
    const duration = new Date(event.end).getTime() - new Date(event.start).getTime();
    const currentDate = new Date(event.start);
    let scheduled = false;

    // Try to schedule within the same week
    for (let i = 0; i < 5 && !scheduled; i++) {
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