const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/',
        createProxyMiddleware({
            target: 'http://localhost:3000', // Адреса вашого сервера Next.js
            changeOrigin: true,
        })
    );
};
