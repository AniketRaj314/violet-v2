module.exports = {
  apps: [
    {
      name: "violet",
      script: "pnpm",
      args: "start",
      interpreter: "sh",
      cwd: "/home/spider31415/path/to/violet-v2", // Update this path to your actual project path on the Pi
      env: {
        NODE_ENV: "production"
      },
      error_file: "./logs/violet-error.log",
      out_file: "./logs/violet-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G"
    }
  ]
};





