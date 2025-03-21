const express = require('express');
const router = express.Router();
const db = require('../db');

// Send a Notification
router.post('/send', (req, res) => {
    const { email, message } = req.body;

    db.query(
        'INSERT INTO Notifications (UserID, Message) VALUES ((SELECT ID FROM UserCredentials WHERE Email = ?), ?)',
        [email, message],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });
            res.status(201).json({ message: 'Notification sent successfully', notificationId: result.insertId });
        }
    );
});

// Get Notifications for a User
router.get('/:email', (req, res) => {
    db.query(
        'SELECT Message FROM Notifications WHERE UserID = (SELECT ID FROM UserCredentials WHERE Email = ?)',
        [req.params.email],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });
            res.json(results);
        }
    );
});

module.exports = router;
