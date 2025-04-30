import React from 'react';
import styled from 'styled-components';
import { CalendarEvent, SchedulingPreferences } from './types';

interface AISchedulingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (preferences: Partial<SchedulingPreferences>) => void;
  events: CalendarEvent[];
}

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
  margin: 0;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ModeSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ModeButton = styled.button<{ isActive: boolean }>`
  padding: 0.5rem 1rem;
  background: ${props => props.isActive ? '#444' : '#333'};
  border: 1px solid #444;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  flex: 1;

  &:hover {
    background: #444;
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

const TaskItem = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  background: ${props => props.isSelected ? '#444' : '#333'};
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #404040;
  }
`;

const TaskCheckbox = styled.input`
  margin: 0;
  cursor: pointer;
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

const DurationContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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
  padding: 0.5rem;
  background: #333;
  border: 1px solid #444;
  border-radius: 4px;
  color: #fff;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #666;
  }
`;

const AIPreferencesContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #2a2a2a;
  border-radius: 6px;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  background: #333;
  border: 1px solid #444;
  border-radius: 4px;
  color: #fff;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #666;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  background: #333;
  border: 1px solid #444;
  border-radius: 4px;
  color: #fff;
  font-size: 0.9rem;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #666;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  flex: 1;
`;

const CancelButton = styled(Button)`
  background: #333;
  color: #fff;

  &:hover {
    background: #444;
  }
`;

const SubmitButton = styled(Button)`
  background: #007bff;
  color: #fff;

  &:hover {
    background: #0056b3;
  }
`;

const TaskActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.25rem 0.5rem;
  background: #333;
  border: 1px solid #444;
  border-radius: 4px;
  color: #fff;
  font-size: 0.8rem;
  cursor: pointer;

  &:hover {
    background: #444;
  }
`;

const BusinessHoursContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #2a2a2a;
  border-radius: 6px;
`;

const BusinessHoursInputs = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span {
    color: #fff;
  }

  input {
    width: 60px;
  }
`;

const AISchedulingOverlay: React.FC<AISchedulingOverlayProps> = ({
  isOpen,
  onClose,
  onSubmit,
  events
}) => {
  const [schedulingMode, setSchedulingMode] = React.useState<'day' | 'week'>('day');
  const [breakDuration, setBreakDuration] = React.useState(15);
  const [slotDuration, setSlotDuration] = React.useState(30);
  const [priority, setPriority] = React.useState<'deadline' | 'duration' | 'custom'>('deadline');
  const [customPriority, setCustomPriority] = React.useState<string[]>([]);
  const [prompt, setPrompt] = React.useState('');
  const [selectedTasks, setSelectedTasks] = React.useState<Set<string>>(new Set());
  const [businessHours, setBusinessHours] = React.useState({
    startTime: 9,
    endTime: 17
  });

  const formatTasks = React.useMemo(() => {
    if (!isOpen) return [];
    
    if (schedulingMode === 'day') {
      const today = new Date().toISOString().split('T')[0];
      return events
        .filter(event => event.start.startsWith(today))
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .map(event => ({
          id: event.id,
          time: new Date(event.start).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          title: event.title,
          timestamp: new Date(event.start).getTime()
        }));
    } else {
      return events
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .map(event => {
          const date = new Date(event.start);
          return {
            id: event.id,
            time: date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            title: event.title,
            timestamp: date.getTime(),
            dayKey: date.toISOString().split('T')[0]
          };
        });
    }
  }, [events, schedulingMode, isOpen]);

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const selectAllTasks = () => {
    setSelectedTasks(new Set(formatTasks.map(task => task.id)));
  };

  const deselectAllTasks = () => {
    setSelectedTasks(new Set());
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      businessHours,
      slotDuration: slotDuration,
      breakBetweenEvents: breakDuration,
      mode: schedulingMode,
      aiPreferences: {
        prompt,
        priority,
        customPriority: priority === 'custom' ? customPriority : undefined,
        selectedTaskIds: Array.from(selectedTasks)
      }
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
              <div>
                {schedulingMode === 'day' ? "Today's Tasks" : "This Week's Tasks"}
              </div>
              <TaskActions>
                <ActionButton type="button" onClick={selectAllTasks}>Select All</ActionButton>
                <ActionButton type="button" onClick={deselectAllTasks}>Deselect All</ActionButton>
              </TaskActions>
            </TasksHeader>
            <TasksList>
              {formatTasks.map((task) => (
                <TaskItem 
                  key={task.id} 
                  isSelected={selectedTasks.has(task.id)}
                  onClick={() => toggleTaskSelection(task.id)}
                >
                  <TaskCheckbox
                    type="checkbox"
                    checked={selectedTasks.has(task.id)}
                    onChange={() => {}}
                  />
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

          <BusinessHoursContainer>
            <FormGroup>
              <Label>Business Hours</Label>
              <BusinessHoursInputs>
                <Input 
                  type="number" 
                  min="0" 
                  max="23" 
                  value={businessHours.startTime}
                  onChange={(e) => setBusinessHours(prev => ({
                    ...prev,
                    startTime: Math.min(23, Math.max(0, Number(e.target.value)))
                  }))}
                  placeholder="9" 
                />
                <span>to</span>
                <Input 
                  type="number" 
                  min="0" 
                  max="23" 
                  value={businessHours.endTime}
                  onChange={(e) => setBusinessHours(prev => ({
                    ...prev,
                    endTime: Math.min(23, Math.max(0, Number(e.target.value)))
                  }))}
                  placeholder="17" 
                />
              </BusinessHoursInputs>
            </FormGroup>
          </BusinessHoursContainer>

          <AIPreferencesContainer>
            <FormGroup>
              <Label>Scheduling Priority</Label>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'deadline' | 'duration' | 'custom')}
              >
                <option value="deadline">By Deadline</option>
                <option value="duration">By Duration</option>
                <option value="custom">Custom Order</option>
              </Select>
            </FormGroup>

            {priority === 'custom' && (
              <FormGroup>
                <Label>Custom Priority Order</Label>
                <TextArea
                  value={customPriority.join('\n')}
                  onChange={(e) => setCustomPriority(e.target.value.split('\n').filter(Boolean))}
                  placeholder="Enter task titles in priority order (one per line)"
                  rows={5}
                />
              </FormGroup>
            )}

            <FormGroup>
              <Label>Scheduling Prompt</Label>
              <TextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter scheduling instructions (e.g., 'Move these tasks to next week', 'Schedule all selected tasks in the morning')"
                rows={3}
              />
            </FormGroup>
          </AIPreferencesContainer>

          <ButtonGroup>
            <CancelButton type="button" onClick={onClose}>Cancel</CancelButton>
            <SubmitButton type="submit">Apply Scheduling</SubmitButton>
          </ButtonGroup>
        </Form>
      </OverlayContent>
    </OverlayContainer>
  );
};

export default AISchedulingOverlay;