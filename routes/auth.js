const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Registration Route
router.post('/register', async (req, res) => {
    const { name, email, password, role = 'user' } = req.body; // Default role is 'user'

    try {
        // Check if user with the provided username already exists
        const existingUserByName = await User.findOne({ where: { name } });
        if (existingUserByName) {
            return res.status(400).json({ message: 'Username already in use' });
        }

        // Check if user with the provided email already exists
        const existingUserByEmail = await User.findOne({ where: { email } });
        if (existingUserByEmail) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = await User.create({ name, email, password: hashedPassword, role });

        res.status(201).json({ message: 'User registered successfully', userId: newUser.user_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token, name: user.name, avatar: user.avatar }); // Include any other user data you want
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

module.exports = router;


