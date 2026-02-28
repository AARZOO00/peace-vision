# ✦ Peace Vision — Complete Codebase

> Soul-Led Healing Website · Full-Stack · Production-Ready

---

## 📁 Project Structure

```
peace-vision/
├── frontend/                    # Static frontend
│   ├── index.html               # Main website (hero, services, quiz, programs, testimonials, contact)
│   ├── blog.html                # Soul Journal blog page
│   ├── success.html             # Post-booking/payment thank-you page
│   ├── 404.html                 # Custom 404 error page
│   ├── privacy.html             # Privacy Policy
│   ├── terms.html               # Terms of Service
│   ├── css/styles.css           # Full design system (Midnight Teal + Rose Gold palette)
│   ├── js/
│   │   ├── main.js              # Nav, mobile menu, FAQ, service filters, smooth scroll
│   │   ├── animations.js        # Scroll reveals, parallax, counters, slider, cursor, magnetic
│   │   ├── forms.js             # Contact form, guide popup, cookies
│   │   ├── ai-features.js       # Soul Guide AI chat + Healing Path Quiz (Claude API)
│   │   ├── particles.js         # Canvas particles with mouse repulsion
│   │   └── sw.js                # Service worker (PWA offline support)
│   └── manifest.json            # PWA manifest
├── backend/                     # Node.js / Express API
│   ├── server.js                # Main server entry point
│   ├── Dockerfile               # Docker image
│   ├── .env                     # Environment variables template
│   ├── config/
│   │   ├── database.js          # MongoDB/Mongoose connection
│   │   └── email.js             # Nodemailer + branded email templates
│   ├── models/
│   │   ├── User.js              # Users (auth, subscriptions, newsletter)
│   │   ├── Contact.js           # Contact form submissions
│   │   └── Booking.js           # Session booking requests
│   ├── routes/
│   │   ├── auth.js              # Register, login, forgot/reset password, profile
│   │   ├── contact.js           # Contact form CRUD + admin stats
│   │   ├── newsletter.js        # Subscribe, unsubscribe, subscriber list
│   │   ├── payments.js          # Stripe checkout sessions + webhooks
│   │   └── bookings.js          # Session booking CRUD + confirmation emails
│   └── middleware/
│       ├── auth.js              # JWT auth + adminOnly middleware
│       └── validation.js        # Input validation helpers
├── admin/                       # Admin dashboard (JWT-protected)
│   ├── index.html               # Full admin UI with login screen
│   └── js/admin.js              # Dashboard logic (auth, contacts, bookings, subscribers)
├── docker-compose.yml           # MongoDB + Backend + Nginx in one command
├── nginx.conf                   # Nginx: HTTPS, gzip, API proxy, SPA routing
├── ecosystem.config.js          # PM2 cluster config for VPS
├── vercel.json                  # Vercel deployment config
├── setup.sh                     # One-click setup script
├── .gitignore                   # Git ignore rules
├── .htaccess                    # Apache config (shared hosting)
├── robots.txt                   # SEO robots
└── sitemap.xml                  # XML sitemap (all pages)
```

---

## 🚀 Quick Start

### Easiest: Run the setup script

```bash
cd peace-vision
chmod +x setup.sh && ./setup.sh
```

This installs dependencies, creates `.env`, and gives you next steps.

### Manual setup

```bash
cd backend
npm install
# Edit .env with your values (MongoDB URI, email, Stripe, Anthropic)
npm run dev
```

Open: **http://localhost:5000**  
Admin: **http://localhost:5000/admin/**

---

## ⚙️ Environment Variables

Edit `backend/.env`:

