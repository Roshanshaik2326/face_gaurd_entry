import express from 'express';
import jwt from 'jsonwebtoken';
import Log from '../models/Log.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Middleware to verify token
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Get all logs for a user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.query.userId || req.userId;
    const limit = parseInt(req.query.limit) || 50;
    const logs = await Log.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Error fetching logs' });
  }
});

// Create a new log entry
router.post('/', authenticate, async (req, res) => {
  try {
    const { userId, recognizedPerson, action } = req.body;
    const logUserId = userId || req.userId;

    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    const log = new Log({
      userId: logUserId,
      recognizedPerson: recognizedPerson || null,
      action
    });

    await log.save();
    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ error: 'Error creating log' });
  }
});

export default router;
