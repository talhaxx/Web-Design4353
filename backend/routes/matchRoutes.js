const express = require('express');
const router = express.Router();
const db = require('../db');

// Match a Volunteer to an Event
router.post('/match', (req, res) => {
    const { volunteerEmail, eventId } = req.body;

    db.query(
        'INSERT INTO VolunteerHistory (UserID, EventID) VALUES ((SELECT ID FROM UserCredentials WHERE Email = ?), ?)',
        [volunteerEmail, eventId],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });
            res.status(201).json({ message: 'Volunteer matched successfully', matchId: result.insertId });
        }
    );
});

// Get All Matches
router.get('/', (req, res) => {
    db.query(
        'SELECT VH.VolunteerID, UC.Email AS VolunteerEmail, ED.EventName FROM VolunteerHistory VH JOIN UserCredentials UC ON VH.UserID = UC.ID JOIN EventDetails ED ON VH.EventID = ED.EventID',
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });
            res.json(results);
        }
    );
});

module.exports = router;
