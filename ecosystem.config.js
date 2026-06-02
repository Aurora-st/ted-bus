module.exports = {
  apps: [
    {
      name: 'ted-bus-backend',
      cwd: './backend',
      script: 'src/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      out_file: './logs/combined.log',
      error_file: './logs/error.log',
      time: true
    }
  ]
};

