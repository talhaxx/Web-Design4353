const express = require('express');
const router = express.Router();
const { pool, promisePool } = require('../db');

// Debug router endpoints
console.log('Match routes being initialized with these paths:');
const routeDebug = () => {
  console.log('Match routes at init:');
  router.stack.forEach((layer) => {
    if (layer.route) {
      const path = layer.route.path;
      const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(',');
      console.log(`${methods} ${path}`);
    }
  });
};
routeDebug();

// Assign a volunteer to an event
router.post('/assignVolunteer', async (req, res) => {
  console.log('✅ /assignVolunteer route hit');
  console.log('Request body:', req.body);
  const { eventId, userId } = req.body;

  if (!eventId || !userId) {
    return res.status(400).json({ success: false, message: 'Event ID and User ID are required' });
  }

  try {
    const [dbInfo] = await promisePool.query('SELECT DATABASE() AS db');
    console.log('📂 ACTIVE DATABASE FROM BACKEND:', dbInfo[0].db);

    const [existingAssignments] = await promisePool.query(
      'SELECT * FROM VolunteerHistory WHERE UserID = ? AND EventID = ?',
      [userId, eventId]
    );
    
    if (existingAssignments.length > 0) {
      return res.status(400).json({ success: false, message: 'Volunteer is already assigned to this event' });
    }

    const [eventRows] = await promisePool.query(
      'SELECT * FROM EventDetails WHERE EventID = ?',
      [eventId]
    );

    console.log('DEBUG: eventRows result:', eventRows);

    if (eventRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const [volunteerRows] = await promisePool.query(
      'SELECT * FROM UserProfile WHERE ID = ?',
      [userId]
    );
    
    if (volunteerRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    await promisePool.query(
      'INSERT INTO VolunteerHistory (UserID, EventID, ParticipationDate) VALUES (?, ?, NOW())',
      [userId, eventId]
    );

    console.log(`✅ Assigned volunteer ${userId} to event ${eventId}`);
    res.status(201).json({ success: true, message: 'Volunteer assigned successfully' });
  } catch (err) {
    console.error('Error assigning volunteer:', err);
    res.status(500).json({ success: false, message: 'Database error', error: err.message });
  }
});

// Debug assign route
router.post('/debug-assign', async (req, res) => {
  console.log('Debug assign route called with body:', req.body);
  const { eventId, userId } = req.body;

  if (!eventId || !userId) {
    return res.status(400).json({ message: 'Event ID and User ID are required' });
  }

  try {
    await promisePool.query(
      'INSERT INTO VolunteerHistory (UserID, EventID, ParticipationDate) VALUES (?, ?, NOW())',
      [userId, eventId]
    );

    console.log(`DEBUG: Successfully assigned volunteer ${userId} to event ${eventId}`);
    res.status(201).json({ success: true, message: 'Volunteer assigned successfully via debug route' });
  } catch (err) {
    console.error('Error in debug assign route:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Get volunteer history
router.get('/user/:userId?', async (req, res) => {
  try {
    let query = `
      SELECT vh.VolunteerID, up.FullName AS VolunteerName, 
             ed.EventName, ed.Description, ed.Location, ed.RequiredSkills,
             ed.Urgency, ed.EventDate, vh.ParticipationDate, 
             uc.Email AS VolunteerEmail
      FROM VolunteerHistory vh
      JOIN UserProfile up ON vh.UserID = up.ID
      JOIN EventDetails ed ON vh.EventID = ed.EventID
      JOIN UserCredentials uc ON up.UserID = uc.ID
    `;

    const params = [];

    if (req.params.userId) {
      query += ' WHERE vh.UserID = ?';
      params.push(req.params.userId);
    }

    query += ' ORDER BY vh.ParticipationDate DESC';

    const [results] = await promisePool.query(query, params);
    res.json(results);
  } catch (err) {
    console.error('Error fetching volunteer history:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Get all volunteer assignments
router.get('/', async (req, res) => {
  try {
    const [results] = await promisePool.query(
      `SELECT vh.VolunteerID, up.FullName AS VolunteerName, ed.EventName, 
              vh.ParticipationDate, uc.Email AS VolunteerEmail,
              ed.EventDate, ed.Location, ed.Description, ed.RequiredSkills, ed.Urgency
       FROM VolunteerHistory vh 
       JOIN UserProfile up ON vh.UserID = up.ID 
       JOIN EventDetails ed ON vh.EventID = ed.EventID
       JOIN UserCredentials uc ON up.UserID = uc.ID
       ORDER BY vh.ParticipationDate DESC`
    );

    res.json(results);
  } catch (err) {
    console.error('Error fetching volunteer matches:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Test route to verify routing
router.post('/test-route', (req, res) => {
  console.log('✅ /test-route route hit');
  res.json({ success: true, message: 'Test route successful' });
});

// Wildcard route for event matching - KEEP THIS AT THE END to prevent it from capturing other routes
router.post('/:eventId', async (req, res) => {
  const eventId = req.params.eventId;
  console.log(`✅ Wildcard /:eventId route hit with eventId: ${eventId}`);

  try {
    const [eventRows] = await promisePool.query(
      'SELECT * FROM EventDetails WHERE EventID = ?',
      [eventId]
    );

    if (eventRows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const event = eventRows[0];
    const requiredSkills = event.RequiredSkills ? event.RequiredSkills.split(',').map(skill => skill.trim()) : [];
    const eventDate = event.EventDate ? new Date(event.EventDate).toISOString().split('T')[0] : null;

    const [volunteerRows] = await promisePool.query(
      `SELECT up.ID, up.UserID, up.FullName, up.Address, up.City, up.State, up.Zipcode, 
              up.Skills, up.Preferences, up.Availability, uc.Email 
       FROM UserProfile up 
       JOIN UserCredentials uc ON up.UserID = uc.ID
       WHERE up.IsAdmin = 0
       AND up.ID NOT IN (
          SELECT vh.UserID FROM VolunteerHistory vh 
          WHERE vh.EventID = ?
       )`,
      [eventId]
    );

    const matchedVolunteers = volunteerRows
      .map(volunteer => {
        const volunteerSkills = volunteer.Skills ? volunteer.Skills.split(',').map(skill => skill.trim()) : [];
        let availableDates = [];

        try {
          availableDates = JSON.parse(volunteer.Availability || '[]');
        } catch (e) {
          console.error('Error parsing availability for volunteer:', volunteer.ID, e);
        }

        const isAvailable = eventDate && availableDates.includes(eventDate);
        const matchingSkills = volunteerSkills.filter(skill => requiredSkills.includes(skill));

        let matchScore = requiredSkills.length > 0
          ? matchingSkills.length / requiredSkills.length
          : 0;

        if (isAvailable) {
          matchScore = Math.min(matchScore + 0.2, 1.0);
        } else if (matchingSkills.length > 0) {
          matchScore *= 0.5;
        } else {
          matchScore = 0;
        }

        if (volunteer.City && event.Location && event.Location.includes(volunteer.City)) {
          matchScore = Math.min(matchScore + 0.1, 1.0);
        }

        return {
          ...volunteer,
          matchingSkills,
          isAvailable,
          matchScore
        };
      })
      .filter(volunteer => volunteer.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json(matchedVolunteers);
  } catch (err) {
    console.error('Error finding matching volunteers:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// IMPORTANT: Export the router
module.exports = router;
