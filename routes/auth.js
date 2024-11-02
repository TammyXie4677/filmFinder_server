const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Check for JWT secret
if (!process.env.JWT_SECRET) {
    console.error("JWT secret is not set");
    process.exit(1);
}

// Registration Route
router.post('/register', async (req, res) => {
    const { name, email, password, passwordConfirm, role = 'user', avatar = null } = req.body; // Default role is 'user', default avatar is null

    try {
        // Check if passwords match
        if (password !== passwordConfirm) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

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

        // Create new user with avatar
        const newUser = await User.create({ name, email, password: hashedPassword, role, avatar });

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

        res.status(200).json({ token, name: user.name, avatar: user.avatar }); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// GoogleLogin route
router.post('/google-login', async (req, res) => {
    const { email, name, avatar, googleId } = req.body;

    try {
        console.log("Received request:", req.body); // Log the request

        // Validate request
        if (!email || !name || !googleId) {
            return res.status(400).json({ message: 'Invalid request data' });
        }

        // Check if user exists
        let user = await User.findOne({ where: { email } });

        // Create new user if not exists
        if (!user) {
            user = await User.create({
                name,
                email,
                role: 'user',
                googleId,
                avatar,
            });
            console.log('User created:', user);
        } else {
            console.log('User found:', user);
        }

        // Generate token
        const token = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token, name: user.name, avatar: user.avatar });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;