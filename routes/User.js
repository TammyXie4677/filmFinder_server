const express = require('express');
const { User } = require('../models/User'); 
const router = express.Router();
const bcrypt = require('bcrypt'); 

// Fetch user profile
router.get('/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findByPk(userId, {
            attributes: ['email', 'avatar', 'name'] // Fetch only email, avatar, and name
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Update user profile
router.put('/:id', async (req, res) => {
    const userId = req.params.id;
    const { name, password, avatar } = req.body;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user properties
        user.name = name || user.name; 
        user.avatar = avatar || user.avatar; 

        if (password) {
            // Hash the new password before saving
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;  // Ensure you never expose this to the client
        }

        await user.save();

        // Send back a sanitized user object
        const { email, avatar: userAvatar, name: userName } = user;
        return res.status(200).json({ message: 'User updated successfully', user: { email, avatar: userAvatar, name: userName } });
    } catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;