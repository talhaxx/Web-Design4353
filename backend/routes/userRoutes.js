const express = require('express');
const router = express.Router();
const db = require('../db');

// Save or Update Profile
router.post('/profile', (req, res) => {
    const { email, fullName, address, city, state, zip, skills, preferences, availability } = req.body;

    db.query(
        'INSERT INTO UserProfile (UserID, FullName, Address, City, State, Zipcode, Skills, Preferences, Availability) VALUES ((SELECT ID FROM UserCredentials WHERE Email = ?), ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE FullName=?, Address=?, City=?, State=?, Zipcode=?, Skills=?, Preferences=?, Availability=?',
        [email, fullName, address, city, state, zip, skills, preferences, availability, fullName, address, city, state, zip, skills, preferences, availability],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });
            res.status(200).json({ message: 'Profile saved successfully' });
        }
    );
});

// Fetch User Profile
router.get('/profile/:email', (req, res) => {
    db.query(
        'SELECT * FROM UserProfile WHERE UserID = (SELECT ID FROM UserCredentials WHERE Email = ?)',
        [req.params.email],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });
            if (results.length === 0) return res.status(404).json({ message: 'Profile not found' });
            res.json(results[0]);
        }
    );
});

module.exports = router;
