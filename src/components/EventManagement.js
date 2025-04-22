import React, { useState, useEffect } from "react";
import { createEvent, fetchEvents } from "../services/api";
import "./EventManagement.css"; // Import CSS file

function EventManagement() {
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState([]);
  const [urgency, setUrgency] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Available skills options - should match those in Profile.js
  const skillOptions = [
    "First Aid",
    "Cooking",
    "Logistics",
    "Driving",
    "Teaching",
    "Event Planning",
    "Technical Support",
    "Construction",
    "Medical",
    "Administration"
  ];

  // Fetch existing events
  useEffect(() => {
    const getEvents = async () => {
      try {
        setLoading(true);
        const response = await fetchEvents();
        setEvents(response.data);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    getEvents();
  }, []);

  const validateForm = () => {
    setError("");

    if (!eventName || eventName.length > 100) {
      setError("Event name is required and must be less than 100 characters");
      return false;
    }

    if (!eventDescription) {
      setError("Event description is required");
      return false;
    }

    if (!location) {
      setError("Location is required");
      return false;
    }

    if (!skills || skills.length === 0) {
      setError("At least one required skill must be selected");
      return false;
    }

    if (!urgency) {
      setError("Urgency level is required");
      return false;
    }

    if (!eventDate) {
      setError("Event date is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const eventData = {
        name: eventName,
        description: eventDescription,
        location,
        requiredSkills: skills.join(','),
        urgency: parseInt(urgency),
        eventDate
      };

      await createEvent(eventData);
      
      // Clear form fields
      setEventName("");
      setEventDescription("");
      setLocation("");
      setSkills([]);
      setUrgency("");
      setEventDate("");
      
      // Set success message
      setSuccess("Event created successfully!");
      setTimeout(() => setSuccess(""), 3000);
      
      // Refresh event list
      const response = await fetchEvents();
      setEvents(response.data);
    } catch (err) {
      console.error("Error creating event:", err);
      setError("Failed to create event. Please try again.");
    }
  };

  return (
    <div className="event-management-container">
      <h2 className="event-title">Event Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="event-content">
        <form className="event-form" onSubmit={handleSubmit}>
          <h3>Create New Event</h3>
          
          <div className="form-group">
            <label>Event Name <span className="required">*</span></label>
            <input 
              type="text" 
              value={eventName} 
              onChange={(e) => setEventName(e.target.value)} 
              placeholder="Enter Event Name"
              maxLength={100}
              required
            />
            <small>{eventName.length}/100 characters</small>
          </div>

          <div className="form-group">
            <label>Event Description <span className="required">*</span></label>
            <textarea 
              value={eventDescription} 
              onChange={(e) => setEventDescription(e.target.value)} 
              placeholder="Enter Event Description"
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label>Location <span className="required">*</span></label>
            <textarea
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              placeholder="Enter Event Location"
              rows={2}
              required
            />
          </div>

          <div className="form-group">
            <label>Required Skills <span className="required">*</span></label>
            <div className="checkbox-group">
              {skillOptions.map(skill => (
                <div key={skill} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`event-${skill}`}
                    value={skill}
                    checked={skills.includes(skill)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSkills([...skills, skill]);
                      } else {
                        setSkills(skills.filter(s => s !== skill));
                      }
                    }}
                  />
                  <label htmlFor={`event-${skill}`}>{skill}</label>
                </div>
              ))}
            </div>
            {skills.length === 0 && <small className="error-text">At least one skill is required</small>}
          </div>

          <div className="form-group">
            <label>Urgency <span className="required">*</span></label>
            <select value={urgency} onChange={(e) => setUrgency(e.target.value)} required>
              <option value="">Select Urgency</option>
              <option value="1">1 - Very Low</option>
              <option value="2">2 - Low</option>
              <option value="3">3 - Medium</option>
              <option value="4">4 - High</option>
              <option value="5">5 - Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label>Event Date <span className="required">*</span></label>
            <input 
              type="date" 
              value={eventDate} 
              onChange={(e) => setEventDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <button type="submit" className="submit-button">Create Event</button>
        </form>

        <div className="events-list">
          <h3>Existing Events</h3>
          
          {loading ? (
            <p>Loading events...</p>
          ) : events.length === 0 ? (
            <p>No events found. Create your first event!</p>
          ) : (
            <div className="events-table-container">
              <table className="events-table">
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Urgency</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(event => (
                    <tr key={event.EventID}>
                      <td>{event.EventName}</td>
                      <td>{new Date(event.EventDate).toLocaleDateString()}</td>
                      <td>{event.Location}</td>
                      <td>
                        <span className={`urgency-level urgency-${event.Urgency}`}>
                          {event.Urgency}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventManagement;
