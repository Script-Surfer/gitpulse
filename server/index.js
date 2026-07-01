import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './utils/db.js';
import startCronJobs from './utils/cron.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import repoRoutes from './routes/repo.routes.js';
import savedRoutes from './routes/saved.routes.js';
import historyRoutes from './routes/history.routes.js';

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'GitPulse API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/repos', repoRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/history', historyRoutes);

// Start cron jobs
startCronJobs();

// Start Server
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});