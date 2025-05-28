import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { rescheduleEvents } from './Scheduling';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { EventResizeDoneArg} from '@fullcalendar/interaction';
import { 
  DateSelectArg, 
  DatesSetArg, 
  EventClickArg,
  EventDropArg,
  EventContentArg 
} from '@fullcalendar/core';
import { CalendarEvent, EventExtendedProps, SchedulingPreferences } from './types';
import AISchedulingOverlay from './Overlay';
import ChatOverlay from './chatOverlay';

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [schedulingPreferences, setSchedulingPreferences] = useState<Partial<SchedulingPreferences>>({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  );

  const handleform = () => {
    setIsPreferencesOpen(true);
  };
  
  const handlePreferencesSubmit = async (preferences: Partial<SchedulingPreferences>) => {
    setSchedulingPreferences(preferences);
    try {
      const rescheduledEvents = await rescheduleEvents(events, preferences);
      setEvents(rescheduledEvents);
    } catch (error) {
      console.error('Error during AI scheduling:', error);
      alert('Failed to reschedule events. Please try again.');
    }
  };

  const formatEventTime = (start: Date, end: Date): string => {
    return `${start.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })} - ${end.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const title = prompt('Enter event title:');
    if (title) {
      const startTime = new Date(selectInfo.startStr);
      const endTime = new Date(selectInfo.endStr);
      const timeString = formatEventTime(startTime, endTime);
  
      setEvents([...events, {
        id: String(Date.now()),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        extendedProps: {
          time: timeString
        }
      }]);
    }
    selectInfo.view.calendar.unselect();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (window.confirm(`Delete event '${clickInfo.event.title}'?`)) {
      setEvents(events.filter(event => event.id !== clickInfo.event.id));
    }
  };

  const handleEventDrop = (dropInfo: EventDropArg) => {
    const updatedEvents = events.map(event => {
      if (event.id === dropInfo.event.id) {
        const startTime = new Date(dropInfo.event.startStr);
        const endTime = new Date(dropInfo.event.endStr);
        const timeString = formatEventTime(startTime, endTime);
  
        return {
          ...event,
          start: dropInfo.event.startStr,
          end: dropInfo.event.endStr,
          extendedProps: {
            ...event.extendedProps,
            time: timeString
          }
        };
      }
      return event;
    });
    setEvents(updatedEvents);
  };

  const handleEventResize = (resizeInfo: EventResizeDoneArg) => {
    const updatedEvents = events.map(event => {
      if (event.id === resizeInfo.event.id) {
        return {
          ...event,
          start: resizeInfo.event.startStr,
          end: resizeInfo.event.endStr,
        };
      }
      return event;
    });
    setEvents(updatedEvents);
  };

  const handleDatesSet = (dateInfo: DatesSetArg) => {
    setCurrentDate(dateInfo.start.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
  };

  const renderEventContent = (eventInfo: EventContentArg) => {
    const isTimeGridView = eventInfo.view.type === 'timeGridWeek' || 
                          eventInfo.view.type === 'timeGridDay';
    
    const displayTime = eventInfo.event.extendedProps?.time || 
      formatEventTime(new Date(eventInfo.event.startStr), new Date(eventInfo.event.endStr));
  
    return (
      <EventContentWrapper>
        <EventTitle>{eventInfo.event.title}</EventTitle>
        {isTimeGridView && (
          <EventTime>{displayTime}</EventTime>
        )}
      </EventContentWrapper>
    );
  };

  return (
    <CalendarContainer>
      <CalendarHeader>
        <HeaderLeft>
          <CalendarIcon>📅</CalendarIcon>
          <CurrentDate>{currentDate}</CurrentDate>
        </HeaderLeft>
        <HeaderRight>
          <ActionButton 
            variant="success" 
            onClick={() => setIsChatOpen(true)}
          >
            <ButtonIcon>💬</ButtonIcon>
            Get Suggestions
          </ActionButton>
          <ActionButton 
            variant="primary" 
            onClick={handleform}
          >
            <ButtonIcon>🤖</ButtonIcon>
            AI Scheduling
          </ActionButton>
        </HeaderRight>
      </CalendarHeader>

      <CalendarWrapper>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          datesSet={handleDatesSet}
          eventContent={renderEventContent}
          height={650}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          slotDuration="00:30:00"
          snapDuration="00:15:00"
          allDaySlot={false}
          nowIndicator={true}
          eventOverlap={false}
          slotEventOverlap={false}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
            startTime: '00:00',
            endTime: '24:00',
          }}
          weekends={true}
        />
      </CalendarWrapper>

      <ChatOverlay
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        events={events}
      />
      <AISchedulingOverlay
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        onSubmit={handlePreferencesSubmit}
        events={events}
      />
    </CalendarContainer>
  );
};

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
`;

// Styled Components
const CalendarContainer = styled.div`
  margin: 1rem;
  padding: 0;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border-radius: 16px;
  width: calc(100vw - 2rem);
  min-height: 85vh;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 8px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #4285f4, transparent);
    animation: ${shimmer} 3s infinite;
  }

  @media (max-width: 768px) {
    margin: 0.5rem;
    width: calc(100vw - 1rem);
    border-radius: 12px;
  }
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #1f1f1f 0%, #2f2f2f 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CalendarIcon = styled.span`
  font-size: 1.5rem;
  filter: drop-shadow(0 2px 4px rgba(66, 133, 244, 0.3));
`;

const CurrentDate = styled.h2`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #fff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const ActionButton = styled.button<{ variant: 'primary' | 'success' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ variant }) => 
    variant === 'primary' 
      ? 'linear-gradient(135deg, #4285f4 0%, #1976d2 100%)'
      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  };
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4px 12px ${({ variant }) => 
      variant === 'primary' 
        ? 'rgba(66, 133, 244, 0.3)'
        : 'rgba(16, 185, 129, 0.3)'
    },
    0 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 20px ${({ variant }) => 
        variant === 'primary' 
          ? 'rgba(66, 133, 244, 0.4)'
          : 'rgba(16, 185, 129, 0.4)'
      },
      0 4px 8px rgba(0, 0, 0, 0.3);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
    animation: ${pulse} 0.3s ease;
  }

  @media (max-width: 768px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.8rem;
  }
