import React, { useState } from "react";

const EventManagement = () => {
    const [event, setEvent] = useState({
        eventName: "",
        eventDescription: "",
        location: "",
        requiredSkills: [],
        urgency: "",
        eventDate: ""
    });

    const urgencyLevels = ["Low", "Medium", "High"];
    const skillsList = ["First Aid", "Packing", "Assisting", "Event Management"];

    const handleChange = (e) => {
        setEvent({ ...event, [e.target.name]: e.target.value });
    };

    const handleSkillChange = (e) => {
        const selectedSkills = Array.from(e.target.selectedOptions, option => option.value);
        setEvent({ ...event, requiredSkills: selectedSkills });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!event.eventName || !event.eventDescription || !event.location || event.requiredSkills.length === 0 || !event.urgency || !event.eventDate) {
            alert("Please fill all required fields!");
            return;
        }

        const existingEvents = JSON.parse(localStorage.getItem("events")) || [];
        const updatedEvents = [...existingEvents, event];
        localStorage.setItem("events", JSON.stringify(updatedEvents));

        alert("Event Created!");
    };

    return (
        <div>
            <h2>Event Management</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="eventName" placeholder="Event Name" value={event.eventName} onChange={handleChange} required />
                <textarea name="eventDescription" placeholder="Event Description" value={event.eventDescription} onChange={handleChange} required />
                <input type="text" name="location" placeholder="Location" value={event.location} onChange={handleChange} required />

                <label>Required Skills (Hold Ctrl/Cmd to select multiple):</label>
                <select multiple name="requiredSkills" value={event.requiredSkills} onChange={handleSkillChange} required>
                    {skillsList.map(skill => (
                        <option key={skill} value={skill}>{skill}</option>
                    ))}
                </select>

                <label>Urgency:</label>
                <select name="urgency" value={event.urgency} onChange={handleChange} required>
                    <option value="">Select Urgency</option>
                    {urgencyLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                    ))}
                </select>

                <label>Event Date:</label>
                <input type="date" name="eventDate" value={event.eventDate} onChange={handleChange} required />

                <button type="submit">Create Event</button>
            </form>
        </div>
    );
};

export default EventManagement;
