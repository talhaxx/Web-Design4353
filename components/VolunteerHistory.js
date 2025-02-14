import React from 'react';
import './VolunteerHistory.css'; // Import the CSS file

const VolunteerHistory = () => {
  // Sample volunteer history data
  const historyData = [
    {
      id: 1,
      eventName: 'Community Kitchen',
      eventDescription: 'Cooking meals for the homeless',
      location: 'Local Shelter',
      urgency: 'High',
      eventDate: '2025-03-15',
      participationStatus: 'Completed'
    },
    // Add more records as needed
  ];

  // Function to determine the urgency class
  const getUrgencyClass = (urgency) => {
    switch (urgency) {
      case 'High':
        return 'urgency-high';
      case 'Medium':
        return 'urgency-medium';
      case 'Low':
        return 'urgency-low';
      default:
        return '';
    }
  };

  return (
    <div className="volunteer-history-container">
      <h2>Volunteer History</h2>
      <table>
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Description</th>
            <th>Location</th>
            <th>Urgency</th>
            <th>Event Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {historyData.map(entry => (
            <tr key={entry.id}>
              <td>{entry.eventName}</td>
              <td>{entry.eventDescription}</td>
              <td>{entry.location}</td>
              <td>
                <span className={getUrgencyClass(entry.urgency)}>
                  {entry.urgency}
                </span>
              </td>
              <td>{entry.eventDate}</td>
              <td>{entry.participationStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VolunteerHistory;
