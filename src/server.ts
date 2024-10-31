import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './models/database';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import employeeRoutes from './routes/employeeRoutes';
import intercomRoutes from './routes/intercomRoutes'; 
import slackRoutes from './routes/slackRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Registering routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/intercom', intercomRoutes); 
app.use('/api/slack', slackRoutes); 

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
