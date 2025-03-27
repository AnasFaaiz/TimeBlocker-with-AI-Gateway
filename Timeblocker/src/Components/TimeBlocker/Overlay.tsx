import React from 'react';
import styled from 'styled-components';
import { SchedulingPreferences } from './Scheduling';
import { CalendarEvent } from './Calendar';

interface AISchedulingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (preferences: Partial<SchedulingPreferences>) => void;
  events: CalendarEvent[];
}

const AISchedulingOverlay: React.FC<AISchedulingOverlayProps> = ({
  isOpen,
  onClose,
  onSubmit,
  events
}) => {
    const [schedulingMode, setSchedulingMode] = React.useState<'day' | 'week'>('day');
    const [breakDuration, setBreakDuration] = React.useState(15);
    const [slotDuration, setSlotDuration] = React.useState(30);

    const formatTasks = React.useMemo(() => {
      if (!isOpen) return [];
      
      if (schedulingMode === 'day') {
        const today = new Date().toISOString().split('T')[0];
        return events
          .filter(event => event.start.startsWith(today))
          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()) // Sort by time
          .map(event => ({
            time: new Date(event.start).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            title: event.title,
            timestamp: new Date(event.start).getTime()
          }));
      } else {
        // Group events by day for week view
        const sortedEvents = events
          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
          .map(event => {
            const date = new Date(event.start);
            return {
              time: date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              title: event.title,
              timestamp: date.getTime(),
              dayKey: date.toISOString().split('T')[0] // For grouping by day
            };
          });
    
        return sortedEvents;
      }
    }, [events, schedulingMode, isOpen]);

    if (!isOpen) return null; 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      businessHours: {
        startTime: 9,
        endTime: 17
      },
      slotDuration: slotDuration,
      breakBetweenEvents: breakDuration,
      mode: schedulingMode
    });
  };

  return (
    <OverlayContainer>
      <Overlay onClick={onClose} />
      <OverlayContent>
        <Header>
          <Title>AI Scheduling Preferences</Title>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>
        <Form onSubmit={handleSubmit}>
        <ModeSelector>
            <ModeButton 
              type="button"
              isActive={schedulingMode === 'day'}
              onClick={() => setSchedulingMode('day')}
            >
              Day wise
            </ModeButton>
            <ModeButton 
              type="button"
              isActive={schedulingMode === 'week'}
              onClick={() => setSchedulingMode('week')}
            >
              Week wise
            </ModeButton>
          </ModeSelector>

          <TasksContainer>
            <TasksHeader>
              {schedulingMode === 'day' ? "Today's Tasks" : "This Week's Tasks"}
            </TasksHeader>
            <TasksList>
              {formatTasks.map((task, index) => (
                <TaskItem key={index}>
                  <TaskTime>{task.time}</TaskTime>
                  <TaskTitle>{task.title}</TaskTitle>
                </TaskItem>
              ))}
            </TasksList>
          </TasksContainer>

            <DurationContainer>
                <FormGroup>
                    <Label>Break Duration (minutes)</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      value={breakDuration}
                      onChange={(e) => setBreakDuration(Number(e.target.value))}
                      placeholder="15" 
                    />
                </FormGroup>
                <FormGroup>
                    <Label>Slot Duration (minutes)</Label>
                    <Input 
                      type="number" 
                      min="15" 
                      step="15" 
                      value={slotDuration}
                      onChange={(e) => setSlotDuration(Number(e.target.value))}
                      placeholder="30" 
                    />
                </FormGroup>
            </DurationContainer>
          <ButtonGroup>
            <CancelButton type="button" onClick={onClose}>Cancel</CancelButton>
            <SubmitButton type="submit">Apply Scheduling</SubmitButton>
          </ButtonGroup>
        </Form>
      </OverlayContent>
    </OverlayContainer>
  );
};

const OverlayContainer = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
`;

const OverlayContent = styled.div`
  position: relative;
  background: #1a1a1a;
  border-radius: 8px;
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  z-index: 1001;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  color: #fff;
  font-size: 1.5rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  
  &:hover {
    color: #fff;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #fff;
  font-size: 0.9rem;
`;

const Input = styled.input`
  background: #333;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 0.5rem;
  color: #fff;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const DurationContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    `;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
`;

const CancelButton = styled(Button)`
  background: none;
  border: 1px solid #444;
  color: #fff;
  
  &:hover {
    background: #333;
  }
`;

const SubmitButton = styled(Button)`
  background: #2563eb;
  border: none;
  color: #fff;
  
  &:hover {
    background: #1d4ed8;
  }
`;

const ModeSelector = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  background: #2a2a2a;
  border-radius: 6px;
`;

const ModeButton = styled.button<{ isActive: boolean }>`
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.isActive ? '#2563eb' : 'transparent'};
  color: ${props => props.isActive ? '#fff' : '#888'};

  &:hover {
    background: ${props => props.isActive ? '#1d4ed8' : '#333'};
    color: #fff;
  }
`;

const TasksContainer = styled.div`
  background: #2a2a2a;
  border-radius: 6px;
  padding: 1rem;
`;

const TasksHeader = styled.h3`
  color: #fff;
  font-size: 1rem;
  margin-bottom: 0.75rem;
  font-weight: 500;
`;

const TasksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #333;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #666;
    border-radius: 3px;
  }
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  background: #333;
  border-radius: 4px;

  &:hover {
    background: #404040;
  }
`;

const TaskTime = styled.span`
  color: #888;
  font-size: 0.85rem;
  min-width: 100px;
`;

const TaskTitle = styled.span`
  color: #fff;
  font-size: 0.9rem;
`;
export default AISchedulingOverlay;