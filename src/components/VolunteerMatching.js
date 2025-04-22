import React, { useState, useEffect } from "react";
import { fetchEvents, matchVolunteers } from "../services/api";
import './VolunteerMatching.css'; // Import the CSS file

const VolunteerMatching = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState("");
    const [matchedVolunteers, setMatchedVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Fetch events on component load
    useEffect(() => {
        const loadEvents = async () => {
            try {
                setLoading(true);
                const response = await fetchEvents();
                setEvents(response.data);
            } catch (err) {
                console.error("Error loading events:", err);
                setError("Failed to load events. Please try again.");
            } finally {
                setLoading(false);
            }
        };

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
            
            // Get matched volunteers from API
            const response = await matchVolunteers(eventId);
            
            if (response.data && Array.isArray(response.data)) {
                setMatchedVolunteers(response.data);
                
                if (response.data.length === 0) {
                    setError("No matching volunteers found for this event.");
                }
            } else {
                setError("Invalid response from server.");
            }
        } catch (err) {
            console.error("Error matching volunteers:", err);
            setError("Failed to match volunteers. Please try again.");
            setMatchedVolunteers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignVolunteer = async (volunteerId) => {
        if (!selectedEvent || !volunteerId) {
            setError("Please select both an event and a volunteer.");
            return;
        }

        try {
            setLoading(true);
            
            // Call API to assign volunteer
            await fetch(`http://localhost:5001/api/match/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventId: selectedEvent,
                    userId: volunteerId
                }),
            });
            
            setSuccess("Volunteer assigned successfully!");
            setTimeout(() => setSuccess(""), 3000);
            
            // Refresh matches after assignment
            await handleEventSelect(selectedEvent);
        } catch (err) {
            console.error("Error assigning volunteer:", err);
            setError("Failed to assign volunteer. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getMatchScore = (volunteer) => {
        if (!volunteer.matchScore) return "N/A";
        
        // Convert score to percentage
        const score = Math.round(volunteer.matchScore * 100);
        
        // Style based on score
        if (score >= 80) return <span className="high-match">{score}%</span>;
        if (score >= 50) return <span className="medium-match">{score}%</span>;
        return <span className="low-match">{score}%</span>;
    };

    return (
        <div className="volunteer-matching-container">
            <h2 className="matching-title">Volunteer Matching</h2>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="matching-content">
                <div className="event-selection">
                    <h3>Select Event</h3>
                    <p className="info-text">Choose an event to find matching volunteers based on skills, location, and availability.</p>
                    
                    <select 
                        className="event-select"
                        value={selectedEvent}
                        onChange={(e) => handleEventSelect(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">Select an Event</option>
                        {events.map((event) => (
                            <option key={event.EventID} value={event.EventID}>
                                {event.EventName} ({formatDate(event.EventDate)})
                            </option>
                        ))}
                    </select>
                    
                    {selectedEvent && (
                        <div className="selected-event-details">
                            {events.filter(e => e.EventID.toString() === selectedEvent.toString()).map(event => (
                                <div key={event.EventID} className="event-card">
                                    <h4>{event.EventName}</h4>
                                    <p><strong>Date:</strong> {formatDate(event.EventDate)}</p>
                                    <p><strong>Location:</strong> {event.Location}</p>
                                    <p><strong>Required Skills:</strong> {event.RequiredSkills}</p>
                                    <p><strong>Urgency:</strong> <span className={`urgency-level urgency-${event.Urgency}`}>{event.Urgency}</span></p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="volunteer-matches">
                    <h3>Matching Volunteers</h3>
                    {loading ? (
                        <p className="loading-text">Finding matches...</p>
                    ) : selectedEvent ? (
                        matchedVolunteers.length > 0 ? (
                            <div className="volunteer-list">
                                {matchedVolunteers.map((volunteer) => (
                                    <div key={volunteer.ID} className="volunteer-card">
                                        <div className="volunteer-info">
                                            <h4>{volunteer.FullName}</h4>
                                            <p><strong>Skills:</strong> {volunteer.Skills}</p>
                                            <p><strong>Location:</strong> {volunteer.City}, {volunteer.State}</p>
                                            <p><strong>Match Score:</strong> {getMatchScore(volunteer)}</p>
                                        </div>
                                        <button 
                                            className="assign-button"
                                            onClick={() => handleAssignVolunteer(volunteer.ID)}
                                        >
                                            Assign
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-matches">No matching volunteers found for this event.</p>
                        )
                    ) : (
                        <p className="select-prompt">Please select an event to see matching volunteers.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VolunteerMatching;

