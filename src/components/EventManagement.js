import React, { useState } from "react";
import "./EventManagement.css"; // Import CSS file

function EventManagement() {
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState([]);
  const [urgency, setUrgency] = useState("");
  const [eventDate, setEventDate] = useState("");

  return (
    <div className="event-management-container">
      <h2 className="text-3xl font-bold">Event Management</h2>
      
      <form className="event-form">
        <label>Event Name</label>
        <input 
          type="text" 
          value={eventName} 
          onChange={(e) => setEventName(e.target.value)} 
          placeholder="Enter Event Name"
        />

        <label>Event Description</label>
        <textarea 
          value={eventDescription} 
          onChange={(e) => setEventDescription(e.target.value)} 
          placeholder="Enter Event Description"
        />

        <label>Location</label>
        <input 
          type="text" 
          value={location} 
          onChange={(e) => setLocation(e.target.value)} 
          placeholder="Enter Location"
        />

        <label>Required Skills</label>
        <select 
          multiple 
          value={skills} 
          onChange={(e) => setSkills([...e.target.selectedOptions].map((opt) => opt.value))}
        >
          <option value="First Aid">First Aid</option>
          <option value="Packing">Packing</option>
          <option value="Assisting">Assisting</option>
          <option value="Event Management">Event Management</option>
        </select>

        <label>Urgency</label>
        <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
          <option value="">Select Urgency</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <label>Event Date</label>
        <input 
          type="date" 
          value={eventDate} 
          onChange={(e) => setEventDate(e.target.value)}
        />

        <button type="submit" className="submit-button">Create Event</button>
      </form>
    </div>
  );
}

export default EventManagement;
