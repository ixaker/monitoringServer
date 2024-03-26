import { createProxyMiddleware } from 'http-proxy-middleware';

const proxyMiddleware = (app) => {
    app.use(
        '/',
        createProxyMiddleware({
            target: 'http://localhost:3000', // Адреса вашого сервера Next.js
            changeOrigin: true,
        })
    );
};

export default proxyMiddleware;