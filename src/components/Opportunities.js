import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { fetchEvents, sendNotification } from "../services/api";
import "./Opportunities.css";

const Opportunities = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [sortBy, setSortBy] = useState("date");
  
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        const response = await fetchEvents();
        console.log('Events data:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
          // Filter for future events
          const now = new Date();
          const futureEvents = response.data.filter(event => {
            const eventDate = new Date(event.EventDate);
            return eventDate >= now;
          });
          
          setEvents(futureEvents);
          setFilteredEvents(futureEvents);
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        setError("Failed to load volunteer opportunities. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  useEffect(() => {
    // Apply filters
    let results = events;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(event => 
        (event.EventName && event.EventName.toLowerCase().includes(term)) ||
        (event.Location && event.Location.toLowerCase().includes(term)) ||
        (event.Description && event.Description.toLowerCase().includes(term))
      );
    }
    
    if (filterSkill) {
      results = results.filter(event => 
        event.RequiredSkills && event.RequiredSkills.toLowerCase().includes(filterSkill.toLowerCase())
      );
    }
    
    setFilteredEvents(results);
  }, [searchTerm, filterSkill, events]);

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(a.EventDate) - new Date(b.EventDate);
    } else if (sortBy === "urgency") {
      return b.Urgency - a.Urgency;
    } else if (sortBy === "name") {
      return a.EventName.localeCompare(b.EventName);
    }
    return 0;
  });
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get urgency label and color
  const getUrgencyInfo = (level) => {
    switch(parseInt(level)) {
      case 1:
        return { label: "Low", color: "#4CAF50" };
      case 2:
        return { label: "Moderate", color: "#2196F3" };
      case 3:
        return { label: "Medium", color: "#FF9800" };
      case 4:
        return { label: "High", color: "#F44336" };
      case 5:
        return { label: "Critical", color: "#D32F2F" };
      default:
        return { label: "Unknown", color: "#9E9E9E" };
    }
  };
  
  const handleExpressInterest = async (event) => {
    try {
      // Get admin email (could be fetched from a config in a real app)
      const adminEmail = "admin@matchbook.com";
      
      // Get the proper user name to display
      let userName = "";
      if (user) {
        // Try various common user name properties before falling back to email
        userName = user.displayName || user.fullName || user.name || 
                  (user.firstName ? (user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName) : null);
        
        // If no name property is found, extract name from email
        if (!userName && user.email) {
          // Extract name part from email (before the @)
          const emailName = user.email.split('@')[0];
          // Capitalize first letter of each word
          userName = emailName
            .split(/[._-]/)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
        }
      }
      
      // Create a notification for the volunteer
      await sendNotification(
        user.email,
        `You have expressed interest in the event: ${event.EventName}. The organizer will contact you soon.`,
        "interest"
      );
      
      // Create a notification for the admin
      await sendNotification(
        adminEmail,
        `${userName} has expressed interest in volunteering for "${event.EventName}".`,
        "volunteer-interest"
      );
      
      // Show success message
      setSuccessMessage(`Interest expressed in ${event.EventName}! The organizer will contact you.`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error("Error sending interest notification:", error);
      setError("Failed to express interest. Please try again later.");
      setTimeout(() => setError(''), 5000);
    }
  };
  
  return (
    <div className="opportunities-container">
      <div className="opportunities-header">
        <h1>Volunteer Opportunities</h1>
        <p>Find events that match your skills and interests</p>
      </div>
      
      {/* Success message */}
      {successMessage && (
        <div className="success-message">
          <span className="success-icon">✓</span>
          {successMessage}
        </div>
      )}
      
      {/* Error message */}
      {error && <div className="error-message">{error}</div>}
      
      <div className="filters-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, description, location or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-box">
          <input
            type="text"
            placeholder="Filter by skill..."
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
            className="filter-input"
          />
        </div>
        
        <div className="sort-options">
          <label>Sort by: </label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Date (Upcoming)</option>
            <option value="urgency">Urgency (High to Low)</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-indicator">
          <p>Loading opportunities...</p>
        </div>
      ) : sortedEvents.length === 0 ? (
        <div className="no-events">
          <p>No volunteer opportunities found. Please check back later.</p>
        </div>
      ) : (
        <div className="events-grid">
          {sortedEvents.map(event => {
            const urgencyInfo = getUrgencyInfo(event.Urgency);
            return (
              <div className="event-card" key={event.EventID}>
                <div className="event-header">
                  <h2>{event.EventName}</h2>
                  <span 
                    className="urgency-badge"
                    style={{ backgroundColor: urgencyInfo.color }}
                  >
                    {urgencyInfo.label} Urgency
                  </span>
                </div>
                
                <div className="event-date">
                  <span className="date-icon">📅</span>
                  {formatDate(event.EventDate)}
                </div>
                
                <div className="event-location">
                  <span className="location-icon">📍</span>
                  {event.Location}
                </div>
                
                <p className="event-description">{event.Description}</p>
                
                <div className="skills-needed">
                  <h3>Skills Needed:</h3>
                  <div className="skills-list">
                    {event.RequiredSkills.split(',').map((skill, index) => (
                      <span className="skill-tag" key={index}>{skill.trim()}</span>
                    ))}
                  </div>
                </div>
                
                <div className="event-actions">
                  <button 
                    className="interest-button"
                    onClick={() => handleExpressInterest(event)}
                  >
                    Express Interest
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Opportunities; 