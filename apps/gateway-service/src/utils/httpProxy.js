const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      '^/api/users': '',
    },
  });