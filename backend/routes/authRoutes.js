const express = require('express');
const router = express.Router();
const { pool } = require('../db'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register Route
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    try {
        // Check if user already exists
        pool.query('SELECT * FROM UserCredentials WHERE Email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Database error during registration:', err);
                return res.status(500).json({ message: 'Database error', error: err.message });
            }
            
            if (results.length > 0) {
                return res.status(400).json({ message: 'User already exists' });
            }

            try {
                // Hash the password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Insert into database
                pool.query('INSERT INTO UserCredentials (Email, PasswordHash) VALUES (?, ?)', 
                    [email, hashedPassword], 
                    (err, result) => {
                        if (err) {
                            console.error('Error inserting user:', err);
                            return res.status(500).json({ message: 'Error registering user', error: err.message });
                        }

                        // Default role is 'volunteer'
                        const role = 'volunteer';
                        
                        // Generate JWT token
                        const token = jwt.sign(
                            { userId: result.insertId, email, role },
                            process.env.JWT_SECRET || 'your_jwt_secret',
                            { expiresIn: '24h' }
                        );

                        res.status(201).json({ 
                            message: 'User registered successfully', 
                            user: { id: result.insertId, email, role },
                            token
                        });
                    }
                );
            } catch (hashError) {
                console.error('Error hashing password:', hashError);
                return res.status(500).json({ message: 'Error creating user', error: hashError.message });
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login Route
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        pool.query('SELECT * FROM UserCredentials WHERE Email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Database error during login:', err);
                return res.status(500).json({ message: 'Database error', error: err.message });
            }
            
            if (results.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const user = results[0];

            try {
                // Compare passwords
                const match = await bcrypt.compare(password, user.PasswordHash);
                if (!match) {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }

                // Get user role from profile table or set default
                pool.query('SELECT * FROM UserProfile WHERE UserID = ?', [user.ID], (profileErr, profileResults) => {
                    // Default role is 'volunteer' if no profile or error
                    const role = !profileErr && profileResults.length > 0 && profileResults[0].IsAdmin 
                        ? 'admin' 
                        : 'volunteer';

                    // Generate JWT token
                    const token = jwt.sign(
                        { userId: user.ID, email, role },
                        process.env.JWT_SECRET || 'your_jwt_secret',
                        { expiresIn: '24h' }
                    );

                    res.json({ 
                        message: 'Login successful', 
                        user: { id: user.ID, email, role },
                        token
                    });
                });
            } catch (compareError) {
                console.error('Password comparison error:', compareError);
                return res.status(500).json({ message: 'Authentication error', error: compareError.message });
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
