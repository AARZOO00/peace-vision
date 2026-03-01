// ══════════════════════════
//   Newsletter Route
// ══════════════════════════

const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const User = require('../models/User');
const { sendClientReply, newsletterWelcomeEmail } = require('../config/email');
const { auth, adminOnly } = require('../middleware/auth');

// POST /api/newsletter — subscribe
router.post('/', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('name').optional().trim().isLength({ max: 100 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const { email, name = 'Friend', source = 'website' } = req.body;

    // Find or create user record
    let user = await User.findOne({ email });
    const alreadySubscribed = user?.newsletter;

    if (!user) {
      user = await User.create({ email, name, newsletter: true, plan: 'none' });
    } else if (!user.newsletter) {
      user.newsletter = true;
      await user.save({ validateBeforeSave: false });
    }

    if (!alreadySubscribed) {
      // Welcome email
      sendClientReply({
        to: email,
        name,
        subject: 'You\'re in — Weekly Soul Wisdom from Peace Vision 🌿',
        html: newsletterWelcomeEmail(name),
      }).catch(err => console.error('Newsletter welcome email failed:', err.message));
    }

    res.status(alreadySubscribed ? 200 : 201).json({
      success: true,
      message: alreadySubscribed ? 'Already subscribed!' : 'Successfully subscribed.',
    });
  } catch (err) {
    console.error('Newsletter error:', err);
    res.status(500).json({ error: 'Failed to subscribe. Please try again.' });
  }
});

// GET /api/newsletter/count (admin)
router.get('/count', auth, adminOnly, async (req, res) => {
  try {
    const count = await User.countDocuments({ newsletter: true });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subscriber count.' });
  }
});

// GET /api/newsletter/subscribers (admin — paginated)
router.get('/subscribers', auth, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const subscribers = await User.find({ newsletter: true })
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await User.countDocuments({ newsletter: true });
    res.json({ subscribers, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subscribers.' });
  }
});

// DELETE /api/newsletter/unsubscribe
router.post('/unsubscribe', [
  body('email').isEmail().normalizeEmail(),
], async (req, res) => {
  try {
    await User.findOneAndUpdate(
      { email: req.body.email },
      { newsletter: false },
      { new: true }
    );
    res.json({ success: true, message: 'Successfully unsubscribed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unsubscribe.' });
  }
});

module.exports = router;