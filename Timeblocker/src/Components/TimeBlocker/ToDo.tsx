import React, { useState } from 'react';
import styled from 'styled-components';

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

  return (
    <TodoContainer>
      <Header>
        <h2>Task List</h2>
        <TotalDuration>Total: {calculateTotalDuration()}</TotalDuration>
      </Header>
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Add a new task..."
          />
          <Select 
            value={priority} 
            onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
          >
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </Select>
        </InputGroup>
        <InputGroup>
          <DurationInput
            type="number"
            value={duration}
            onChange={(e) => setDuration(Math.max(0, parseInt(e.target.value) || 0))}
            min="0"
            step="15"
            placeholder="Minutes"
          />
          <DateInput
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <Button type="submit">Add Task</Button>
        </InputGroup>
      </Form>
      <TodoList>
        {todos
          .sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          })
          .map(todo => (
            <TodoItem key={todo.id} priority={todo.priority}>
              <Checkbox
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleComplete(todo.id)}
              />
              <TodoContent>
                <TodoText completed={todo.completed}>{todo.text}</TodoText>
                <TodoDetails>
                  <Duration>{formatDuration(todo.duration)}</Duration>
                  {todo.dueDate && (
                    <DueDate>
                      Due: {todo.dueDate.toLocaleDateString()} {todo.dueDate.toLocaleTimeString()}
                    </DueDate>
                  )}
                </TodoDetails>
              </TodoContent>
              <PriorityBadge priority={todo.priority}>
                {todo.priority}
              </PriorityBadge>
              <DeleteButton onClick={() => deleteTodo(todo.id)}>×</DeleteButton>
            </TodoItem>
          ))}
      </TodoList>
    </TodoContainer>
  );
};

const TodoContainer = styled.div`
  background: #1a1a1a;
  padding: 1.5rem;
  border-radius: 8px;
  color: #fff;
  min-width: 300px;
  max-width: 600px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h2 {
    margin: 0;
    color: #fff;
  }
`;

const Form = styled.form`
  margin-bottom: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #333;
  border-radius: 4px;
  background: #222;
  color: #fff;

  &::placeholder {
    color: #666;
  }
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #333;
  border-radius: 4px;
  background: #222;
  color: #fff;
  cursor: pointer;

  option {
    background: #222;
    color: #fff;
  }
`;

const DurationInput = styled.input`
  width: 100px;
  padding: 0.5rem;
  border: 1px solid #333;
  border-radius: 4px;
  background: #222;
  color: #fff;
  
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    opacity: 1;
  }
`;

const DateInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #333;
  border-radius: 4px;
  background: #222;
  color: #fff;
  flex: 1;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #4285f4;
  color: #fff;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background: #357abd;
  }
`;

const TodoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TodoItem = styled.li<{ priority: string }>`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  margin: 0.5rem 0;
  background: ${({ priority }) => ({
    high: '#3d2626',
    medium: '#2d2d26',
    low: '#262d26'
  })[priority]};
  border-radius: 4px;
  gap: 0.75rem;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateX(4px);
  }
`;

const Checkbox = styled.input`
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
`;

const TodoContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
`;

const TodoText = styled.span<{ completed: boolean }>`
  font-size: 1rem;
  color: #fff;
  text-decoration: ${({ completed }) => completed ? 'line-through' : 'none'};
  opacity: ${({ completed }) => completed ? 0.6 : 1};
`;

const TodoDetails = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #888;
`;

const Duration = styled.span`
  color: #4285f4;
`;

const DueDate = styled.span`
  color: #888;
`;

const PriorityBadge = styled.span<{ priority: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: capitalize;
  background: ${({ priority }) => ({
    high: '#dc3545',
    medium: '#ffc107',
    low: '#28a745'
  })[priority]};
  color: ${({ priority }) => priority === 'medium' ? '#000' : '#fff'};
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const TotalDuration = styled.span`
  color: #888;
  font-size: 0.9rem;
`;

export default ToDo;