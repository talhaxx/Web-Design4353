const express = require('express');
const router = express.Router();
const { pool, promisePool } = require('../db');

// Get All Events
router.get('/', async (req, res) => {
    try {
        const [results] = await promisePool.query('SELECT * FROM EventDetails ORDER BY EventDate DESC');
        res.json(results);
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// Get Event by ID
router.get('/:id', async (req, res) => {
    try {
        const [results] = await promisePool.query(
            'SELECT * FROM EventDetails WHERE EventID = ?',
            [req.params.id]
        );
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        res.json(results[0]);
    } catch (err) {
        console.error('Error fetching event:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// Create Event
router.post('/create', async (req, res) => {
    const { name, description, location, requiredSkills, urgency, eventDate } = req.body;
    
    // Validate inputs
    if (!name || !description || !location || !requiredSkills || !urgency || !eventDate) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    
    try {
        const [result] = await promisePool.query(
            'INSERT INTO EventDetails (EventName, Description, Location, RequiredSkills, Urgency, EventDate) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, location, requiredSkills, urgency, eventDate]
        );
        
        res.status(201).json({ 
            message: 'Event created successfully', 
            eventId: result.insertId 
        });
    } catch (err) {
        console.error('Error creating event:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// Update Event
router.put('/:id', async (req, res) => {
    const { name, description, location, requiredSkills, urgency, eventDate } = req.body;
    const eventId = req.params.id;
    
    // Validate inputs
    if (!name || !description || !location || !requiredSkills || !urgency || !eventDate) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    
    try {
        const [result] = await promisePool.query(
            'UPDATE EventDetails SET EventName = ?, Description = ?, Location = ?, RequiredSkills = ?, Urgency = ?, EventDate = ? WHERE EventID = ?',
            [name, description, location, requiredSkills, urgency, eventDate, eventId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        res.json({ message: 'Event updated successfully' });
    } catch (err) {
        console.error('Error updating event:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// Delete Event
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await promisePool.query(
            'DELETE FROM EventDetails WHERE EventID = ?',
            [req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

module.exports = router;
