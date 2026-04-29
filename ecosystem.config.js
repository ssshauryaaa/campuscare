// PM2 Ecosystem Config — CampusCare CTF LAN Deployment (Windows)
module.exports = {
  apps: [
    {
      name: "campuscare",
      // On Windows, use node directly with next's server entry point
      script: "node_modules/next/dist/bin/next",
      args: "start --hostname 0.0.0.0 --port 3000",
      cwd: "./",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
