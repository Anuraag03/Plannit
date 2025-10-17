//index.js

//dependency imports
import express from 'express';
import 'dotenv/config'
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

//router imports
import authRouter from './routers/authRouter.js';

//middleware imports
import { authenticateToken } from './middleware/authMiddleware.js';

const app = express();
app.use(express.json());
app.use(cookieParser());

//mongoDB connection
mongoose.connect(process.env.MONGO_URI);



//use routers
app.use('/auth',authRouter);
app.get('/',(req,res)=>{
    res.send('Landing');
});
app.get('/home', authenticateToken, (req,res)=>{
    res.send(`Home`);
});

app.listen(process.env.PORT||3000,()=>{
    console.log('Server running on PORT '+process.env.PORT||3000)
});