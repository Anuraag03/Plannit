//authRouter.js

//dependency imports
import express from 'express';

//controller functions imports
import { loginUser, signupUser, logoutUser } from '../controllers/authController.js';

//router initiation
const router = express.Router();

//routes
router.post('/login',loginUser);
router.post('/signup',signupUser);
router.post('/logout',logoutUser);

export default router;