import React, { useState } from 'react';
import styled from 'styled-components';
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

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps?: {
    time?: string;
  };
}

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  );

  const handleAIScheduling = async () => {
    try {
      const rescheduledEvents = await rescheduleEvents(events);
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
      <div className="event-content">
        <div className="event-title">{eventInfo.event.title}</div>
        {isTimeGridView && (
          <div className="event-time">{displayTime}</div>
        )}
      </div>
    );
  };

  return (
    <StyledCalendar>
      <div className="calendar-header">
        <span className="current-date">{currentDate}</span>
        <button className="ai-button" onClick={handleAIScheduling}>AI Scheduling</button>
      </div>
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
        height={600}
        slotMinTime="07:00:00"
        slotMaxTime="19:00:00"
        slotDuration="00:30:00"
        snapDuration="00:15:00"
        allDaySlot={false}
        nowIndicator={true}
        eventOverlap={false}
        slotEventOverlap={false}
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
          startTime: '07:00',
          endTime: '19:00',
        }}
        weekends={true}
      />
    </StyledCalendar>
  );
};

const StyledCalendar = styled.div`
  margin: 0.5rem;
  padding: 0.5rem;
  background: #1a1a1a;
  border-radius: 8px;
  min-width: 97vw;
  min-height: 80vh;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);

  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #333;
  }

  .current-date {
    font-size: 1.1rem;
    font-weight: 500;
    color: #fff;
  }

  .ai-button {
    background-color: #2563eb; 
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.4rem 0.8rem; 
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #1d4ed8; // Darker blue on hover
    }

    &:active {
      background-color: #1e40af; // Even darker when clicked
    }
  }    

  .fc {
    color: #fff;
    
    &-toolbar-title {
      color: #fff;
    }

    &-header-toolbar {
      margin: 0.5rem 0 !important;
    }

    &-button-primary {
      background-color: #333 !important;
      border-color: #444 !important;
      padding: 0.4rem 0.8rem;
      font-size: 0.9rem;
      color: #fff !important;

      &:hover {
        background-color: #444 !important;
        border-color: #555 !important;
      }

      &:disabled {
        background-color: #222 !important;
        border-color: #333 !important;
        opacity: 0.7;
      }
    }

    &-event {
      background-color: #333 !important;
      border: none;
      padding: 4px 6px;
      margin: 1px 0;
      cursor: pointer;
      transition: transform 0.1s ease;

      &:hover {
        transform: scale(1.01);
        background-color: #444 !important;
      }

            &.fc-event-dragging {
        opacity: 0.8;
        background-color: #444 !important;
        
        .event-time {
          display: block !important;
          font-size: 0.75rem;
          color: #fff;
          opacity: 1;
        }
      }

      &.fc-event-resizing {
        opacity: 0.7;
      }

      .event-content {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .event-title {
        font-weight: 500;
        font-size: 0.85rem;
        color: #fff;
      }

      .event-time {
        font-size: 0.75rem;
        opacity: 0.8;
        color: #fff;
      }

      .event-description {
        font-size: 0.75rem;
        opacity: 0.7;
        color: #fff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    &-timegrid-slot {
      height: 2rem;
      border-bottom: 1px dashed #333;
    }

    &-timegrid-col, 
    &-daygrid-day {
      background-color: #1a1a1a !important;
    }

  .fc-timegrid-col.fc-day-sat,
    .fc-timegrid-col.fc-day-sun,
    td.fc-daygrid-day.fc-day-sat,
    td.fc-daygrid-day.fc-day-sun {
      background-color: #1a1a1a !important;
    }
      
    &-day-today {
      background-color: rgba(255, 255, 255, 0.05) !important;
    }

    &-day-header {
      padding: 0.5rem 0 !important;
      font-weight: 600;
      color: #fff;
    }

    &-col-header-cell {
      color: #fff;
    }

    &-timegrid-slot-label {
      color: #fff;
    }

    &-timegrid-axis {
      color: #fff;
    }

    &-theme-standard {
      td, th {
        border-color: #333;
      }
    }

    &-scrollgrid {
      border-color: #333 !important;
    }

    &-timegrid-divider {
      background: #333;
      border-color: #333;
    }
  }

  @media (max-width: 768px) {
    margin: 0.25rem;
    padding: 0.25rem;
    min-width: 95vw;

    .fc {
      &-header-toolbar {
        flex-direction: column;
        gap: 0.5rem;
      }

      &-toolbar-chunk {
        display: flex;
        justify-content: center;
      }

      &-button {
        padding: 0.3rem 0.6rem !important;
        font-size: 0.8rem !important;
      }
    }
  }
`;

export default Calendar;