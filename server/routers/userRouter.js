//userRouter.js - Example of protected routes

//dependency imports
import express from 'express';
import mongoose from 'mongoose';

//middleware imports
import { authenticateToken } from '../middleware/authMiddleware.js';

//mongodb schemas import
import userSchema from '../models/userModel.js';

//mongoDB collections initiation
const User = mongoose.model('User', userSchema);

//router initiation
const router = express.Router();

// All routes in this router require authentication
router.use(authenticateToken);

// Get current user profile
router.get('/profile', async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching user profile: ' + err });
    }
});

// Update user profile
router.put('/profile', async (req, res) => {
    try {
        const { username } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { username },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.status(200).json({ 
            message: 'Profile updated successfully',
            user 
        });
    } catch (err) {
        res.status(500).json({ error: 'Error updating profile: ' + err });
    }
});

// Delete user account
router.delete('/account', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Clear the token cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting account: ' + err });
    }
});

export default router;
