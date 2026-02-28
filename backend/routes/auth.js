// ══════════════════════════════
//   Auth Route — Register / Login
// ══════════════════════════════

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const { sendAdminNotification, sendClientReply } = require('../config/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// ─── REGISTER ───
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name required').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    // Welcome email
    await sendClientReply({
      to: email, name,
      subject: 'Welcome to Peace Vision 🌿',
      html: `
        <p>Welcome, ${name}! We're so glad you've joined the Peace Vision community.</p>
        <p>Your account has been created. You can now book sessions, track your journey, and access your healing resources.</p>
        <p>Start by booking your complimentary <strong>Heart Connection Call</strong> — a free 30-minute session to understand your needs.</p>
        <p><a href="https://peacevision.com/#contact" style="background:#1a4a5c;color:#fff;padding:10px 24px;border-radius:50px;text-decoration:none;display:inline-block;">Book My Free Call</a></p>
      `,
    }).catch(err => console.error('Welcome email failed:', err.message));

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan, role: user.role },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ─── LOGIN ───
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ─── GET CURRENT USER ───
router.get('/me', require('../middleware/auth').auth, async (req, res) => {
  res.json({ user: req.user });
});

// ─── FORGOT PASSWORD ───
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail(),
], async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return success (security: don't reveal if email exists)
    if (!user) return res.json({ message: 'If this email exists, a reset link has been sent.' });

    // Generate reset token (simple JWT, 1 hour)
    const resetToken = jwt.sign({ id: user._id, purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendClientReply({
      to: email,
      name: user.name,
      subject: 'Reset Your Peace Vision Password',
      html: `
        <p>We received a request to reset your password. Click the link below to create a new password:</p>
        <p><a href="${resetUrl}" style="background:#1a4a5c;color:#fff;padding:10px 24px;border-radius:50px;text-decoration:none;display:inline-block;">Reset My Password</a></p>
        <p style="color:#8899aa;font-size:13px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
      `,
    });

    res.json({ message: 'If this email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to send reset email.' });
  }
});

// ─── RESET PASSWORD ───
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
], async (req, res) => {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== 'reset') throw new Error('Invalid token');

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.password = password;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid or expired reset token.' });
  }
});

// ─── UPDATE PROFILE ───
router.patch('/profile', require('../middleware/auth').auth, async (req, res) => {
  try {
    const allowed = ['name', 'language', 'newsletter'];
    const updates = {};
    allowed.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

module.exports = router;