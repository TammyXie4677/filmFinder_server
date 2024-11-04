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
    const { name, email, password, passwordConfirm, role = 'user', avatar = null } = req.body;

    try {
        if (password !== passwordConfirm) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const existingUserByName = await User.findOne({ where: { name } });
        if (existingUserByName) {
            return res.status(400).json({ message: 'Username already in use' });
        }

        const existingUserByEmail = await User.findOne({ where: { email } });
        if (existingUserByEmail) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, password: hashedPassword, role, avatar });

        console.log('User registered successfully:', {
            userId: newUser.user_id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role 
        });

        return res.status(201).json({ message: 'User registered successfully', userId: newUser.user_id });
    } catch (error) {
        console.error('Registration Error:', error);
        return res.status(500).json({ message: 'Error registering user' });
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

        const token = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const response = { token, name: user.name, avatar: user.avatar, user_id: user.user_id, email: user.email, role: user.role };
        console.log('Login Response:', response); 
        return res.status(200).json(response);
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ message: 'Error logging in' });
    }
});

// GoogleLogin route
router.post('/google-login', async (req, res) => {
    const { email, name, avatar, googleId } = req.body;

    try {
        console.log("Received request for Google login:", req.body);

        // Validate request
        if (!email || !name || !googleId) {
            return res.status(400).json({ message: 'Invalid request data' });
        }

        let user = await User.findOne({ where: { email } });

        if (!user) {
            user = await User.create({
                name,
                email,
                role: 'user',
                googleId, 
                avatar,
            });
            console.log('User created:', {
                userId: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role 
            });
        } else {
            console.log('User found:', {
                userId: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role 
            });
        }

        const token = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const response = { token, name: user.name, avatar: user.avatar, user_id: user.user_id, email: user.email, role: user.role };
        console.log('Google Login Response:', response); 
        return res.status(200).json(response);
    } catch (error) {
        console.error('Google Login Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