`;

const ButtonIcon = styled.span`
  font-size: 1rem;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
`;

const CalendarWrapper = styled.div`
  padding: 1.5rem;
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(10px);

  .fc {
    color: #fff;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    
    &-toolbar-title {
      color: #fff;
      font-weight: 700;
      font-size: 1.8rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      background: linear-gradient(135deg, #fff 0%, #e0e0e0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    &-header-toolbar {
      margin: 1rem 0 !important;
      padding: 0.5rem;
      background: rgba(42, 42, 42, 0.6);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }

    &-button-primary {
      background: linear-gradient(135deg, #3a3a3a 0%, #4a4a4a 100%) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      padding: 0.6rem 1rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: #fff !important;
      border-radius: 8px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

      &:hover {
        background: linear-gradient(135deg, #4a4a4a 0%, #5a5a5a 100%) !important;
        border-color: rgba(255, 255, 255, 0.3) !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      }

      &:disabled {
        background: rgba(42, 42, 42, 0.5) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
        opacity: 0.5;
      }

      &.fc-button-active {
        background: linear-gradient(135deg, #4285f4 0%, #1976d2 100%) !important;
        border-color: #4285f4 !important;
        box-shadow: 0 4px 12px rgba(66, 133, 244, 0.4);
      }
    }

    &-event {
      background: linear-gradient(135deg, #4285f4 0%, #1976d2 100%) !important;
      border: none !important;
      border-radius: 8px;
      padding: 6px 8px;
      margin: 2px 0;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba(66, 133, 244, 0.3);
      backdrop-filter: blur(5px);
      border: 1px solid rgba(255, 255, 255, 0.2) !important;

      &:hover {
        transform: scale(1.02) translateY(-1px);
        box-shadow: 0 4px 16px rgba(66, 133, 244, 0.4);
        background: linear-gradient(135deg, #5a95f5 0%, #2986e3 100%) !important;
      }

      &.fc-event-dragging {
        opacity: 0.8;
        transform: scale(1.05);
        box-shadow: 0 8px 24px rgba(66, 133, 244, 0.5);
        z-index: 10;
      }

      &.fc-event-resizing {
        opacity: 0.7;
        box-shadow: 0 6px 20px rgba(66, 133, 244, 0.4);
      }
    }

    &-timegrid-slot {
      height: 2.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      transition: background-color 0.2s ease;

      &:hover {
        background-color: rgba(255, 255, 255, 0.02);
      }
    }

    &-timegrid-col, 
    &-daygrid-day {
      background-color: rgba(26, 26, 26, 0.8) !important;
      backdrop-filter: blur(5px);
    }

    &-day-today {
      background: linear-gradient(135deg, rgba(66, 133, 244, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%) !important;
      border: 1px solid rgba(66, 133, 244, 0.3);
    }

    &-day-header {
      padding: 1rem 0 !important;
      font-weight: 700;
      color: #fff;
      background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 0.8rem;
    }

    &-col-header-cell {
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    &-timegrid-slot-label {
      color: rgba(255, 255, 255, 0.7);
      font-weight: 500;
      font-size: 0.8rem;
    }

    &-timegrid-axis {
      color: rgba(255, 255, 255, 0.7);
      background: rgba(42, 42, 42, 0.5);
    }

    &-theme-standard {
      td, th {
        border-color: rgba(255, 255, 255, 0.1);
      }
    }

    &-scrollgrid {
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 12px;
      overflow: hidden;
    }

    &-timegrid-divider {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.1);
    }

    &-now-indicator-line {
      border-color: #ff4444;
      box-shadow: 0 0 8px rgba(255, 68, 68, 0.5);
    }

    &-now-indicator-arrow {
      border-top-color: #ff4444;
      border-bottom-color: #ff4444;
    }
  }

  @media (max-width: 768px) {
    padding: 1rem;

    .fc {
      &-header-toolbar {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
      }

      &-toolbar-chunk {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      &-button {
        padding: 0.5rem 0.8rem !important;
        font-size: 0.8rem !important;
      }

      &-toolbar-title {
        font-size: 1.4rem;
      }
    }
  }
`;

const EventContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
`;

const EventTitle = styled.div`
  font-weight: 600;
  font-size: 0.85rem;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  line-height: 1.2;
`;

const EventTime = styled.div`
  font-size: 0.75rem;
  opacity: 0.9;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

export default Calendar;