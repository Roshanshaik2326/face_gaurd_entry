import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import facesRoutes from './routes/faces.js';
import logsRoutes from './routes/logs.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://srihamsinimrunalini21_db_user:egWLS8BJ2QvflfDt@cluster0.fkpyxvf.mongodb.net/face-entry-guard?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
  console.log('📊 Database:', mongoose.connection.db.databaseName);
  console.log('🔗 Connection Status: Connected');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  console.error('⚠️  Please check your MONGODB_URI in .env file');
  console.error('⚠️  Make sure your IP is whitelisted in MongoDB Atlas Network Access');
  console.error('⚠️  Verify your MongoDB Atlas cluster is running');
  console.error('⚠️  Check your internet connection');
  process.exit(1);
});

// Log MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected - attempting to reconnect...');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/faces', facesRoutes);
app.use('/api/logs', logsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Face Entry Guard Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      faces: '/api/faces',
      logs: '/api/logs'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});