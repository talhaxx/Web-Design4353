const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path if needed
const bcrypt = require('bcrypt');

// Register Route
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Check if user already exists
    db.query('SELECT * FROM UserCredentials WHERE Email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        if (results.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into database
        db.query('INSERT INTO UserCredentials (Email, PasswordHash) VALUES (?, ?)', [email, hashedPassword], (err, result) => {
            if (err) return res.status(500).json({ message: 'Error inserting user', error: err });

            res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
        });
    });
});

// Login Route
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM UserCredentials WHERE Email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];

        // Compare passwords
        const match = await bcrypt.compare(password, user.PasswordHash);
        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({ message: 'Login successful', userId: user.ID });
    });
});

module.exports = router;
