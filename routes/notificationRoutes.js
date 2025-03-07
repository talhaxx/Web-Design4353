const express = require('express');
const router = express.Router();

let notifications = [];

router.post('/send', (req, res) => {
    const { email, message } = req.body;
    notifications.push({ email, message });
    res.status(201).json({ message: 'Notification sent' });
});

router.get('/:email', (req, res) => {
    const userNotifications = notifications.filter(n => n.email === req.params.email);
    res.json(userNotifications);
});

module.exports = router;