| Variable | Description | Required |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET` | 64-char random string for JWT | ✅ |
| `EMAIL_HOST` | SMTP host (smtp.gmail.com) | ✅ |
| `EMAIL_USER` | Gmail address | ✅ |
| `EMAIL_PASS` | Gmail App Password (16 chars) | ✅ |
| `ADMIN_EMAIL` | Where admin notifications go | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret key | For payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | For payments |
| `STRIPE_GUIDANCE_PRICE_ID` | Price ID for $97/month plan | For payments |
| `STRIPE_HEALING_PRICE_ID` | Price ID for $197/month plan | For payments |
| `ANTHROPIC_API_KEY` | For Soul Guide AI + Healing Quiz | For AI features |
| `FRONTEND_URL` | Your domain (https://peacevision.com) | Production |

---

## 🔐 Admin Dashboard

Access: `yourdomain.com/admin/`

The admin dashboard is **JWT-protected** — you must log in with an admin account.

### Creating the first admin account

```bash
# In your backend directory, run this one-time script:
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User');
  const user = await User.create({
    name: 'Admin',
    email: 'admin@peacevision.com',
    password: 'your_secure_password_here',
    role: 'admin'
  });
  console.log('Admin created:', user.email);
  process.exit(0);
});
"
```

### Admin features
- **Overview** — Live stats: contacts, bookings, subscribers, Stripe revenue link
- **Contacts** — Search, filter by status, mark contacted/converted, delete
- **Bookings** — Confirm (with meet link + auto-email), cancel, delete
- **Subscribers** — Full subscriber list with join dates

---

## 💳 Stripe Setup

1. Create account at [stripe.com](https://stripe.com)
2. Create two **Subscription** products in Stripe Dashboard:
   - **Guidance Path**: $97/month
   - **Healing Path**: $197/month
3. Copy the **Price IDs** to your `.env`
4. Add webhook endpoint: `https://yourdomain.com/api/payments/webhook`
5. Select events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.payment_succeeded`

---

## 📧 Email Setup (Gmail)

1. Enable **2FA** on your Google account
2. Go to: Google Account → Security → **App Passwords**
3. Generate an app password for "Mail"
4. Use that 16-character password in `EMAIL_PASS`

---

## 🤖 AI Features

### Soul Guide Chat
A floating chat widget (bottom-left) powered by Claude API. Users can ask about services, express how they're feeling, and get personalised service recommendations.

### Healing Path Quiz
A 4-question quiz that analyses answers and uses Claude to generate a personalised healing path recommendation.

**To enable:** Add your `ANTHROPIC_API_KEY` to `.env`. The frontend currently calls the Claude API directly via `api.anthropic.com`. For production security, proxy this through your backend.

---

## 🌐 Deployment Options

### Option A: Docker (recommended for VPS)

```bash
# Set environment variables
cp backend/.env.example backend/.env
# Edit .env with your values

# Start everything
docker-compose up -d

# Site is live at http://your-server-ip
```

### Option B: VPS + PM2 (no Docker)

```bash
# Install PM2
npm install -g pm2

# Upload files, install deps
cd backend && npm install --production

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Configure Nginx with nginx.conf
```

### Option C: Vercel (frontend) + Railway (backend)

1. Deploy `frontend/` to [Vercel](https://vercel.com)
2. Deploy `backend/` to [Railway](https://railway.app) with MongoDB Atlas
3. Set `FRONTEND_URL` to your Vercel URL
4. Set `vercel.json` `CORS` origin

---

## 🎨 Design System

| Property | Value |
|---|---|
| Display Font | Playfair Display |
| Body Font | DM Sans |
| Decorative Font | Cinzel Decorative |
| Background (dark) | `#0a0f1a` (Midnight) |
| Teal | `#3ab8cc` (Glow) / `#1a4a5c` (Deep) |
| Rose Gold | `#d4956a` |
| Pearl | `#f8f4ef` |

---

## ✅ Complete Feature Checklist

**Frontend**
- ✅ Responsive design (mobile-first)
- ✅ Animated hero with particle canvas + mouse repulsion
- ✅ Floating orbs / mesh gradient background
- ✅ Custom cursor (desktop)
- ✅ Scroll progress bar
- ✅ Scroll reveal animations (4 types + stagger + parallax)
- ✅ Elastic counter animations
- ✅ Testimonials auto-play slider
- ✅ Service filter by category
- ✅ FAQ accordion
- ✅ Cookie consent banner
- ✅ Guide download popup
- ✅ Floating CTA button
- ✅ Language switcher
- ✅ PWA / service worker
- ✅ SEO meta tags + Open Graph
- ✅ Blog / Soul Journal page
- ✅ Thank-you / Success page (with confetti)
- ✅ Custom 404 page
- ✅ Privacy Policy page
- ✅ Terms of Service page

**AI Features**
- ✅ Soul Guide AI Chat (Claude API, floating widget)
- ✅ AI Healing Path Quiz (4 questions + personalised AI recommendation)

**Backend**
- ✅ Express REST API
- ✅ MongoDB with Mongoose
- ✅ JWT authentication (register, login, forgot/reset password)
- ✅ Admin role protection
- ✅ Contact form with email notifications + templates
- ✅ Newsletter subscription + welcome email
- ✅ Stripe subscription checkout
- ✅ Stripe webhook handler (subscription lifecycle)
- ✅ Session booking system + confirmation emails
- ✅ Rate limiting + security headers (helmet)
- ✅ Input validation
- ✅ Health check endpoint
- ✅ Gzip compression

**Admin Dashboard**
- ✅ Login screen (JWT auth, admin-only)
- ✅ Overview with live stats
- ✅ Contact management (search, filter, mark contacted/converted, delete)
- ✅ Booking management (confirm with meet link + auto-email, cancel, delete)
- ✅ Subscriber list with full pagination

**Deployment**
- ✅ Dockerfile (backend)
- ✅ docker-compose.yml (full stack)
- ✅ nginx.conf (HTTPS, proxy, SPA routing)
- ✅ PM2 ecosystem config
- ✅ Vercel config
- ✅ Setup script
- ✅ .gitignore
- ✅ sitemap.xml (all pages)
- ✅ robots.txt

---

*Made with ❤️ for healing souls.*