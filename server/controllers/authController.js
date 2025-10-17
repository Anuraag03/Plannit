//authController.js

//dependency imports
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

//mongodb schemas import
import userSchema from '../models/userModel.js';

//mongoDB collections initiation
const User = mongoose.model('User',userSchema);

// Helper function to generate JWT token
const generateToken = (userId, email) => {
    return jwt.sign(
        { userId, email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
};

// Helper function to set token as cookie
const setTokenCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true, // Prevents client-side JS from accessing the cookie
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict', // CSRF protection
        maxAge: 60 * 60 * 1000 // 1 hour
    });
};

export const loginUser = async (req,res)=>{
    try{
    const {email,password} = req.body;
    const user = await User.findOne({email: email});
    if(!user){
        return  res.status(404).json({error: 'User not found'});
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        return  res.status(401).json({error: 'Invalid credentials'});
    }
    
    // Generate JWT token
    const token = generateToken(user._id, user.email);
    
    // Set token as cookie
    setTokenCookie(res, token);
    
    res.status(200).json({
        message: 'Login successful',
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
    }
    catch(err){
        res.status(500).json({error: 'Error logging in: '+err});
    }

};

export const signupUser = async (req,res)=>{
    try{
    const {username,email,password} = req.body;
    const hashedPass = await bcrypt.hash(password,10);
    await User.create({username: username, email: email, password: hashedPass});
    res.status(201).json({message: 'User created successfully'});
    }
    catch(err){
        res.status(500).json({error: 'Error creating user: '+err});
    }

}

export const logoutUser = (req, res) => {
    try {
        // Clear the token cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        res.status(500).json({ error: 'Error logging out: ' + err });
    }
};
