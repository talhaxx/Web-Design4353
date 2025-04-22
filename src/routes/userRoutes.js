const express = require('express');
const router = express.Router();

let profiles = []; // Dummy in-memory storage

// Save or Update Profile
router.post('/profile', (req, res) => {
    const { email, fullName, address1, address2, city, state, zip, skills, preferences, availability } = req.body;

    // Check if profile already exists
    let profileIndex = profiles.findIndex(p => p.email === email);
    if (profileIndex !== -1) {
        profiles[profileIndex] = { email, fullName, address1, address2, city, state, zip, skills, preferences, availability };
        return res.status(200).json({ message: "Profile updated successfully", profile: profiles[profileIndex] });
    }

    // Create new profile
    const newProfile = { email, fullName, address1, address2, city, state, zip, skills, preferences, availability };
    profiles.push(newProfile);
    res.status(201).json({ message: "Profile created successfully", profile: newProfile });
});

// Fetch User Profile
router.get('/profile/:email', (req, res) => {
    const profile = profiles.find(p => p.email === req.params.email);
    if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
});

module.exports = router;
