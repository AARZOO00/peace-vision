FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --only=production
RUN cd backend && npm ci --only=production

# Copy app source
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "backend/server.js"]