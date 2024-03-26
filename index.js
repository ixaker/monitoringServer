import dotenv from 'dotenv';
import http from 'http';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path';

import fs from 'fs';
import express from 'express';
import proxy from './src/server/proxy.js';
import next from 'next';

// Запуск WebSocket сервера
import startServer from './src/server/socketServer.js';

startServer();

const dev = process.env.NODE_ENV !== 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const domian = process.env.domian;

const envFilePath = join(__dirname, 'env');
console.log(import.meta.url)
console.log('')

console.log(envFilePath)

const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

if (!fs.existsSync(envFilePath)) {
    const defaultEnvData = `secret=my-secret-key
    domian=monitoring.qpart.com.ua
    botToken=5963182008:AAEAaqku-cJbC6Er7GHgYtVOZuR-8QO1fps
    chatId=672754822`;
  
    fs.writeFileSync(envFilePath, defaultEnvData);
}

const ssl_key = path.join(domian, 'privkey.pem');
const ssl_cert = path.join(domian, 'fullchain.pem');

const httpApp = express();
const app = express();

console.log(ssl_key)
console.log(ssl_cert)

const httpServer = http.createServer(httpApp);
const httpsServer = https.createServer({ key: fs.readFileSync(ssl_key), cert: fs.readFileSync(ssl_cert)}, app);

// Підключення middleware проксі
proxy(app);

httpServer.listen(80, () => {
    console.log('HTTP server is running on port 80');
});

httpsServer.listen(443, () => {
    console.log('Secure server is running on port 443');
});


// conection with nextApp
// nextApp.prepare().then(() => {
//     httpApp.get('*', (req, res) => {
//         return handle(req, res);
//     });

//     app.get('*', (req, res) => {
//         return handle(req, res);
//     });

//     httpApp.use((req, res, next) => {
//         console.log('redirecting to HTTPS');
//         res.redirect('https://' + req.headers.host + req.url);
//     });
    
//     httpServer.listen(80, () => {
//         console.log('HTTP server is running on port 80');
//     });

//     httpsServer.listen(443, () => {
//         console.log('Secure server is running on port 443');
//     });
// });