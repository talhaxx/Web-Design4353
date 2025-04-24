import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { sendNotification } from '../services/api';
import './EventCard.css';

const EventCard = ({ event, onExpressInterest, isInterested }) => {
  const { user } = useContext(AuthContext);
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const handleExpressInterest = async () => {
    if (!user || !user.email) {
      alert("Please log in to express interest in this event");
      return;
    }
    
    try {
      // Store interest in localStorage for the volunteer
      const userSpecificKey = `notifications_${user.email}`;
      const userNotifications = JSON.parse(localStorage.getItem(userSpecificKey) || "[]");
      
      // Check if already expressed interest
      const alreadyExpressed = userNotifications.some(
        notif => notif.type === "interest" && notif.eventId === event.EventID
      );
      
      if (alreadyExpressed) {
        alert("You have already expressed interest in this event");
        return;
      }
      
      // Add notification for volunteer
      userNotifications.push({
        message: `You have expressed interest in the event: ${event.EventName}`,
        date: new Date().toISOString(),
        read: false,
        type: "interest",
        eventId: event.EventID
      });
      
      localStorage.setItem(userSpecificKey, JSON.stringify(userNotifications));
      
      // Send notification to admin
      await sendNotification(
        "admin@matchbook.com",
        `${user.name || user.email} has expressed interest in event: ${event.EventName}`,
        "interest"
      );
      
      if (onExpressInterest) {
        onExpressInterest(event.EventID);
      }
      
      alert("Thank you for expressing interest in this event!");
    } catch (error) {
      console.error("Error expressing interest:", error);
      alert("Failed to express interest. Please try again.");
    }
  };
  
  return (
    <div className="event-card">
      <h3 className="event-title">{event.EventName}</h3>
      <p className="event-date"><strong>Date:</strong> {formatDate(event.EventDate)}</p>
      <p className="event-location"><strong>Location:</strong> {event.Location}</p>
      <p className="event-skills"><strong>Required Skills:</strong> {event.RequiredSkills}</p>
      <div className={`event-urgency urgency-${event.Urgency}`}>
        Urgency Level: {event.Urgency}
      </div>
      
      {user && !user.isAdmin && (
        isInterested ? (
          <div className="interest-badge">
            <span>✓</span> You've expressed interest
          </div>
        ) : (
          <button 
            className="express-interest-btn"
            onClick={handleExpressInterest}
          >
            Express Interest
          </button>
        )
      )}
    </div>
  );
};

export default EventCard; 