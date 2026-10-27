module.exports = {
  apps: [
    {
      name: "vijayagiri-web",
      script: "npm",
      args: "start",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: 3005,
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};
