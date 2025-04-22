const express = require('express');
const router = express.Router();

// Dummy users (replace with database later)
let users = [
    { id: 1, email: 'admin@volunteer.com', password: 'password', role: 'admin' },
    { id: 2, email: 'volunteer@volunteer.com', password: 'password', role: 'volunteer' }
];

// Login Route
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ message: 'Login successful', user });
});

// Register Route
router.post('/register', (req, res) => {
    const { email, password } = req.body;
    if (users.some(u => u.email === email)) {
        return res.status(400).json({ message: 'User already exists' });
    }
    const newUser = { id: users.length + 1, email, password, role: 'volunteer' };
    users.push(newUser);
    res.status(201).json({ message: 'User registered successfully', newUser });
});

module.exports = router;
