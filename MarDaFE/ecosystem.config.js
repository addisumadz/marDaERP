module.exports = {
  apps: [
    {
      name: 'wbill-frontend',
      cwd: '.',                 // run in project root
      script: 'npm',
      args: 'run start',
      instances: 1,             // increase if you want clustering
      exec_mode: 'fork',        // or 'cluster'
      watch: false,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        BACKEND_URL: 'http://localhost:9092',  // server-side only, never reaches browser
      },
      env_production: {
        NODE_ENV: 'production',
        BACKEND_URL: 'http://localhost:9092',  // server-side only, never reaches browser
      },
      error_file: 'logs/pm2.err.log',
      out_file: 'logs/pm2.out.log',
      time: true,
    },
  ],
};