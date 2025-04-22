const express = require('express');
const router = express.Router();
const { pool, promisePool } = require('../db');

// Get matching volunteers for an event
router.post('/:eventId', async (req, res) => {
    const eventId = req.params.eventId;
    
    try {
        // First get event details
        const [eventRows] = await promisePool.query(
            'SELECT * FROM EventDetails WHERE EventID = ?', 
            [eventId]
        );
        
        if (eventRows.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        const event = eventRows[0];
        const requiredSkills = event.RequiredSkills ? event.RequiredSkills.split(',') : [];
        
        // Find volunteers with matching skills and availability
        const [volunteerRows] = await promisePool.query(
            `SELECT up.*, uc.Email FROM UserProfile up 
             JOIN UserCredentials uc ON up.UserID = uc.ID 
             WHERE up.Availability = 1`
        );
        
        // Calculate match scores and return only volunteers with at least one matching skill
        const matchedVolunteers = volunteerRows
            .map(volunteer => {
                const volunteerSkills = volunteer.Skills ? volunteer.Skills.split(',') : [];
                
                // Count matching skills
                const matchingSkills = volunteerSkills.filter(skill => 
                    requiredSkills.includes(skill)
                );
                
                // Calculate match score (percentage of required skills matched)
                const matchScore = requiredSkills.length > 0 
                    ? matchingSkills.length / requiredSkills.length 
                    : 0;
                
                return {
                    ...volunteer,
                    matchScore
                };
            })
            .filter(volunteer => volunteer.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore); // Sort by match score descending
        
        res.json(matchedVolunteers);
    } catch (err) {
        console.error('Error finding matching volunteers:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// Assign a volunteer to an event
router.post('/assign', async (req, res) => {
    const { eventId, userId } = req.body;
    
    if (!eventId || !userId) {
        return res.status(400).json({ message: 'Event ID and User ID are required' });
    }
    
    try {
        // Check if volunteer is already assigned to this event
        const [existingAssignments] = await promisePool.query(
            'SELECT * FROM VolunteerHistory WHERE UserID = ? AND EventID = ?',
            [userId, eventId]
        );
        
        if (existingAssignments.length > 0) {
            return res.status(400).json({ message: 'Volunteer is already assigned to this event' });
        }
        
        // Assign volunteer to event
        await promisePool.query(
            'INSERT INTO VolunteerHistory (UserID, EventID, ParticipationDate) VALUES (?, ?, NOW())',
            [userId, eventId]
        );
        
        res.status(201).json({ message: 'Volunteer assigned successfully' });
    } catch (err) {
        console.error('Error assigning volunteer:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// Get all volunteer matches
router.get('/', (req, res) => {
    pool.query(
        `SELECT VH.VolunteerID, UP.FullName AS VolunteerName, ED.EventName, 
         VH.ParticipationDate, UC.Email AS VolunteerEmail
         FROM VolunteerHistory VH 
         JOIN UserProfile UP ON VH.UserID = UP.ID 
         JOIN EventDetails ED ON VH.EventID = ED.EventID
         JOIN UserCredentials UC ON UP.UserID = UC.ID
         ORDER BY VH.ParticipationDate DESC`,
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });
            res.json(results);
        }
    );
});

module.exports = router;
