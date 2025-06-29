const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, country, referral, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Missing required fields' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    const user = await User.create({ name, email, country, referral, password });
    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        country: user.country,
        referral: user.referral,
        role: user.role,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Missing email or password' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(400).json({ message: 'Invalid password' });

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        country: user.country,
        referral: user.referral,
        role: user.role,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
});

// Get logged in user
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
