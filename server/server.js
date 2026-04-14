import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import microsoftAuthRoutes from './routes/microsoft-auth.js';
import eventRoutes from './routes/events.js';
import eventAdminRoutes from './routes/events-admin.js';
import profileRoutes from './routes/profile.js';
import adminRoutes from './routes/admin.js';
import supportRoutes from './routes/support.js';
import clubRoutes from './routes/club.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', microsoftAuthRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/events', eventAdminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/club', clubRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'E-Attend API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

