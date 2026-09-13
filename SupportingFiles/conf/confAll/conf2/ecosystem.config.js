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
      },
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: 'logs/pm2.err.log',
      out_file: 'logs/pm2.out.log',
      time: true,
    },
  ],
};