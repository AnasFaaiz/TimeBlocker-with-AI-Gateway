import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API;
const SCOPES = 'https://www.googleapis.com/auth/calendar';

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
}

const HomePage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calendarId, setCalendarId] = useState<string>('primary');

  useEffect(() => {
    if (!CLIENT_ID || !API_KEY) {
        throw new Error('Missing required environment variables');
    }
    const loadGoogleAPI = () => {
      setIsLoading(true);
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = initializeGoogleCalendar;
      script.onerror = () => setError('Failed to load Google Calendar API');
      document.body.appendChild(script);
    };

    const initializeGoogleCalendar = async () => {
        try {
            await new Promise<void>((resolve) => {
              window.gapi.load('client:auth2', () => resolve());
            });
            
            await window.gapi.client.init({
              apiKey: API_KEY,
              clientId: CLIENT_ID,
              scope: SCOPES,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
            });
        
            window.gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
            updateSignInStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadGoogleAPI();
  }, []);

  const updateSignInStatus = async (signedIn: boolean) => {
    setIsSignedIn(signedIn);
    if (signedIn) {
      await fetchEvents();
    } else {
      setEvents([]);
    }
  };

  const handleSignIn = async () => {
    try {
      await window.gapi.auth2.getAuthInstance().signIn();
    } catch (error) {
      setError('Failed to sign in');
    }
  };

  const handleSignOut = async () => {
    try {
      await window.gapi.auth2.getAuthInstance().signOut();
    } catch (error) {
      setError('Failed to sign out');
    }
  };

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId,
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });
      setEvents(response.result.items);
    } catch (error) {
      setError('Error fetching events');
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTimeBlock = async (startTime: Date, endTime: Date, summary: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await window.gapi.client.calendar.events.insert({
        calendarId,
        resource: {
          summary,
          start: { dateTime: startTime.toISOString() },
          end: { dateTime: endTime.toISOString() },
        },
      });
      await fetchEvents();
    } catch (error) {
      setError('Error creating time block');
      console.error('Error creating time block:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <StyledError>
        <p>{error}</p>
        <button onClick={() => setError(null)}>Dismiss</button>
      </StyledError>
    );
  }

  return (
    <StyledHomePage>
      <div className="calendar-container">
        <div className="header">
          <h1>TimeBlocker Calendar</h1>
          {!isSignedIn ? (
            <button onClick={handleSignIn} className="auth-button" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Sign In with Google'}
            </button>
          ) : (
            <button onClick={handleSignOut} className="auth-button" disabled={isLoading}>
              Sign Out
            </button>
          )}
        </div>
        {isLoading && <div className="loading">Loading...</div>}
        {isSignedIn && !isLoading && (
          <div className="events-list">
            {events.map(event => (
              <div key={event.id} className="event-item">
                <h3>{event.summary}</h3>
                <p>
                  {new Date(event.start.dateTime).toLocaleString()} - 
                  {new Date(event.end.dateTime).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </StyledHomePage>
  );
};

const StyledHomePage = styled.div`
  .calendar-container {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .auth-button {
    padding: 0.5rem 1rem;
    background-color: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;

    &:hover:not(:disabled) {
      background-color: #357abd;
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  .loading {
    color: #666;
    margin: 2rem 0;
  }

  .events-list {
    width: 100%;
    max-width: 800px;
  }

  .event-item {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    p {
      margin: 0;
      color: #666;
    }
  }
`;

const StyledError = styled.div`
  padding: 1rem;
  margin: 1rem;
  background-color: #fee;
  border: 1px solid #faa;
  border-radius: 4px;
  color: #800;

  button {
    margin-top: 0.5rem;
    padding: 0.25rem 0.5rem;
    background-color: #800;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: #600;
    }
  }
`;

export default HomePage;