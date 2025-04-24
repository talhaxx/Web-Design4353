import React, { useState, useEffect } from "react";
import { fetchEvents, matchVolunteers, assignVolunteer, sendNotification } from "../services/api";
import './VolunteerMatching.css';

const VolunteerMatching = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState("");
    const [matchedVolunteers, setMatchedVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Function to load events
    const loadEvents = async () => {
        try {
            setLoading(true);
            setError("");
            console.log("Fetching events...");
            const response = await fetchEvents();
            console.log("Fetched events:", response.data);
            
            if (response.data && Array.isArray(response.data)) {
                setEvents(response.data);
                
                if (response.data.length === 0) {
                    setError("No events found. Please create an event first.");
                }
            } else {
                throw new Error("Invalid response format");
            }
        } catch (err) {
            console.error("Error loading events:", err);
            setError("Failed to load events. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch events on component load
    useEffect(() => {
        loadEvents();
    }, []);

    // Find matching volunteers when an event is selected
    const handleEventSelect = async (eventId) => {
        if (!eventId) {
            setMatchedVolunteers([]);
            setSelectedEvent("");
            return;
        }

        try {
            setLoading(true);
            setSelectedEvent(eventId);
            setError("");
            
            console.log("Finding matches for event:", eventId);
            
            // Get matched volunteers from API with improved error handling
            try {
                const response = await matchVolunteers(eventId);
                console.log("Matched volunteers:", response.data);
                
                if (response.data && Array.isArray(response.data)) {
                    setMatchedVolunteers(response.data);
                    
                    if (response.data.length === 0) {
                        setError("No matching volunteers found for this event.");
                    } else {
                        // Clear any previous errors if we got results
                        setError("");
                    }
                } else {
                    console.warn("Invalid response format from matchVolunteers");
                    setError("Received invalid data format from server.");
                }
            } catch (matchError) {
                console.error("Error in matchVolunteers call:", matchError);
                setError("Failed to match volunteers. Using fallback data.");
                
                // We'll still have fallback data from our enhanced matchVolunteers function
                // Just make sure we don't leave the user with an empty interface
                if (matchedVolunteers.length === 0) {
                    setMatchedVolunteers([]);
                }
            }
        } catch (err) {
            console.error("Error in handleEventSelect:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAssignVolunteer = async (eventId, volunteerId) => {
        console.log("Preparing to assign volunteer", volunteerId, "to event", eventId);
        
        if (!volunteerId || !eventId) {
            setError("Please select both an event and a volunteer");
            return;
        }
        
        try {
            setLoading(true);
            
            // Use the updated endpoint
            const response = await assignVolunteer(eventId, volunteerId);
            
            if (response.data.success) {
                const selectedVolunteer = matchedVolunteers.find(v => v.ID === volunteerId);
                const selectedEvent = events.find(e => e.EventID === eventId);
                
                if (selectedVolunteer && selectedEvent) {
                    // Create a server-side notification for this specific volunteer
                    try {
                        // Get the volunteer's user ID and email
                        const volunteerId = selectedVolunteer.ID;
                        const volunteerEmail = selectedVolunteer.Email;
                        const volunteerName = selectedVolunteer.FullName;
                        const eventName = selectedEvent.EventName;
                        
                        // Store notification with volunteer identifier for volunteer UI
                        const userSpecificNotifications = JSON.parse(localStorage.getItem(`notifications_${volunteerEmail}`) || "[]");
                        userSpecificNotifications.push({
                            message: `You have been assigned to event: ${eventName}`,
                            date: new Date().toISOString(),
                            read: false,
                            forVolunteer: volunteerEmail, // Store the target volunteer
                            type: "assignment"
                        });
                        
                        // Save notification specifically for this volunteer
                        localStorage.setItem(`notifications_${volunteerEmail}`, JSON.stringify(userSpecificNotifications));
                        
                        // Send notification to admin database
                        await sendNotification(
                            "admin@matchbook.com", // Admin email
                            `Volunteer ${volunteerName} has been assigned to event: ${eventName}`,
                            "assignment"
                        );
                        
                        console.log(`Notification created for volunteer: ${volunteerEmail} and admin`);
                    } catch (notifError) {
                        console.error("Error creating notification:", notifError);
                    }
                }
                
                setSuccess("Volunteer assigned successfully!");
                setTimeout(() => setSuccess(""), 3000);
                
                // Refresh matches after assignment
                await handleEventSelect(selectedEvent);
            } else {
                setError("Failed to assign volunteer. Please try again.");
            }
        } catch (err) {
            console.error("Error assigning volunteer:", err);
            setError(`Failed to assign volunteer: ${err.message || 'Unknown error'}. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getMatchScoreClass = (score) => {
        if (!score) return "";
        const percentage = Math.round(score * 100);
        if (percentage >= 80) return "match-score-high";
        if (percentage >= 50) return "match-score-medium";
        return "match-score-low";
    };

    // Function to select an event card
    const selectEventCard = (eventId) => {
        handleEventSelect(eventId);
    };

    return (
        <div className="volunteer-matching-container">
            <h2 className="volunteer-matching-title">Match & Assign Volunteers</h2>
            <p className="volunteer-matching-description">Find and assign the best volunteers for your events based on skills, location, and availability.</p>
            
            {error && (
                <div className="error-message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {error}
                    {error.includes("Failed to load events") && (
                        <button className="find-matches-btn" onClick={loadEvents}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 2v6h-6"></path>
                                <path d="M3 12a9 9 0 0 1 15-6.7l3-3"></path>
                                <path d="M3 22v-6h6"></path>
                                <path d="M21 12a9 9 0 0 1-15 6.7l-3 3"></path>
                            </svg>
                            Retry Loading Events
                        </button>
                    )}
                    {(error.includes("Failed to match volunteers") || error.includes("match volunteers")) && selectedEvent && (
                        <button className="find-matches-btn" onClick={() => handleEventSelect(selectedEvent)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 2v6h-6"></path>
                                <path d="M3 12a9 9 0 0 1 15-6.7l3-3"></path>
                                <path d="M3 22v-6h6"></path>
                                <path d="M21 12a9 9 0 0 1-15 6.7l-3 3"></path>
                            </svg>
                            Retry Matching
                        </button>
                    )}
                </div>
            )}
            {success && (
                <div className="success-message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    {success}
                </div>
            )}

            <div className="event-selection-section">
                <h3 className="event-selection-title">Select an Event</h3>
                
                {loading && events.length === 0 ? (
                    <p className="loading-text">Loading available events...</p>
                ) : (
                    <div className="events-list">
                        {events.map((event) => (
                            <div 
                                key={event.EventID} 
                                className={`event-card ${selectedEvent === event.EventID ? 'selected' : ''}`}
                                onClick={() => selectEventCard(event.EventID)}
                            >
                                <h4 className="event-name">{event.EventName}</h4>
                                <p className="event-details"><strong>Date:</strong> {formatDate(event.EventDate)}</p>
                                <p className="event-details"><strong>Location:</strong> {event.Location}</p>
                                <p className="event-details"><strong>Required Skills:</strong> {event.RequiredSkills}</p>
                                <div className={`event-urgency urgency-${event.Urgency}`}>
                                    Urgency Level: {event.Urgency}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {events.length === 0 && !loading && (
                    <div className="no-matches">
                        No events available. Please create events first.
                    </div>
                )}
            </div>

            <div className="volunteer-matches-section">
                <div className="volunteer-matches-title">
                    Matching Volunteers
                    {matchedVolunteers.length > 0 && (
                        <span className="match-count">{matchedVolunteers.length}</span>
                    )}
                </div>
                
                {loading && selectedEvent ? (
                    <p className="loading-text">Finding the best volunteer matches...</p>
                ) : selectedEvent ? (
                    matchedVolunteers.length > 0 ? (
                        <div className="volunteer-matches-list">
                            {matchedVolunteers.map((volunteer) => (
                                <div key={volunteer.ID} className="volunteer-card">
                                    <div className={`match-score ${getMatchScoreClass(volunteer.matchScore)}`}>
                                        {Math.round(volunteer.matchScore * 100)}%
                                    </div>
                                    <h4 className="volunteer-name">{volunteer.FullName}</h4>
                                    <p className="volunteer-details"><strong>Skills:</strong> {volunteer.Skills}</p>
                                    <p className="volunteer-details"><strong>Location:</strong> {volunteer.City}, {volunteer.State}</p>
                                    
                                    {volunteer.Skills && (
                                        <div className="matching-skills">
                                            {volunteer.Skills.split(',').map((skill, index) => (
                                                <span 
                                                    key={index} 
                                                    className={`skill-tag ${events.find(e => e.EventID.toString() === selectedEvent)?.RequiredSkills.includes(skill.trim()) ? 'matching-skill' : ''}`}
                                                >
                                                    {skill.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    
                                    <button 
                                        className="assign-btn"
                                        onClick={() => handleAssignVolunteer(selectedEvent, volunteer.ID)}
                                        disabled={loading}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        Assign to Event
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-matches">
                            No matching volunteers found for this event.
                            <p>Try selecting a different event or adjusting the required skills.</p>
                        </div>
                    )
                ) : (
                    <div className="no-matches">
                        Please select an event to see matching volunteers.
                    </div>
                )}
                
                {selectedEvent && !loading && (
                    <button 
                        className="find-matches-btn"
                        onClick={() => handleEventSelect(selectedEvent)}
                        disabled={loading}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        Refresh Matches
                    </button>
                )}
            </div>
        </div>
    );
};

export default VolunteerMatching;

