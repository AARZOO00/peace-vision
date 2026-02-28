// ══════════════════════════
//   Payments Route (Stripe)
// ══════════════════════════

const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

const PLANS = {
  guidance: { priceId: process.env.STRIPE_GUIDANCE_PRICE_ID, name: 'Guidance Path', amount: 9700 },
  healing:  { priceId: process.env.STRIPE_HEALING_PRICE_ID, name: 'Healing Path', amount: 19700 },
};

// POST /api/payments/create-checkout
router.post('/create-checkout', async (req, res) => {
  try {
    const { plan, email, name } = req.body;
    const planConfig = PLANS[plan];
    if (!planConfig) return res.status(400).json({ error: 'Invalid plan.' });

    // Get or create Stripe customer
    let user = await User.findOne({ email });
    let customerId = user?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({ email, name });
      customerId = customer.id;
      await User.findOneAndUpdate({ email }, { stripeCustomerId: customerId }, { upsert: true });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/#programs`,
      metadata: { plan, email, name },
      subscription_data: {
        trial_period_days: 0,
        metadata: { plan },
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session.' });
  }
});

// POST /api/payments/create-portal
router.post('/create-portal', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user?.stripeCustomerId) return res.status(404).json({ error: 'No subscription found.' });

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/#programs`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Portal error:', err);
    res.status(500).json({ error: 'Failed to open billing portal.' });
  }
});

// POST /api/payments/webhook (raw body!)
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { email, plan } = session.metadata;
        await User.findOneAndUpdate(
          { email },
          { plan, subscriptionStatus: 'active', stripeSubscriptionId: session.subscription },
          { upsert: true }
        );
        console.log(`✅ New subscriber: ${email} → ${plan}`);
        break;
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.paused': {
        const sub = event.data.object;
        await User.findOneAndUpdate(
          { stripeSubscriptionId: sub.id },
          { subscriptionStatus: 'canceled', plan: 'none' }
        );
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await User.findOneAndUpdate(
          { stripeCustomerId: invoice.customer },
          { subscriptionStatus: 'past_due' }
        );
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        await User.findOneAndUpdate(
          { stripeCustomerId: invoice.customer },
          { subscriptionStatus: 'active' }
        );
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ error: 'Webhook processing failed.' });
  }
});

module.exports = router;