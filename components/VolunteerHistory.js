import React from 'react';

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

  return (
    <div className="volunteer-history-container">
      <h2>Volunteer History</h2>
      <table border="1">
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
              <td>{entry.urgency}</td>
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
