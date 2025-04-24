import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from "./AuthContext";
import './VolunteerHistory.css';
import { fetchVolunteerHistory } from '../services/api';

const VolunteerHistory = () => {
  const { user } = useContext(AuthContext);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Define fetchData outside useEffect so it can be reused
  const fetchData = async () => {
    setLoading(true);
    try {
      let response;
      if (user && user.role === 'volunteer') {
        response = await fetchVolunteerHistory(user.id);
      } else {
        response = await fetchVolunteerHistory();
      }
      
      console.log('Volunteer history response:', response);
      
      if (response && response.data) {
        setHistoryData(response.data);
      } else {
        throw new Error('No data received from API');
      }
    } catch (error) {
      console.error('Error fetching volunteer history:', error);
      setError('Failed to load volunteer history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Function to retry loading data
  const handleRetry = () => {
    fetchData();
  };

  // Function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Function to determine the urgency class
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
    <div className="volunteer-history-container">
      <h2 className="history-title">Volunteer History</h2>
      <p className="history-description">View all volunteer participation records and their details.</p>
      
      {error && (
        <div className="error-message">
          {error}
          <button className="retry-button" onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}
      
      {loading ? (
        <p className="loading-text">Loading volunteer history...</p>
      ) : historyData.length === 0 ? (
        <p className="no-history">No volunteer history found.</p>
      ) : (
        <div className="table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Event Name</th>
                {user?.role === 'admin' && <th>Volunteer</th>}
                <th>Location</th>
                <th>Required Skills</th>
                <th>Urgency</th>
                <th>Event Date</th>
                <th>Participation Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((entry, index) => (
                <tr key={entry.VolunteerID || index}>
                  <td>{entry.EventName}</td>
                  {user?.role === 'admin' && <td>{entry.VolunteerName || entry.VolunteerEmail || 'Unknown'}</td>}
                  <td>{entry.Location}</td>
                  <td>
                    <div className="skills-list">
                      {entry.RequiredSkills && entry.RequiredSkills.split(',').map((skill, i) => (
                        <span key={i} className="skill-tag">{skill.trim()}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`urgency-badge ${getUrgencyClass(entry.Urgency)}`}>
                      {entry.Urgency}
                    </span>
                  </td>
                  <td>{formatDate(entry.EventDate)}</td>
                  <td>{formatDate(entry.ParticipationDate)}</td>
                  <td>
                    <span className="status-badge active">
                      Participated
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VolunteerHistory;

