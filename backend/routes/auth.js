import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({ 
        error: 'Please provide email, password, and full name' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      fullName
    });

    // Save user to MongoDB
    await user.save();
    
    console.log('✅ User registered and saved to MongoDB:', {
      id: user._id,
      email: user.email,
      fullName: user.fullName
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: error.message || 'Error creating account' 
    });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Please provide email and password' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    console.log('✅ User logged in from MongoDB:', {
      id: user._id,
      email: user.email,
      fullName: user.fullName
    });

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: error.message || 'Error during login' 
    });
  }
});

// Verify Token Route (for protected routes)
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer token

    if (!token) {
      return res.status(401).json({ 
        error: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ 
        error: 'User not found' 
      });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ 
      error: 'Invalid or expired token' 
    });
  }
});

export default router;
