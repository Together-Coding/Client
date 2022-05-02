const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api/containers",
    createProxyMiddleware({
      target: "https://dev-bridge.together-coding.com",
      changeOrigin: true,
    })
  );
};
