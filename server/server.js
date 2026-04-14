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
import jwt from 'jsonwebtoken';
import Student from './models/Student.js';
import SystemSetting from './models/SystemSetting.js';

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

// Global enforcement: disabled users + system toggles
app.use('/api', async (req, res, next) => {
  try {
    if (req.path === '/health') return next();

    const token = req.headers.authorization?.split(' ')[1];
    let authUser = null;
    let authRole = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        authUser = await Student.findById(decoded.userId).select('status role email');
        authRole = authUser?.role || decoded.role;
        if (authUser && authUser.status === 'disabled') {
          return res.status(403).json({ message: 'Account is disabled. Contact admin.' });
        }
      } catch {
        // route-level auth will handle invalid tokens if needed
      }
    }

    const settings = await SystemSetting.findOne().select('maintenanceMode lockRegistrations');
    const maintenanceMode = !!settings?.maintenanceMode;
    const lockRegistrations = !!settings?.lockRegistrations;

    if (maintenanceMode) {
      const isAuthRoute = req.path.startsWith('/auth');
      const isAdmin = authRole === 'admin';
      if (!isAuthRoute && !isAdmin) {
        return res.status(503).json({ message: 'System is in maintenance mode' });
      }
    }

    if (
      lockRegistrations &&
      req.method === 'POST' &&
      /^\/events\/[^/]+\/register$/.test(req.path)
    ) {
      return res.status(403).json({ message: 'Registrations are currently locked by admin' });
    }

    next();
  } catch (error) {
    console.error('Global enforcement middleware error:', error);
    next();
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', microsoftAuthRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/events', eventAdminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/club', clubRoutes);

// Default root route
app.get('/', (req, res) => {
  res.send('E-Attend Backend API is up and running!');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'E-Attend API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

