import React, { useState, useEffect } from "react";
import './VolunteerMatching.css'; // Import the CSS file

const VolunteerMatching = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [matchedEvents, setMatchedEvents] = useState([]);

    useEffect(() => {
        const storedVolunteers = JSON.parse(localStorage.getItem("volunteers")) || [];
        const storedEvents = JSON.parse(localStorage.getItem("events")) || [];
        setVolunteers(storedVolunteers);
        setEvents(storedEvents);
    }, []);

    const handleVolunteerSelect = (email) => {
        const volunteer = volunteers.find(v => v.email === email);
        setSelectedVolunteer(volunteer);

        // Match events based on skills
        if (volunteer) {
            const matched = events.filter(event => 
                event.requiredSkills.some(skill => volunteer.skills.includes(skill))
            );
            setMatchedEvents(matched);
        }
    };

    const handleMatchVolunteer = (eventName) => {
        if (!selectedVolunteer) {
            alert("Select a volunteer first.");
            return;
        }

        alert(`${selectedVolunteer.fullName} assigned to ${eventName}`);
    };

    return (
        <div className="volunteer-matching-container">
            <h2>Volunteer Matching</h2>

            <div className="volunteer-dropdown">
                <label>Select a Volunteer:</label>
                <select onChange={(e) => handleVolunteerSelect(e.target.value)}>
                    <option value="">Select a Volunteer</option>
                    {volunteers.map((vol) => (
                        <option key={vol.email} value={vol.email}>{vol.fullName}</option>
                    ))}
                </select>
            </div>

            {selectedVolunteer && (
                <div className="volunteer-card">
                    <h3>Volunteer: {selectedVolunteer.fullName}</h3>
                    <p>Skills: {selectedVolunteer.skills.join(", ")}</p>

                    <div className="matching-events">
                        <h3>Matching Events:</h3>
                        <select onChange={(e) => handleMatchVolunteer(e.target.value)}>
                            <option value="">Select an Event</option>
                            {matchedEvents.map((event) => (
                                <option key={event.eventName} value={event.eventName}>
                                    {event.eventName} - Required Skills: {event.requiredSkills.join(", ")}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VolunteerMatching;
