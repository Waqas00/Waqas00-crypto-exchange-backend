const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.admin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ message: 'Admin only' });
};
