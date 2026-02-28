// ══════════════════════════
//   Bookings Route
// ══════════════════════════

const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Booking = require('../models/Booking');
const { sendAdminNotification, sendClientReply, bookingConfirmationEmail } = require('../config/email');
const { auth, adminOnly } = require('../middleware/auth');

// POST /api/bookings
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name required').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('service').trim().notEmpty().withMessage('Service required'),
  body('phone').optional().trim().isLength({ max: 30 }),
  body('notes').optional().trim().isLength({ max: 1000 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const { name, email, phone, service, preferredDate, preferredTime, timezone, notes } = req.body;

    const booking = await Booking.create({
      name, email, phone, service, notes, timezone,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
      preferredTime,
    });

    // Admin notification
    sendAdminNotification({
      subject: `New Booking: ${name} — ${service}`,
      html: `
        <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
          <tr style="background:rgba(58,184,204,0.08);"><td style="padding:12px 16px;color:rgba(248,244,239,0.5);font-size:11px;letter-spacing:1px;text-transform:uppercase;width:120px;">Name</td><td style="padding:12px 16px;color:#f8f4ef;font-weight:bold;">${name}</td></tr>
          <tr><td style="padding:12px 16px;color:rgba(248,244,239,0.5);font-size:11px;letter-spacing:1px;text-transform:uppercase;">Email</td><td style="padding:12px 16px;"><a href="mailto:${email}" style="color:#3ab8cc;">${email}</a></td></tr>
          <tr style="background:rgba(58,184,204,0.04);"><td style="padding:12px 16px;color:rgba(248,244,239,0.5);font-size:11px;letter-spacing:1px;text-transform:uppercase;">Service</td><td style="padding:12px 16px;color:#e8b89a;font-weight:bold;">${service}</td></tr>
          <tr><td style="padding:12px 16px;color:rgba(248,244,239,0.5);font-size:11px;letter-spacing:1px;text-transform:uppercase;">Date</td><td style="padding:12px 16px;color:#f8f4ef;">${preferredDate || '—'} ${preferredTime || ''}</td></tr>
          <tr style="background:rgba(58,184,204,0.04);"><td style="padding:12px 16px;color:rgba(248,244,239,0.5);font-size:11px;letter-spacing:1px;text-transform:uppercase;">Notes</td><td style="padding:12px 16px;color:rgba(248,244,239,0.7);">${notes || '—'}</td></tr>
        </table>
        <div style="text-align:center;margin-top:24px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/admin/" style="display:inline-block;background:linear-gradient(135deg,#d4956a,#e8b89a);color:#1a1f2e;font-family:Arial,sans-serif;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:12px 28px;border-radius:50px;">Confirm in Admin →</a>
        </div>
      `,
    }).catch(err => console.error('Admin email failed:', err.message));

    // Client confirmation
    sendClientReply({
      to: email, name,
      subject: 'Your Heart Connection Call is Received 🌿',
      html: bookingConfirmationEmail(name, service, preferredDate || null, null),
    }).catch(err => console.error('Client reply failed:', err.message));

    res.status(201).json({ success: true, bookingId: booking._id });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Failed to create booking.' });
  }
});

// GET /api/bookings (admin)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 25 } = req.query;
    const filter = (status && status !== 'all') ? { status } : {};
    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Booking.countDocuments(filter);
    res.json({ bookings, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

// GET /api/bookings/stats
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const [total, pending, confirmed, cancelled] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'cancelled' }),
    ]);
    res.json({ total, pending, confirmed, cancelled });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// PATCH /api/bookings/:id (admin)
router.patch('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { status, meetLink, confirmedDate } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (meetLink) updateData.meetLink = meetLink;
    if (confirmedDate) updateData.confirmedDate = new Date(confirmedDate);

    const booking = await Booking.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    // Send confirmation email when confirmed
    if (status === 'confirmed') {
      const dateStr = booking.confirmedDate
        ? new Date(booking.confirmedDate).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + (booking.preferredTime ? ` at ${booking.preferredTime}` : '')
        : null;

      sendClientReply({
        to: booking.email,
        name: booking.name,
        subject: '✅ Your Session is Confirmed — Peace Vision',
        html: bookingConfirmationEmail(booking.name, booking.service, dateStr, meetLink || booking.meetLink),
      }).catch(err => console.error('Confirmation email failed:', err.message));
    }

    if (status === 'cancelled') {
      sendClientReply({
        to: booking.email,
        name: booking.name,
        subject: 'Your Peace Vision Session — Update',
        html: `<p>We're sorry to let you know that your session for <strong>${booking.service}</strong> has been cancelled.</p>
               <p>Please reach out to us at <a href="mailto:hello@peacevision.com" style="color:#3ab8cc;">hello@peacevision.com</a> to reschedule — we'd love to find a time that works for you.</p>`,
      }).catch(console.error);
    }

    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update booking.' });
  }
});

// DELETE /api/bookings/:id (admin)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete booking.' });
  }
});

module.exports = router;