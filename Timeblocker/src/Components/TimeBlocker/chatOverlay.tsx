import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { CalendarEvent } from './types';

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  events: CalendarEvent[];
}

interface Suggestion {
  text: string;
  action?: string;
}

const ChatOverlay: React.FC<ChatOverlayProps> = ({ isOpen, onClose, events }) => {
  const [messages, setMessages] = useState<Array<{ text: string; type: 'user' | 'assistant'; suggestions?: Suggestion[] }>>([]);
  const [inputValue, setInputValue] = useState('');

  const generateSuggestions = useCallback((dayEvents: CalendarEvent[], totalTime: number): Suggestion[] => {
    const suggestions: Suggestion[] = [];

    if (totalTime > 8) {
      suggestions.push({
        text: "Consider rescheduling some tasks to another day",
        action: "reschedule"
      });
    }

    if (dayEvents.length > 5) {
      suggestions.push({
        text: "Try grouping related tasks together",
        action: "group"
      });
    }

    // Check for back-to-back meetings
    const hasBackToBackMeetings = dayEvents.some((event, index) => {
      if (index === 0) return false;
      const currentStart = new Date(event.start);
      const previousEnd = new Date(dayEvents[index - 1].end);
      return currentStart.getTime() - previousEnd.getTime() < 15 * 60 * 1000; // 15 minutes
    });

    if (hasBackToBackMeetings) {
      suggestions.push({
        text: "Add breaks between meetings for better focus",
        action: "addBreaks"
      });
    }

    return suggestions;
  }, []);

  const analyzeTasks = useCallback(() => {
    const eventsByDay = events.reduce((acc, event) => {
      const date = new Date(event.start).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(event);
      return acc;
    }, {} as Record<string, CalendarEvent[]>);

    let suggestions = 'Based on your schedule:\n\n';
    let allSuggestions: Suggestion[] = [];
    
    Object.entries(eventsByDay).forEach(([date, dayEvents]) => {
      const totalTime = dayEvents.reduce((total, event) => {
        return total + (new Date(event.end).getTime() - new Date(event.start).getTime());
      }, 0) / (1000 * 60 * 60); // Convert to hours

      suggestions += `📅 ${date}:\n`;
      suggestions += `- ${dayEvents.length} events scheduled\n`;
      suggestions += `- Total time: ${totalTime.toFixed(1)} hours\n`;
      
      const daySuggestions = generateSuggestions(dayEvents, totalTime);
      if (daySuggestions.length > 0) {
        suggestions += '\nSuggestions:\n';
        daySuggestions.forEach(suggestion => {
          suggestions += `• ${suggestion.text}\n`;
        });
        allSuggestions = [...allSuggestions, ...daySuggestions];
      }
      suggestions += '\n';
    });

    setMessages(prev => [...prev, {
      type: 'assistant',
      text: suggestions,
      suggestions: allSuggestions
    }]);
  }, [events, generateSuggestions]);

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setMessages(prev => [...prev, {
      type: 'user',
      text: `I want to ${suggestion.action}`
    }]);

    // Provide specific advice based on the suggestion action
    let response = '';
    switch (suggestion.action) {
      case 'reschedule':
        response = "To help you reschedule:\n" +
          "1. Identify non-urgent tasks\n" +
          "2. Look for free slots in the next few days\n" +
          "3. Consider task priorities\n" +
          "Would you like me to help you identify which tasks could be moved?";
        break;
      case 'group':
        response = "I can help you group related tasks:\n" +
          "1. Look for tasks with similar topics\n" +
          "2. Consider time blocks for focused work\n" +
          "3. Keep breaks between different types of tasks\n" +
          "Should we analyze your tasks to find potential groupings?";
        break;
      case 'addBreaks':
        response = "Here's how to add breaks effectively:\n" +
          "1. Add 15-minute buffers between meetings\n" +
          "2. Schedule longer breaks after 2-3 consecutive meetings\n" +
          "3. Protect your lunch hour\n" +
          "Would you like me to suggest specific break times?";
        break;
    }

    setMessages(prev => [...prev, {
      type: 'assistant',
      text: response
    }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setMessages(prev => [...prev, { type: 'user', text: inputValue }]);
    setInputValue('');
    analyzeTasks();
  };

  if (!isOpen) return null;

  return (
    <OverlayContainer>
      <Overlay onClick={onClose} />
      <ChatContent>
        <Header>
          <Title>Schedule Assistant</Title>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>
        <MessagesContainer>
          {messages.map((message, index) => (
            <MessageGroup key={index}>
              <Message type={message.type}>
                {message.text}
              </Message>
              {message.suggestions && (
                <SuggestionsContainer>
                  {message.suggestions.map((suggestion, i) => (
                    <SuggestionButton
                      key={i}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.text}
                    </SuggestionButton>
                  ))}
                </SuggestionsContainer>
              )}
            </MessageGroup>
          ))}
        </MessagesContainer>
        <Form onSubmit={handleSubmit}>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask for suggestions..."
          />
          <SendButton type="submit">Send</SendButton>
        </Form>
      </ChatContent>
    </OverlayContainer>
  );
};

// Styled components
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

const ChatContent = styled.div`
  position: relative;
  background: #1a1a1a;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  height: 80vh;
  z-index: 1001;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #333;
`;

const Title = styled.h2`
  color: #fff;
  margin: 0;
  font-size: 1.2rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Message = styled.div<{ type: 'user' | 'assistant' }>`
  padding: 0.75rem;
  border-radius: 8px;
  max-width: 80%;
  align-self: ${props => props.type === 'user' ? 'flex-end' : 'flex-start'};
  background: ${props => props.type === 'user' ? '#2563eb' : '#333'};
  color: #fff;
  white-space: pre-wrap;
`;

const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SuggestionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-left: 1rem;
`;

const SuggestionButton = styled.button`
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  color: #fff;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #333;
    border-color: #555;
  }
`;

const Form = styled.form`
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #333;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem;
  background: #333;
  border: none;
  border-radius: 4px;
  color: #fff;

  &:focus {
    outline: none;
    background: #444;
  }
`;

const SendButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #2563eb;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;

  &:hover {
    background: #1d4ed8;
  }
`;

export default ChatOverlay;