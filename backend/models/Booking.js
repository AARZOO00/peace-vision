const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  service: { type: String, required: true },
  preferredDate: { type: Date },
  preferredTime: { type: String },
  timezone: { type: String, default: 'UTC' },
  notes: { type: String, trim: true, maxlength: 1000 },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  meetLink: { type: String },
  calendarEventId: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

bookingSchema.index({ email: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ preferredDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);