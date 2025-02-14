import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(() => {
        // Load profile data from localStorage
        const storedProfile = localStorage.getItem("profile");
        return storedProfile ? JSON.parse(storedProfile) : {
            fullName: "",
            address1: "",
            address2: "",
            city: "",
            state: "",
            zip: "",
            skills: [],
            preferences: "",
            availability: []
        };
    });

    const [availableDates, setAvailableDates] = useState([]);

    const states = ["TX", "CA", "NY", "FL", "IL", "LA"]; // Add more as needed
    const skillsList = ["First Aid", "Packing", "Assisting", "Event Management"];

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSkillChange = (e) => {
        const selectedSkills = Array.from(e.target.selectedOptions, option => option.value);
        setProfile({ ...profile, skills: selectedSkills });
    };

    const handleAvailabilityChange = (date) => {
        setAvailableDates([...availableDates, date]);
        setProfile({ ...profile, availability: [...availableDates, date] });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!profile.fullName || !profile.address1 || !profile.city || !profile.state || !profile.zip || profile.skills.length === 0 || availableDates.length === 0) {
            alert("Please fill in all required fields!");
            return;
        }
        localStorage.setItem("profile", JSON.stringify(profile));
        alert("Profile saved!");
    };

    return (
        <div>
            <h2>Profile Management</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="fullName" placeholder="Full Name" value={profile.fullName} onChange={handleChange} required />
                <input type="text" name="address1" placeholder="Address 1" value={profile.address1} onChange={handleChange} required />
                <input type="text" name="address2" placeholder="Address 2 (Optional)" value={profile.address2} onChange={handleChange} />
                <input type="text" name="city" placeholder="City" value={profile.city} onChange={handleChange} required />
                
                <select name="state" value={profile.state} onChange={handleChange} required>
                    <option value="">Select State</option>
                    {states.map((state) => (
                        <option key={state} value={state}>{state}</option>
                    ))}
                </select>
                
                <input type="text" name="zip" placeholder="Zip Code" value={profile.zip} onChange={handleChange} required />

                <label>Skills (Hold Ctrl/Cmd to select multiple):</label>
                <select multiple name="skills" value={profile.skills} onChange={handleSkillChange} required>
                    {skillsList.map(skill => (
                        <option key={skill} value={skill}>{skill}</option>
                    ))}
                </select>

                <label>Preferences:</label>
                <textarea name="preferences" value={profile.preferences} onChange={handleChange} />

                <label>Availability (Select Dates):</label>
                <input type="date" onChange={(e) => handleAvailabilityChange(e.target.value)} />
                
                <button type="submit">Save Profile</button>
            </form>
        </div>
    );
};

export default Profile;
