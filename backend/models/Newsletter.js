// ========== NEWSLETTER MODEL ==========
const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    source: {
        type: String,
        enum: ['website_popup', 'footer', 'landing_page', 'free_guide'],
        default: 'website_popup'
    },
    status: {
        type: String,
        enum: ['active', 'unsubscribed', 'bounced'],
        default: 'active'
    },
    tags: [String],
    subscribedAt: Date,
    unsubscribedAt: Date
}, {
    timestamps: true
});

newsletterSchema.index({ email: 1 });
newsletterSchema.index({ status: 1 });

module.exports = mongoose.model('Newsletter', newsletterSchema);