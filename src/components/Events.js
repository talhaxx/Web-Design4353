import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { fetchEvents } from '../services/api';
import EventCard from './EventCard';
import './Events.css';

const Events = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interestedEvents, setInterestedEvents] = useState([]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const response = await fetchEvents();
        
        if (response.data && Array.isArray(response.data)) {
          // Sort events by date (most recent first)
          const sortedEvents = [...response.data].sort((a, b) => 
            new Date(a.EventDate) - new Date(b.EventDate)
          );
          
          setEvents(sortedEvents);
        } else {
          setError('Failed to load events data');
        }
      } catch (err) {
        console.error('Error loading events:', err);
        setError('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
    
    // Load interested events from localStorage
    if (user && user.email) {
      const userSpecificKey = `notifications_${user.email}`;
      const userNotifications = JSON.parse(localStorage.getItem(userSpecificKey) || "[]");
      const interested = userNotifications
        .filter(notif => notif.type === "interest")
        .map(notif => notif.eventId);
      
      setInterestedEvents(interested);
    }
  }, [user]);
  
  const handleExpressInterest = (eventId) => {
    setInterestedEvents(prev => [...prev, eventId]);
  };

  return (
    <div className="events-container">
      <h2 className="events-title">Upcoming Events</h2>
      <p className="events-description">
        Discover volunteer opportunities in your community. Express your interest to get notified when matching begins.
      </p>
      
      {error && <div className="events-error">{error}</div>}
      
      {loading ? (
        <div className="events-loading">
          <div className="loading-spinner"></div>
          <p>Loading events...</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.length > 0 ? (
            events.map(event => (
              <EventCard
                key={event.EventID}
                event={event}
                onExpressInterest={handleExpressInterest}
                isInterested={interestedEvents.includes(event.EventID)}
              />
            ))
          ) : (
            <div className="no-events-message">
              <p>No upcoming events available at this time.</p>
              <p>Please check back later for new opportunities.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Events; 