// ══════════════════════════
//   Contact Route
// ══════════════════════════

const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Contact = require('../models/Contact');
const { sendAdminNotification, sendClientReply, contactConfirmationEmail } = require('../config/email');
const { auth, adminOnly } = require('../middleware/auth');

const validateContact = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim().isLength({ max: 30 }),
  body('message').optional().trim().isLength({ max: 2000 }),
  body('service').optional().trim().isLength({ max: 100 }),
  body('source').optional().trim().isLength({ max: 100 }),
];

// POST /api/contact
router.post('/', validateContact, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const { name, email, phone, service, source, message } = req.body;

    const contact = await Contact.create({ name, email, phone, service, source, message, ip: req.ip });

    // Admin notification
    sendAdminNotification({
      subject: `New Contact: ${name} — ${service || 'General Enquiry'}`,
      html: `
        <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
          <tr style="background:rgba(58,184,204,0.08);">
            <td style="padding:12px 16px;color:rgba(248,244,239,0.5);width:120px;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Name</td>
            <td style="padding:12px 16px;color:#f8f4ef;font-weight:bold;">${name}</td>
          </tr>
          <tr><td style="padding:12px 16px;color:rgba(248,244,239,0.5);font-size:11px;letter-spacing:1px;text-transform:uppercase;">Email</td>
            <td style="padding:12px 16px;"><a href="mailto:${email}" style="color:#3ab8cc;">${email}</a></td></tr>
          <tr style="background:rgba(58,184,204,0.04);">
            <td style="padding:12px 16px;color:rgba(248,244,239,0.5);font-size:11px;letter-spacing:1px;text-transform:uppercase;">Phone</td>
            <td style="padding:12px 16px;color:#f8f4ef;">${phone || '—'}</td></tr>
          <tr><td style="padding:12px 16px;color:rgba(248,244,239,0.5);font-size:11px;letter-spacing:1px;text-transform:uppercase;">Service</td>
            <td style="padding:12px 16px;color:#e8b89a;font-weight:bold;">${service || '—'}</td></tr>
          <tr style="background:rgba(58,184,204,0.04);">
            <td style="padding:12px 16px;color:rgba(248,244,239,0.5);font-size:11px;letter-spacing:1px;text-transform:uppercase;">Source</td>
            <td style="padding:12px 16px;color:#f8f4ef;">${source || '—'}</td></tr>
          <tr><td style="padding:12px 16px;color:rgba(248,244,239,0.5);font-size:11px;letter-spacing:1px;text-transform:uppercase;vertical-align:top;">Message</td>
            <td style="padding:12px 16px;color:rgba(248,244,239,0.7);">${message || '—'}</td></tr>
        </table>
        <div style="margin-top:24px;text-align:center;">
          <a href="mailto:${email}" style="display:inline-block;background:linear-gradient(135deg,#1a4a5c,#2a7a8c);color:#f8f4ef;font-family:Arial,sans-serif;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:12px 28px;border-radius:50px;">Reply to ${name}</a>
        </div>
      `,
    }).catch(err => console.error('Admin email failed:', err.message));

    // Client auto-reply with new template
    sendClientReply({
      to: email, name,
      subject: 'We received your message — Peace Vision 🌿',
      html: contactConfirmationEmail(name, service),
    }).catch(err => console.error('Client reply failed:', err.message));

    res.status(201).json({ success: true, id: contact._id });
  } catch (err) {
    console.error('Contact route error:', err);
    res.status(500).json({ error: 'Failed to submit. Please try again.' });
  }
});

// GET /api/contact (admin)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 25, search } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Contact.countDocuments(filter);
    res.json({ contacts, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contacts.' });
  }
});

// GET /api/contact/stats (admin)
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const [total, newCount, contacted, converted] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'new' }),
      Contact.countDocuments({ status: 'contacted' }),
      Contact.countDocuments({ status: 'converted' }),
    ]);
    res.json({ total, new: newCount, contacted, converted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// PATCH /api/contact/:id/status
router.patch('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const valid = ['new', 'contacted', 'converted', 'closed'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status, ...(notes && { notes }) },
      { new: true }
    );
    if (!contact) return res.status(404).json({ error: 'Contact not found.' });
    res.json({ contact });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update contact.' });
  }
});

// DELETE /api/contact/:id
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete contact.' });
  }
});

module.exports = router;