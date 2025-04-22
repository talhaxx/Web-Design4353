import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from "./AuthContext";
import axios from 'axios';
import './VolunteerHistory.css';

const VolunteerHistory = () => {
  const { user } = useContext(AuthContext);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVolunteerHistory = async () => {
      try {
        setLoading(true);
        
        let url = 'http://localhost:5001/api/match';
        
        // If user is a volunteer, only fetch their history
        if (user && user.role === 'volunteer') {
          url += `/user/${user.id}`;
        }
        
        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setHistoryData(response.data);
      } catch (err) {
        console.error('Error fetching volunteer history:', err);
        setError('Failed to load volunteer history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteerHistory();
  }, [user]);

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
      
      {error && <div className="error-message">{error}</div>}
      
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
              </tr>
            </thead>
            <tbody>
              {historyData.map(entry => (
                <tr key={entry.VolunteerID}>
                  <td>{entry.EventName}</td>
                  {user?.role === 'admin' && <td>{entry.VolunteerName || entry.VolunteerEmail}</td>}
                  <td>{entry.Location}</td>
                  <td>{entry.RequiredSkills}</td>
                  <td>
                    <span className={getUrgencyClass(entry.Urgency)}>
                      {entry.Urgency}
                    </span>
                  </td>
                  <td>{formatDate(entry.EventDate)}</td>
                  <td>{formatDate(entry.ParticipationDate)}</td>
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

