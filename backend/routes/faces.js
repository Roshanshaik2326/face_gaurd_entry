import express from 'express';
import jwt from 'jsonwebtoken';
import Face from '../models/Face.js';
import User from '../models/User.js';

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

// Get all faces for a user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.query.userId || req.userId;
    const faces = await Face.find({ userId }).sort({ createdAt: -1 });
    res.json(faces);
  } catch (error) {
    console.error('Error fetching faces:', error);
    res.status(500).json({ error: 'Error fetching faces' });
  }
});

// Create a new face
router.post('/', authenticate, async (req, res) => {
  try {
    const { userId, name, descriptors, imageUrl } = req.body;
    const faceUserId = userId || req.userId;

    if (!name || !descriptors || !imageUrl) {
      return res.status(400).json({ error: 'Name, descriptors, and imageUrl are required' });
    }

    const face = new Face({
      userId: faceUserId,
      name,
      descriptors,
      imageUrl
    });

    await face.save();
    res.status(201).json(face);
  } catch (error) {
    console.error('Error creating face:', error);
    res.status(500).json({ error: 'Error creating face' });
  }
});

// Delete a face
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const face = await Face.findById(req.params.id);
    
    if (!face) {
      return res.status(404).json({ error: 'Face not found' });
    }

    // Verify ownership
    if (face.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Face.findByIdAndDelete(req.params.id);
    res.json({ message: 'Face deleted successfully' });
  } catch (error) {
    console.error('Error deleting face:', error);
    res.status(500).json({ error: 'Error deleting face' });
  }
});

export default router;
