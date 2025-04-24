import React, { useState, useEffect } from 'react';
import { fetchAllVolunteers, fetchVolunteerHistory } from '../services/api';
import './AdminVolunteers.css';

const AdminVolunteers = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [filteredVolunteers, setFilteredVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSkill, setSelectedSkill] = useState('');
    const [uniqueSkills, setUniqueSkills] = useState([]);
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [volunteerHistory, setVolunteerHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const loadVolunteers = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Fetching volunteers data...');
            const response = await fetchAllVolunteers();
            
            // Debugging - Log the response to see what we're getting
            console.log('Volunteers API response:', response);
            
            // Check if response has data property and contains volunteers
            let volunteersData = [];
            if (response.data) {
                volunteersData = Array.isArray(response.data) 
                    ? response.data 
                    : response.data.volunteers || [];
            } else if (Array.isArray(response)) {
                volunteersData = response;
            }
            
            console.log('Processed volunteers data:', volunteersData);
            
            // If still no data, try fetching from UserProfile table directly
            if (volunteersData.length === 0) {
                try {
                    // Fetch directly from UserProfile
                    const userProfileResponse = await fetch('http://localhost:5001/api/users/profiles');
                    const profileData = await userProfileResponse.json();
                    console.log('User profile data:', profileData);
                    
                    if (Array.isArray(profileData) && profileData.length > 0) {
                        volunteersData = profileData;
                    }
                } catch (profileError) {
                    console.error('Error fetching user profiles:', profileError);
                }
            }
            
            // Check if data is empty
            if (volunteersData.length === 0) {
                console.warn('No volunteers found in API response.');
                setError('No volunteers found in the database.');
            }
            
            setVolunteers(volunteersData);
            setFilteredVolunteers(volunteersData);
            
            // Extract unique skills
            const skills = new Set();
            volunteersData.forEach(volunteer => {
                if (volunteer.Skills) {
                    volunteer.Skills.split(',').forEach(skill => {
                        skills.add(skill.trim());
                    });
                }
            });
            setUniqueSkills(Array.from(skills).sort());
        } catch (err) {
            console.error('Error fetching volunteers:', err);
            setError('Failed to load volunteers. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVolunteers();
    }, []);

    useEffect(() => {
        // Filter volunteers based on search term and selected skill
        let results = volunteers;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            results = results.filter(volunteer => 
                (volunteer.FullName && volunteer.FullName.toLowerCase().includes(term)) ||
                (volunteer.Email && volunteer.Email.toLowerCase().includes(term)) ||
                (volunteer.City && volunteer.City.toLowerCase().includes(term)) ||
                (volunteer.State && volunteer.State.toLowerCase().includes(term))
            );
        }

        if (selectedSkill) {
            results = results.filter(volunteer => 
                volunteer.Skills && volunteer.Skills.split(',')
                    .map(skill => skill.trim())
                    .includes(selectedSkill)
            );
        }

        setFilteredVolunteers(results);
    }, [searchTerm, selectedSkill, volunteers]);

    const handleVolunteerSelect = async (volunteer) => {
        try {
            setSelectedVolunteer(volunteer);
            setHistoryLoading(true);
            setError('');
            
            console.log(`Fetching history for volunteer ID: ${volunteer.ID}`);
            const response = await fetchVolunteerHistory(volunteer.ID);
            console.log('Volunteer history response:', response);
            
            // Handle different response structures
            const historyData = response.data || response || [];
            setVolunteerHistory(historyData);
        } catch (err) {
            console.error('Error fetching volunteer history:', err);
            setError('Failed to load volunteer history. Please try again.');
            setVolunteerHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    const clearSelectedVolunteer = () => {
        setSelectedVolunteer(null);
        setVolunteerHistory([]);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getUrgencyClass = (urgency) => {
        if (typeof urgency === 'number') {
            switch (urgency) {
                case 5: return 'urgency-5';
                case 4: return 'urgency-4';
                case 3: return 'urgency-3';
                case 2: return 'urgency-2';
                case 1: return 'urgency-1';
                default: return '';
            }
        } else {
            switch (urgency) {
                case 'High': return 'urgency-4';
                case 'Medium': return 'urgency-3';
                case 'Low': return 'urgency-2';
                default: return '';
            }
        }
    };

    return (
        <div className="admin-volunteers-container">
            <h2 className="page-title">Volunteer History</h2>
            
            {error && (
                <div className="error-message">
                    {error}
                    {error.includes('Failed to load') && (
                        <button className="retry-button" onClick={loadVolunteers}>
                            Retry
                        </button>
                    )}
                </div>
            )}
            
            {!selectedVolunteer ? (
                <>
                    <div className="filters-container">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search by name, email, or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        
                        <div className="filter-container">
                            <select
                                value={selectedSkill}
                                onChange={(e) => setSelectedSkill(e.target.value)}
                                className="skill-filter"
                            >
                                <option value="">All Skills</option>
                                {uniqueSkills.map((skill, index) => (
                                    <option key={index} value={skill}>{skill}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <p className="loading-text">Loading volunteers...</p>
                        </div>
                    ) : filteredVolunteers.length === 0 ? (
                        <div className="no-results">
                            <p>No volunteers found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="volunteers-grid">
                            {filteredVolunteers.map(volunteer => (
                                <div 
                                    key={volunteer.ID || volunteer.id} 
                                    className="volunteer-card"
                                    onClick={() => handleVolunteerSelect(volunteer)}
                                >
                                    <h3 className="volunteer-name">{volunteer.FullName || volunteer.name}</h3>
                                    <div className="volunteer-details">
                                        <p><strong>Email:</strong> {volunteer.Email || volunteer.email}</p>
                                        <p><strong>Location:</strong> {
                                            (volunteer.City && volunteer.State) 
                                                ? `${volunteer.City}, ${volunteer.State}`
                                                : volunteer.location || 'Unknown'
                                        }</p>
                                        <p><strong>Skills:</strong> {volunteer.Skills || volunteer.skills?.join(', ') || 'Not specified'}</p>
                                        <p><strong>Availability:</strong> {volunteer.Availability || volunteer.availability || 'Not specified'}</p>
                                    </div>
                                    <div className="card-overlay">
                                        <span>View Details</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="volunteer-detail-container">
                    <div className="back-button-container">
                        <button 
                            className="back-button"
                            onClick={clearSelectedVolunteer}
                        >
                            ← Back to All Volunteers
                        </button>
                    </div>
                    
                    <div className="volunteer-profile">
                        <h3 className="volunteer-detail-name">{selectedVolunteer.FullName || selectedVolunteer.name}</h3>
                        <div className="volunteer-detail-info">
                            <div className="info-section">
                                <p><strong>Email:</strong> {selectedVolunteer.Email || selectedVolunteer.email}</p>
                                <p><strong>Phone:</strong> {selectedVolunteer.Phone || selectedVolunteer.phone || 'Not provided'}</p>
                                <p><strong>Location:</strong> {
                                    (selectedVolunteer.City && selectedVolunteer.State) 
                                        ? `${selectedVolunteer.City}, ${selectedVolunteer.State}`
                                        : selectedVolunteer.location || 'Unknown'
                                }</p>
                                <p><strong>Zipcode:</strong> {selectedVolunteer.Zipcode || selectedVolunteer.zipcode || 'Not provided'}</p>
                            </div>
                            <div className="info-section">
                                <p><strong>Skills:</strong> {selectedVolunteer.Skills || (selectedVolunteer.skills && selectedVolunteer.skills.join(', ')) || 'Not specified'}</p>
                                <p><strong>Availability:</strong> {selectedVolunteer.Availability || selectedVolunteer.availability || 'Not specified'}</p>
                                <p><strong>Preferences:</strong> {selectedVolunteer.Preferences || selectedVolunteer.preferences || 'Not specified'}</p>
                                <p><strong>Joined:</strong> {
                                    (selectedVolunteer.CreatedAt || selectedVolunteer.joinDate) 
                                        ? formatDate(selectedVolunteer.CreatedAt || selectedVolunteer.joinDate) 
                                        : 'Unknown'
                                }</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="volunteer-history-section">
                        <h3>Volunteer History</h3>
                        
                        {historyLoading ? (
                            <p className="loading-text">Loading history...</p>
                        ) : error && error.includes('history') ? (
                            <div className="error-message">
                                {error}
                                <button 
                                    className="retry-button" 
                                    onClick={() => handleVolunteerSelect(selectedVolunteer)}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : volunteerHistory.length === 0 ? (
                            <p className="no-history">No volunteer history found for this volunteer.</p>
                        ) : (
                            <div className="table-container">
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th>Event Name</th>
                                            <th>Location</th>
                                            <th>Skills Required</th>
                                            <th>Urgency</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {volunteerHistory.map((event, index) => (
                                            <tr key={index}>
                                                <td>{event.EventName}</td>
                                                <td>{event.Location}</td>
                                                <td>{event.RequiredSkills}</td>
                                                <td>
                                                    <span className={getUrgencyClass(event.Urgency)}>
                                                        {typeof event.Urgency === 'number' 
                                                            ? event.Urgency
                                                            : event.Urgency || 'Unknown'
                                                        }
                                                    </span>
                                                </td>
                                                <td>{formatDate(event.EventDate || event.ParticipationDate)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVolunteers; 