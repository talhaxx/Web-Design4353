const express = require('express');
const router = express.Router();
const { pool, promisePool } = require('../db');

// Save or Update Profile
router.post('/profile', async (req, res) => {
    const { email, fullName, address, city, state, zip, skills, preferences, availability } = req.body;

    try {
        // First get the UserID from UserCredentials
        const [userResults] = await promisePool.query(
            'SELECT ID FROM UserCredentials WHERE Email = ?', 
            [email]
        );
        
        if (userResults.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const userId = userResults[0].ID;
        
        // Check if profile exists
        const [profileResults] = await promisePool.query(
            'SELECT ID FROM UserProfile WHERE UserID = ?',
            [userId]
        );
        
        if (profileResults.length === 0) {
            // Insert new profile
            await promisePool.query(
                'INSERT INTO UserProfile (UserID, FullName, Address, City, State, Zipcode, Skills, Preferences, Availability) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [userId, fullName, address, city, state, zip, skills, preferences, availability]
            );
        } else {
            // Update existing profile
            await promisePool.query(
                'UPDATE UserProfile SET FullName = ?, Address = ?, City = ?, State = ?, Zipcode = ?, Skills = ?, Preferences = ?, Availability = ? WHERE UserID = ?',
                [fullName, address, city, state, zip, skills, preferences, availability, userId]
            );
        }
        
        res.status(200).json({ message: 'Profile saved successfully' });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// Fetch User Profile
router.get('/profile/:email', async (req, res) => {
    try {
        const [results] = await promisePool.query(
            'SELECT p.* FROM UserProfile p JOIN UserCredentials u ON p.UserID = u.ID WHERE u.Email = ?',
            [req.params.email]
        );
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        
        res.json(results[0]);
    } catch (err) {
        console.error('Profile fetch error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// Get all user profiles
router.get('/profiles', async (req, res) => {
    try {
        const [results] = await promisePool.query(`
            SELECT up.ID, up.UserID, up.FullName, up.Address, up.City, up.State, 
                   up.Zipcode, up.Skills, up.Preferences, up.Availability,
                   uc.Email, uc.CreatedAt
            FROM UserProfile up
            JOIN UserCredentials uc ON up.UserID = uc.ID
            ORDER BY up.FullName
        `);
        
        console.log('Fetched user profiles:', results);
        res.json(results);
    } catch (err) {
        console.error('Error fetching user profiles:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

module.exports = router;
