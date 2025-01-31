module.exports = {
    apps: [
      {
        name: "hgh_bot",
        script: "hgh_bot.js",
        exec_mode: "fork",
        watch: false
      },
      {
        name: "api_server",
        script: "api.py",
        exec_mode: "fork",
        interpreter: "python3", // Укажи правильную версию Python, если нужно
        watch: false
      }
    ]
  };