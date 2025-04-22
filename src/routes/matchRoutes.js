const express = require('express');
const router = express.Router();

let matches = [];

router.post('/match', (req, res) => {
    const { volunteerName, matchedEvent } = req.body;
    const match = { id: matches.length + 1, volunteerName, matchedEvent };
    matches.push(match);
    res.status(201).json({ message: 'Match created', match });
});

router.get('/', (req, res) => {
    res.json(matches);
});

module.exports = router;
