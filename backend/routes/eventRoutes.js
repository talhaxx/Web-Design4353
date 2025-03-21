const express = require('express');
const router = express.Router();
const db = require('../db');

// Create an Event
router.post('/create', (req, res) => {
    const { eventName, description, location, skillsRequired, urgency, eventDate } = req.body;

    db.query(
        'INSERT INTO EventDetails (EventName, Description, Location, RequiredSkills, Urgency, EventDate) VALUES (?, ?, ?, ?, ?, ?)',
        [eventName, description, location, skillsRequired, urgency, eventDate],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });
            res.status(201).json({ message: 'Event created successfully', eventId: result.insertId });
        }
    );
});

// Get All Events
router.get('/', (req, res) => {
    db.query('SELECT * FROM EventDetails', (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.json(results);
    });
});

module.exports = router;
