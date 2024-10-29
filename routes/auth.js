const express = require('express');
const bcrypt = require('bcrypt'); 
const User = require('../models/User');

const router = express.Router();

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

module.exports = router;

