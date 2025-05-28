import React, { useState } from 'react';
import styled from 'styled-components';
import Calendar from "../TimeBlocker/Calendar";
import ToDo from "../TimeBlocker/ToDo";
import Navbar from "../Navbar";
import AnalyticsDashboard from '../TimeBlocker/Analytics';

// Mock user data - replace with actual authentication data
const mockUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: undefined // or provide avatar URL
};

const HomePage = () => {
  // Changed default from 'tasks' to 'calendar'
  const [activeSection, setActiveSection] = useState<string>('calendar');
  const [events, setEvents] = useState<any[]>([]); // Replace 'any' with proper CalendarEvent type

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const handleLogout = () => {
    // Implement logout logic here
    console.log('User logged out');
    // Redirect to login page or clear user session
  };

  const handleEventAdd = (event: any) => {
    setEvents(prev => [...prev, event]);
  };

  const handleEventUpdate = (updatedEvent: any) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  };

  const handleEventDelete = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'tasks':
        return (
          <ToDo 
            events={events}
            onEventAdd={handleEventAdd}
            onEventUpdate={handleEventUpdate}
            onEventDelete={handleEventDelete}
          />
        );
      case 'calendar':
        return (
          <Calendar 
            events={events}
            onEventAdd={handleEventAdd}
            onEventUpdate={handleEventUpdate}
            onEventDelete={handleEventDelete}
          />
        );
      case 'analytics':
        return (
          <AnalyticsDashboard 
            events={events}
          />
        );
      default:
        // Changed default case to show calendar instead of tasks
        return (
          <Calendar 
            events={events}
            onEventAdd={handleEventAdd}
            onEventUpdate={handleEventUpdate}
            onEventDelete={handleEventDelete}
          />
        );
    }
  };

  return (
    <PageContainer>
      <Navbar 
        user={mockUser}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onLogout={handleLogout}
      />
      <MainContent>
        <ContentWrapper>
          {renderActiveSection()}
        </ContentWrapper>
      </MainContent>
    </PageContainer>
  );
};

// Styled Components - Updated for full width
const PageContainer = styled.main`
  min-height: 100vh;
  width: 100vw;
  background: #0f0f0f;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
`;

const MainContent = styled.section`
  flex: 1;
  width: 100%;
  padding: 1.0rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1400px;
  display: flex;
  justify-content: center;
`;

export default HomePage;