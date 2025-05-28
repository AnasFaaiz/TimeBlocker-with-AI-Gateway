import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

interface Todo {
  id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  duration: number;
  dueDate?: Date;
}

const ToDo: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [duration, setDuration] = useState<number>(30);
  const [dueDate, setDueDate] = useState<string>('');

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: inputText.trim(),
        priority,
        completed: false,
        duration,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      };
      setTodos([...todos, newTodo]);
      setInputText('');
      setDueDate('');
    }
  };

  const toggleComplete = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const calculateTotalDuration = (): string => {
    const totalMinutes = todos.reduce((acc, todo) => acc + todo.duration, 0);
    return formatDuration(totalMinutes);
  };

  const getCompletedCount = (): number => {
    return todos.filter(todo => todo.completed).length;
  };

  const getProgressPercentage = (): number => {
    if (todos.length === 0) return 0;
    return Math.round((getCompletedCount() / todos.length) * 100);
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const getOverdueTasks = (): number => {
    return todos.filter(todo => 
      todo.dueDate && 
      new Date(todo.dueDate) < new Date() && 
      !todo.completed
    ).length;
  };

  return (
    <TodoContainer>
      <Header>
        <HeaderContent>
          <Title>
            <TaskIcon>✓</TaskIcon>
            Task Manager
          </Title>
          <Subtitle>
            Good {getTimeOfDay()}! Let's get things done today
          </Subtitle>
        </HeaderContent>
      </Header>

      {/* Statistics Section */}
      <StatsSection>
        <SectionTitle>📊 Overview</SectionTitle>
        <StatsGrid>
          <StatCard variant="primary">
            <StatIcon>📋</StatIcon>
            <StatNumber>{todos.length}</StatNumber>
            <StatLabel>Total Tasks</StatLabel>
            <StatTrend>All tasks</StatTrend>
          </StatCard>
          
          <StatCard variant="success">
            <StatIcon>✅</StatIcon>
            <StatNumber>{getCompletedCount()}</StatNumber>
            <StatLabel>Completed</StatLabel>
            <StatTrend>{getProgressPercentage()}% completion rate</StatTrend>
          </StatCard>
          
          <StatCard variant="warning">
            <StatIcon>⏳</StatIcon>
            <StatNumber>{todos.length - getCompletedCount()}</StatNumber>
            <StatLabel>Pending</StatLabel>
            <StatTrend>Need attention</StatTrend>
          </StatCard>
          
          <StatCard variant="info">
            <StatIcon>⏱️</StatIcon>
            <StatNumber>{calculateTotalDuration()}</StatNumber>
            <StatLabel>Total Time</StatLabel>
            <StatTrend>Estimated duration</StatTrend>
          </StatCard>
        </StatsGrid>
      </StatsSection>

      {/* Progress Section */}
      <ProgressSection>
        <SectionTitle>🎯 Progress Overview</SectionTitle>
        <ProgressContainer>
          <ProgressCard>
            <ProgressIcon>📈</ProgressIcon>
            <ProgressContent>
              <ProgressLabel>Overall Progress</ProgressLabel>
              <ProgressBarContainer>
                <ProgressBar>
                  <ProgressFillAnimated completion={getProgressPercentage()} />
                </ProgressBar>
                <ProgressText>{getProgressPercentage()}%</ProgressText>
              </ProgressBarContainer>
            </ProgressContent>
          </ProgressCard>
          
          {getOverdueTasks() > 0 && (
            <AlertCard>
              <AlertIcon>⚠️</AlertIcon>
              <AlertContent>
                <AlertTitle>Overdue Tasks</AlertTitle>
                <AlertText>{getOverdueTasks()} tasks are past their due date</AlertText>
              </AlertContent>
            </AlertCard>
          )}
        </ProgressContainer>
      </ProgressSection>

      {/* Add Task Form */}
      <FormSection>
        <SectionTitle>➕ Add New Task</SectionTitle>
        <FormContainer>
          <Form onSubmit={handleSubmit}>
            <InputRow>
              <TaskInput
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="✨ What needs to be done?"
                required
              />
              <PrioritySelect 
                value={priority} 
                onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
              >
                <option value="high">🔥 High Priority</option>
                <option value="medium">⚡ Medium Priority</option>
                <option value="low">📝 Low Priority</option>
              </PrioritySelect>
            </InputRow>
            
            <InputRow>
              <DurationInput
                type="number"
                value={duration}
                onChange={(e) => setDuration(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                step="15"
                placeholder="Duration (min)"
              />
              <DateInput
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                title="Due date"
              />
              <AddButton type="submit">
                <ButtonIcon>+</ButtonIcon>
                Add Task
              </AddButton>
            </InputRow>
          </Form>
        </FormContainer>
      </FormSection>

      {/* Tasks List */}
      <TasksSection>
        <SectionHeader>
          <SectionTitle>📝 Your Tasks</SectionTitle>
          {todos.length > 0 && (
            <TaskCounter>{todos.length} task{todos.length !== 1 ? 's' : ''}</TaskCounter>
          )}
        </SectionHeader>

        <TodoList>
          {todos.length === 0 ? (
            <EmptyState>
              <EmptyIcon>🎯</EmptyIcon>
              <EmptyTitle>Ready to be productive?</EmptyTitle>
              <EmptyText>Add your first task to get started on your goals!</EmptyText>
              <EmptySubtext>Your journey to better productivity begins with a single task.</EmptySubtext>
            </EmptyState>
          ) : (
            todos
              .sort((a, b) => {
                if (a.completed !== b.completed) {
                  return a.completed ? 1 : -1;
                }
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
              })
              .map((todo, index) => (
                <TodoItem key={todo.id} priority={todo.priority} completed={todo.completed}>
                  <TaskCheckbox>
                    <Checkbox
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleComplete(todo.id)}
                    />
                    <CheckboxCustom checked={todo.completed}>
                      <CheckIcon>✓</CheckIcon>
                    </CheckboxCustom>
                  </TaskCheckbox>

                  <TodoContent>
                    <TodoText completed={todo.completed}>{todo.text}</TodoText>
                    <TodoMeta>
                      <MetaItem>
                        <TimeIcon>⏱️</TimeIcon>
                        <Duration>{formatDuration(todo.duration)}</Duration>
                      </MetaItem>
                      {todo.dueDate && (
                        <MetaItem>
                          <CalendarIcon>📅</CalendarIcon>
                          <DueDate overdue={todo.dueDate < new Date() && !todo.completed}>
                            {todo.dueDate.toLocaleDateString()} at {todo.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </DueDate>
                        </MetaItem>
                      )}
                    </TodoMeta>
                  </TodoContent>

                  <TaskActions>
                    <PriorityBadge priority={todo.priority}>
                      {todo.priority === 'high' ? '🔥' : todo.priority === 'medium' ? '⚡' : '📝'}
                      {todo.priority}
                    </PriorityBadge>
                    <DeleteButton onClick={() => deleteTodo(todo.id)}>
                      <DeleteIcon>🗑️</DeleteIcon>
                    </DeleteButton>
                  </TaskActions>
                </TodoItem>
              ))
          )}
        </TodoList>
      </TasksSection>
    </TodoContainer>
  );
};

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const bounce = keyframes`
  0%, 20%, 60%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  80% {
    transform: translateY(-5px);
  }
`;

const checkAnimation = keyframes`
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
`;

const progressAnimation = keyframes`
  from {
    width: 0%;
  }
  to {
    width: var(--completion);
  }
`;

// Styled Components
const TodoContainer = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border-radius: 16px;
  color: #fff;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 8px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #1f1f1f 0%, #2f2f2f 100%);
  padding: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const HeaderContent = styled.div`
  text-align: center;
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const TaskIcon = styled.span`
  font-size: 2.5rem;
  background: linear-gradient(135deg, #4285f4 0%, #1976d2 100%);
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  filter: drop-shadow(0 2px 4px rgba(66, 133, 244, 0.3));
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 1.1rem;
  color: #888;
  font-weight: 400;
`;

const StatsSection = styled.section`
  padding: 2rem;
`;

const SectionTitle = styled.h2`
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
`;

const StatCard = styled.div<{ variant: 'primary' | 'success' | 'warning' | 'info' }>`
  background: ${({ variant }) => {
    const colors = {
      primary: 'linear-gradient(135deg, rgba(66, 133, 244, 0.1) 0%, rgba(66, 133, 244, 0.05) 100%)',
      success: 'linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(40, 167, 69, 0.05) 100%)',
      warning: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)',
      info: 'linear-gradient(135deg, rgba(23, 162, 184, 0.1) 0%, rgba(23, 162, 184, 0.05) 100%)'
    };
    return colors[variant];
  }};
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid ${({ variant }) => {
    const colors = {
      primary: 'rgba(66, 133, 244, 0.2)',
      success: 'rgba(40, 167, 69, 0.2)',
      warning: 'rgba(255, 193, 7, 0.2)',
      info: 'rgba(23, 162, 184, 0.2)'
    };
    return colors[variant];
  }};
  transition: all 0.3s ease;
  animation: ${slideIn} 0.4s ease-out;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
`;

const StatIcon = styled.span`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #4285f4;
  margin-bottom: 0.25rem;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: #fff;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const StatTrend = styled.div`
  font-size: 0.8rem;
  color: #888;
  font-style: italic;
`;

const ProgressSection = styled.section`
  padding: 0 2rem 2rem 2rem;
`;

const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ProgressCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(42, 42, 42, 0.6);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
`;

const ProgressIcon = styled.span`
  font-size: 2rem;
`;

const ProgressContent = styled.div`
  flex: 1;
`;

const ProgressLabel = styled.div`
  font-size: 1rem;
  color: #fff;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const ProgressBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
`;

const ProgressFillAnimated = styled.div<{ completion: number }>`
  height: 100%;
  background: linear-gradient(90deg, #4285f4, #1976d2);
  border-radius: 6px;
  width: ${({ completion }) => completion}%;
  animation: ${progressAnimation} 1.5s ease-out;
  --completion: ${({ completion }) => completion}%;
`;

const ProgressText = styled.span`
  font-size: 1.1rem;
  font-weight: bold;
  color: #4285f4;
  min-width: 50px;
`;

const AlertCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(220, 53, 69, 0.2);
`;

const AlertIcon = styled.span`
  font-size: 1.5rem;
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.div`
  font-size: 1rem;
  color: #ff6b6b;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const AlertText = styled.div`
  font-size: 0.9rem;
  color: #888;
`;

const FormSection = styled.section`
  padding: 0 2rem 2rem 2rem;
`;

const FormContainer = styled.div`
  background: rgba(42, 42, 42, 0.6);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputRow = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
  
  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const TaskInput = styled.input`
  flex: 1;
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(42, 42, 42, 0.6);
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &::placeholder {
    color: #666;
  }

  &:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
    background: rgba(42, 42, 42, 0.8);
  }
`;

const PrioritySelect = styled.select`
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(42, 42, 42, 0.6);
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
  }

  option {
    background: #2a2a2a;
    color: #fff;
    padding: 0.5rem;
  }
`;

const DurationInput = styled.input`
  width: 140px;
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(42, 42, 42, 0.6);
  color: #fff;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    opacity: 1;
  }
`;

const DateInput = styled.input`
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(42, 42, 42, 0.6);
  color: #fff;
  font-size: 0.9rem;
  flex: 1;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
  }

  &::-webkit-calendar-picker-indicator {
    filter: invert(1);
    opacity: 0.7;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #4285f4 0%, #1976d2 100%);
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(66, 133, 244, 0.4);
  }

  &:active {
    transform: translateY(0);
    animation: ${bounce} 0.6s ease;
  }
`;

const ButtonIcon = styled.span`
  font-size: 1.2rem;
  font-weight: bold;
`;

const TasksSection = styled.section`
  padding: 0 2rem 2rem 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const TaskCounter = styled.span`
  color: #888;
  font-size: 0.9rem;
`;

const TodoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #888;
  font-weight: 600;
  font-size: 1.5rem;
`;

const EmptyText = styled.p`
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 1.1rem;
`;

const EmptySubtext = styled.p`
  margin: 0;
  color: #555;
  font-size: 0.9rem;
`;

const TodoItem = styled.div<{ priority: string; completed: boolean }>`
  display: flex;
  align-items: center;
  padding: 1.5rem;
  background: ${({ priority, completed }) => {
    if (completed) return 'rgba(42, 42, 42, 0.4)';
    return {
      high: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%)',
      medium: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)',
      low: 'linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(40, 167, 69, 0.05) 100%)'
    }[priority];
  }};
  border-radius: 12px;
  gap: 1.25rem;
  transition: all 0.3s ease;
  border: 1px solid ${({ priority, completed }) => {
    if (completed) return 'rgba(255, 255, 255, 0.05)';
    return {
      high: 'rgba(220, 53, 69, 0.2)',
      medium: 'rgba(255, 193, 7, 0.2)',
      low: 'rgba(40, 167, 69, 0.2)'
    }[priority];
  }};
  animation: ${slideIn} 0.3s ease-out;
  opacity: ${({ completed }) => completed ? 0.7 : 1};

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const TaskCheckbox = styled.div`
  position: relative;
`;

const Checkbox = styled.input`
  opacity: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 1;
`;

const CheckboxCustom = styled.div<{ checked: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid ${({ checked }) => checked ? '#4285f4' : 'rgba(255, 255, 255, 0.3)'};
  background: ${({ checked }) => checked ? '#4285f4' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #4285f4;
    box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
  }
`;

const CheckIcon = styled.span`
  color: white;
  font-weight: bold;
  font-size: 0.8rem;
  animation: ${checkAnimation} 0.3s ease;
`;

const TodoContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
`;

const TodoText = styled.span<{ completed: boolean }>`
  font-size: 1rem;
  color: #fff;
  text-decoration: ${({ completed }) => completed ? 'line-through' : 'none'};
  font-weight: 500;
  line-height: 1.4;
  word-break: break-word;
`;

const TodoMeta = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.25rem;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
`;

const TimeIcon = styled.span`
  font-size: 0.8rem;
`;

const CalendarIcon = styled.span`
  font-size: 0.8rem;
`;

const Duration = styled.span`
  color: #4285f4;
  font-weight: 500;
`;

const DueDate = styled.span<{ overdue: boolean }>`
  color: ${({ overdue }) => overdue ? '#ff6b6b' : '#888'};
  font-weight: ${({ overdue }) => overdue ? 600 : 400};
`;

const TaskActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PriorityBadge = styled.span<{ priority: string }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  background: ${({ priority }) => ({
    high: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
    medium: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
    low: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)'
  })[priority]};
  color: ${({ priority }) => priority === 'medium' ? '#000' : '#fff'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 107, 107, 0.1);
    color: #ff6b6b;
    transform: scale(1.1);
  }
`;

const DeleteIcon = styled.span`
  font-size: 1rem;
`;

export default ToDo;