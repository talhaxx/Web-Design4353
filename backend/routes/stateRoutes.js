const express = require('express');
const router = express.Router();
const { promisePool } = require('../db');

// Get all states
router.get('/', async (req, res) => {
    try {
        const [states] = await promisePool.query('SELECT StateCode, StateName FROM States ORDER BY StateName');
        res.json(states);
    } catch (err) {
        console.error('Error fetching states:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

module.exports = router; 