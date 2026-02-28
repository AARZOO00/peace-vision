#!/bin/bash
# ═══════════════════════════════════════════
#   PEACE VISION — Quick Setup Script
#   Run: chmod +x setup.sh && ./setup.sh
# ═══════════════════════════════════════════

set -e

echo ""
echo "✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦"
echo "       PEACE VISION — Setup Script"
echo "✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦"
echo ""

# Check Node
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js 18+ first."
  echo "   Download: https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt "18" ]; then
  echo "❌ Node.js 18+ required. You have $(node --version)"
  exit 1
fi

echo "✅ Node.js $(node --version) found"

# Check if MongoDB is running (optional warning)
if command -v mongod &> /dev/null; then
  echo "✅ MongoDB found"
else
  echo "⚠️  MongoDB not detected locally."
  echo "   You can use MongoDB Atlas (free): https://mongodb.com/atlas"
fi

echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..
echo "✅ Dependencies installed"

# Create .env if it doesn't exist
if [ ! -f backend/.env ]; then
  echo ""
  echo "⚙️  Creating .env from template..."
  cp backend/.env backend/.env.bak 2>/dev/null || true

  # Generate random JWT secret
  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

  cat > backend/.env << ENVEOF
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5000

MONGODB_URI=mongodb://localhost:27017/peacevision

JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=Peace Vision <your_email@gmail.com>

STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_GUIDANCE_PRICE_ID=price_guidance_id
STRIPE_HEALING_PRICE_ID=price_healing_id

ADMIN_EMAIL=admin@peacevision.com
ENVEOF

  echo "✅ .env file created with auto-generated JWT secret"
  echo ""
  echo "⚠️  IMPORTANT: Edit backend/.env with your real credentials:"
  echo "   - MONGODB_URI (MongoDB Atlas connection string)"
  echo "   - EMAIL_USER + EMAIL_PASS (Gmail app password)"
  echo "   - STRIPE_SECRET_KEY (from Stripe dashboard)"
fi

# Create logs directory
mkdir -p logs
echo "✅ Logs directory created"

echo ""
echo "✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦"
echo "         Setup Complete! 🌿"
echo "✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦"
echo ""
echo "  Start development server:"
echo "  $ cd backend && npm run dev"
echo ""
echo "  Then open: http://localhost:5000"
echo ""
echo "  Admin dashboard: http://localhost:5000/admin/"
echo ""
echo "  Next steps:"
echo "  1. Edit backend/.env with your credentials"
echo "  2. Set up MongoDB (local or Atlas)"
echo "  3. Configure Gmail app password"
echo "  4. Add Stripe keys"
echo ""
echo "  Docs: README.md"
echo ""