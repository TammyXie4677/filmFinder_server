const express = require('express');
const User = require('../models/User'); 
const router = express.Router();
const bcrypt = require('bcrypt'); 

// Fetch user profile
router.get('/:id', async (req, res) => {
    const userId = req.params.id;
    console.log(`Fetching user profile for userId: ${userId}`); // Log user ID

    try {
        const user = await User.findOne({ where: { user_id: userId }, 
            attributes: ['email', 'avatar', 'name'] });

        if (!user) {
            console.log('User not found'); // Log if user is not found
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User fetched successfully:', user); // Log user data if found
        return res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error.message, error.stack);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Update user profile
router.put('/:id', async (req, res) => {
    const userId = req.params.id;
    const { name, password, avatar } = req.body; // Destructure properties from the request body

    console.log(`Updating user profile for userId: ${userId}`); // Log user ID
    console.log('Request body:', req.body); // Log request body

    try {
        const user = await User.findOne({ where: { user_id: userId } });
        
        if (!user) {
            console.log('User not found'); // Log if user is not found
            return res.status(404).json({ message: 'User not found' });
        }

        // Log the properties to be updated
        console.log('Current user data:', {
            name: user.name,
            avatar: user.avatar,
            email: user.email
        });

        // Update user properties only if they are provided in the request body
        if (name !== undefined) {
            // Check for username uniqueness
            const existingUser = await User.findOne({ where: { name } });
            if (existingUser && existingUser.user_id !== userId) {
                return res.status(400).json({ message: 'Username is already in use' });
            }
            user.name = name; // Only update if a new name is provided
        }
        
        if (avatar !== undefined) {
            user.avatar = avatar; // Only update if a new avatar is provided
        }

        if (password) {
            console.log('Updating password'); // Log if password is being updated
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword; // Never expose this to the client
        }

        await user.save(); // Save the updated user

        console.log('User updated successfully:', {
            email: user.email,
            avatar: user.avatar,
            name: user.name
        });

        // Send back a sanitized user object
        const { email, avatar: userAvatar, name: userName } = user;
        return res.status(200).json({ message: 'User updated successfully', user: { email, avatar: userAvatar, name: userName } });
    } catch (error) {
        console.error('Error updating user profile:', error); // Log error
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
