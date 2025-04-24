const express = require('express');
const router = express.Router();
const { pool, promisePool } = require('../db');

// Send a Notification
router.post('/send', async (req, res) => {
    const { email, message, type = 'general' } = req.body;
    
    if (!email || !message) {
        return res.status(400).json({ message: 'Email and message are required' });
    }

    try {
        // Get user ID from email
        const [userResults] = await promisePool.query(
            'SELECT ID FROM UserCredentials WHERE Email = ?',
            [email]
        );
        
        if (userResults.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const userId = userResults[0].ID;
        
        // Insert notification with type
        const [result] = await promisePool.query(
            'INSERT INTO Notifications (UserID, Message, Type) VALUES (?, ?, ?)',
            [userId, message, type]
        );
        
        res.status(201).json({ 
            message: 'Notification sent successfully', 
            notificationId: result.insertId 
        });
    } catch (err) {
        console.error('Error sending notification:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// Get Notifications for a User
router.get('/:email', async (req, res) => {
    try {
        const [results] = await promisePool.query(
            `SELECT n.NotificationID, n.Message, n.IsRead, n.CreatedAt 
             FROM Notifications n 
             JOIN UserCredentials uc ON n.UserID = uc.ID 
             WHERE uc.Email = ? 
             ORDER BY n.CreatedAt DESC`,
            [req.params.email]
        );
        
        // Add default type for backward compatibility
        const resultsWithType = results.map(notification => ({
            ...notification,
            Type: 'general' // Add default type
        }));
        
        res.json(resultsWithType);
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// Mark a notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const notificationId = req.params.id;
        
        const [result] = await promisePool.query(
            'UPDATE Notifications SET IsRead = 1 WHERE NotificationID = ?',
            [notificationId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.json({ message: 'Notification marked as read' });
    } catch (err) {
        console.error('Error marking notification as read:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// Get unread notification count for a user
router.get('/count/:email', async (req, res) => {
    try {
        const [results] = await promisePool.query(
            `SELECT COUNT(*) as unreadCount 
             FROM Notifications n 
             JOIN UserCredentials uc ON n.UserID = uc.ID 
             WHERE uc.Email = ? AND n.IsRead = 0`,
            [req.params.email]
        );
        
        res.json({ unreadCount: results[0].unreadCount });
    } catch (err) {
        console.error('Error counting notifications:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

module.exports = router;
