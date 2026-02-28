// ═══════════════════════════════
//   PM2 Ecosystem — Peace Vision
//   Run: pm2 start ecosystem.config.js
// ═══════════════════════════════

module.exports = {
  apps: [
    {
      name: 'peace-vision-api',
      script: './backend/server.js',
      instances: 'max',          // Use all CPU cores
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      max_memory_restart: '512M',
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],

  deploy: {
    production: {
      user: 'ubuntu',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:yourname/peace-vision.git',
      path: '/var/www/peace-vision',
      'pre-deploy-local': '',
      'post-deploy': 'cd backend && npm install --production && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};