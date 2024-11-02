// routes/user.js
const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models/User');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching user profiles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/profile', async (req, res) => {
    const { name, email, avatar, currentPassword, newPassword } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const hashedNewPassword = newPassword ? await bcrypt.hash(newPassword, 10) : user.password;

        user.name = name;
        user.email = email;
        user.avatar = avatar;
        user.password = hashedNewPassword;

        await user.save();

        res.status(200).json(user);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
