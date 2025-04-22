const express = require('express');
const router = express.Router();

let events = [];

router.post('/create', (req, res) => {
    const { eventName, description, location, skillsRequired, urgency, eventDate } = req.body;
    const newEvent = { id: events.length + 1, eventName, description, location, skillsRequired, urgency, eventDate };
    events.push(newEvent);
    res.status(201).json({ message: 'Event created', newEvent });
});

router.get('/', (req, res) => {
    res.json(events);
});

module.exports = router;
